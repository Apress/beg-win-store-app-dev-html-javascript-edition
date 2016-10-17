/// <reference path="//Microsoft.WinJS.1.0/js/ui.js" />
/// <reference path="//Microsoft.WinJS.1.0/js/base.js" />
/// <reference path="/js/debug.js" />
/// <reference path="/js/extensions.js" />
/// <reference path="project.js" />
/// <reference path="timeEntry.js" />

(function () {
    "use strict";

    var data = Clok.Data;

    var _openDb = new WinJS.Promise(function (comp, err) {
        var db;

        var request = indexedDB.open("Clok", 1);

        request.onerror = err;
        request.onupgradeneeded = function (e) {
            var upgradedDb = e.target.result;
            if (e.oldVersion < 1) {
                // Version 1: the initial version of the database
                upgradedDb.createObjectStore("projects", { keyPath: "id", autoIncrement: false });
                upgradedDb.createObjectStore("timeEntries", { keyPath: "id", autoIncrement: false });
            }
            if (e.oldVersion < 2) {
                // Version 2: data updated to use GUIDs for id values
                // TODO - modify all projects and time entries 
            }
        };

        // Load the data source with data from the database
        request.onsuccess = function () {
            db = request.result;

            _refreshFromDb(db).done(function () {
                comp(db);
            }, function (errorEvent) {
                err(errorEvent);
            });
        };
    });

    var _refreshFromDb = function (db) {
        return new WinJS.Promise(function (comp, err) {
            while (storage.projects.pop()) { }
            while (storage.timeEntries.pop()) { }
            var transaction = db.transaction(["projects", "timeEntries"]);

            transaction.objectStore("projects").openCursor().onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    var project = data.Project.createFromDeserialized(cursor.value);
                    storage.projects.push(project);
                    cursor.continue();
                };
            };

            transaction.objectStore("timeEntries").openCursor().onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    var timeEntry = data.TimeEntry.createFromDeserialized(cursor.value);
                    storage.timeEntries.push(timeEntry);
                    cursor.continue();
                };
            };

            transaction.oncomplete = comp;
            transaction.onerror = err;
        });
    }

    var _getObjectStore = function (db, objectStoreName, mode) {
        mode = mode || "readonly";

        return new WinJS.Promise(function (comp, err) {

            var transaction = db.transaction(objectStoreName, mode);

            comp(transaction.objectStore(objectStoreName));

            transaction.onerror = err;
        });
    };

    var _saveObject = function (objectStore, object) {
        return new WinJS.Promise(function (comp, err) {
            var request = objectStore.put(object);
            request.onsuccess = comp;
            request.onerror = err;
        });
    };

    var _deleteObject = function (objectStore, id) {
        return new WinJS.Promise(function (comp, err) {
            var request = objectStore.delete(id);
            request.onsuccess = comp;
            request.onerror = err;
        });
    };

    var storage = WinJS.Class.define(
        function constructor() {/* only static members in this class */ },
        { /* only static members in this class */ },
        {
            // static members

            initialize: function () {
                return _openDb;
            },

            projects: new WinJS.Binding.List([]),
            clients: {
                get: function () {
                    return new WinJS.Binding.List(storage.projects
                        .map(function (p) { return p.clientName; }) // make array of just client names
                        .sort()                                     // sort them so duplicates are adjacent
                        .reduce(function (accumulated, current) {   // create a new array where each item is added only once
                            if (current !== accumulated[accumulated.length - 1]) {
                                accumulated[accumulated.length] = current;
                            }
                            return accumulated;
                        }, [])
                    );
                }
            },


            compareProjects: function (left, right) {
                // first sort by client name...
                if (left.clientName !== right.clientName) {
                    return (left.clientName > right.clientName) ? 1 : -1;
                }

                // then sort by project name...
                if (left.name !== right.name) {
                    return (left.name > right.name) ? 1 : -1;
                }

                return 0;
            },

            compareProjectGroups: function (left, right) {
                return left.toUpperCase().charCodeAt(0) - right.toUpperCase().charCodeAt(0);
            },

            getProjectGroupKey: function (dataItem) {
                return dataItem.clientName.toUpperCase().charAt(0);
            },

            getProjectGroupData: function (dataItem) {
                return {
                    name: dataItem.clientName.toUpperCase().charAt(0)
                }
            },

            groupedProjects: {
                get: function () {
                    var grouped = storage.projects.createGrouped(
                            storage.getProjectGroupKey,
                            storage.getProjectGroupData,
                            storage.compareProjectGroups);

                    return grouped;
                }
            },





            timeEntries: new WinJS.Binding.List([]),

            compareTimeEntries: function (left, right) {
                // first sort by date worked...
                var dateCompare = left.dateWorked.getTime() - right.dateWorked.getTime();
                if (dateCompare !== 0) {
                    return dateCompare;
                }

                // then sort by client name...
                if (left.project.clientName !== right.project.clientName) {
                    return (left.project.clientName > right.project.clientName) ? 1 : -1;
                }

                // then sort by project name...
                if (left.project.name !== right.project.name) {
                    return (left.project.name > right.project.name) ? 1 : -1;
                }

                return 0;
            },
        }
    );

    storage.projects.getGroupedProjectsByStatus = function (statuses) {
        var filtered = this
            .createFiltered(function (p) {
                return statuses.indexOf(p.status) >= 0;
            });



        var grouped = filtered
            .createSorted(storage.compareProjects)
            .createGrouped(
                storage.getProjectGroupKey,
                storage.getProjectGroupData,
                storage.compareProjectGroups);

        return grouped;
    };

    storage.projects.getById = function (id) {
        if (id) {
            var matches = this.filter(function (p) { return p.id === id; });
            if (matches && matches.length === 1) {
                return matches[0];
            }
        }
        return undefined;
    };

    storage.projects.save = function (p) {
        if (p && p.id) {
            var existing = storage.projects.getById(p.id);
            if (!existing) {
                storage.projects.push(p);
            }

            return _openDb.then(function (db) {
                return _getObjectStore(db, "projects", "readwrite");
            }).then(function (store) {
                return _saveObject(store, p);
            });
        }

        return WinJS.Promise.as();
    };

    storage.projects.delete = function (p, permanent) {
        permanent = permanent || false;

        if (p && p.id) {
            if (!permanent) {
                var existing = storage.projects.getById(p.id);
                if (existing) {
                    // soft delete = default
                    existing.status = data.ProjectStatuses.Deleted;
                    return storage.projects.save(existing);
                }
            } else {
                var index = this.indexOf(p);
                if (index >= 0) {
                    this.splice(index, 1);

                    return _openDb.then(function (db) {
                        return _getObjectStore(db, "projects", "readwrite");
                    }).then(function (store) {
                        return _deleteObject(store, p.id);
                    });
                }
            }
        }
        return WinJS.Promise.as();
    };





    storage.timeEntries.getSortedFilteredTimeEntriesAsync = function (begin, end, projectId) {
        return new WinJS.Promise(function (complete, error) {
            setTimeout(function () {
                try {

                    var filtered = this
                        .createFiltered(function (te) {
                            if (begin) {
                                if (te.dateWorked < begin) return false;
                            }

                            if (end) {
                                if (te.dateWorked >= end.addDays(1)) return false;
                            }

                            if (projectId && ClokUtilities.Guid.isGuid(projectId)) {
                                if (te.projectId !== projectId) return false;
                            }

                            if (!te.project || te.project.status !== data.ProjectStatuses.Active) return false;

                            return true;
                        });

                    var sorted = filtered.createSorted(storage.compareTimeEntries);

                    //// simulate a delay
                    //for (var i = 1; i <= 10000000; i++) { }

                    //// simulate an error
                    //throw 0;

                    complete(sorted);
                } catch (e) {
                    error(e);
                }
            }.bind(this), 10);
        }.bind(this));
    };

    storage.timeEntries.getById = function (id) {
        if (id) {
            var matches = this.filter(function (te) { return te.id === id; });
            if (matches && matches.length === 1) {
                return matches[0];
            }
        }
        return undefined;
    };

    storage.timeEntries.save = function (te) {
        if (te && te.id) {
            var existing = storage.timeEntries.getById(te.id);
            if (!existing) {
                storage.timeEntries.push(te);
            }

            return _openDb.then(function (db) {
                return _getObjectStore(db, "timeEntries", "readwrite");
            }).then(function (store) {
                return _saveObject(store, te);
            });
        }

        return WinJS.Promise.as();
    };

    storage.timeEntries.delete = function (te) {
        if (te && te.id) {
            var index = this.indexOf(te);
            if (index >= 0) {
                this.splice(index, 1);

                return _openDb.then(function (db) {
                    return _getObjectStore(db, "timeEntries", "readwrite");
                }).then(function (store) {
                    return _deleteObject(store, te.id);
                });
            }
        }

        return WinJS.Promise.as();
    };







    WinJS.Namespace.define("Clok.Data", {
        Storage: storage,
    });

})();
