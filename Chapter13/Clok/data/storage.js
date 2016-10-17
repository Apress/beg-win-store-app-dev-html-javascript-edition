/// <reference path="//Microsoft.WinJS.1.0/js/base.js" />
/// <reference path="/js/debug.js" />
/// <reference path="/js/extensions.js" />
/// <reference path="project.js" />
/// <reference path="timeEntry.js" />

(function () {
    "use strict";

    var storage = WinJS.Class.define(
        function constructor() {/* only static members in this class */ },
        { /* only static members in this class */ },
        {
            // static members

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
        }
    };

    storage.projects.delete = function (p) {
        if (p && p.id) {
            var existing = storage.projects.getById(p.id);
            if (existing) {
                existing.status = Clok.Data.ProjectStatuses.Deleted;
                storage.projects.save(existing);
            }
        }
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

                            if (projectId && !isNaN(projectId) && Number(projectId) > 0) {
                                if (te.projectId !== Number(projectId)) return false;
                            }

                            if (te.project.status !== Clok.Data.ProjectStatuses.Active) return false;

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
        }
    };

    storage.timeEntries.delete = function (te) {
        var cancelled = false;

        var delPromise = new WinJS.Promise(function (complete, error) {
            setTimeout(function () {
                try {
                    if (te && te.id) {
                        var index = this.indexOf(te);
                        if (!cancelled && index >= 0) {
                            this.splice(index, 1);
                        }
                    }
                    complete();
                } catch (e) {
                    error(e);
                }
            }.bind(this), 100);
        }.bind(this),
        function oncancel(arg) {
            cancelled = true;
        }.bind(this));

        return delPromise;
        //return WinJS.Promise.timeout(20, delPromise);
    };




    WinJS.Namespace.define("Clok.Data", {
        Storage: storage,
    });

})();


// add temp data
(function () {
    var createProject = function (name, projectNumber, clientName, id, status) {
        var newProject = new Clok.Data.Project();
        newProject.id = id;
        newProject.name = name;
        newProject.projectNumber = projectNumber;
        newProject.clientName = clientName;
        newProject.status = status || newProject.status;

        return newProject;
    }

    var projects = Clok.Data.Storage.projects;

    var name1 = "Windows Store App";
    var name2 = "Mobile Website";
    var name3 = "Website Redesign";
    var name4 = "Employee Portal";

    var client1 = "Northwind Traders";
    var client2 = "Contoso Ltd.";
    var client3 = "AdventureWorks Cycles";
    var client4 = "TailSpin Toys";
    var client5 = "A. Datum Corporation";
    var client6 = "Woodgrove Bank";
    var client7 = "Fabrikam, Inc.";

    projects.push(createProject(name1, "2012-0003", client1, 1368296808745, Clok.Data.ProjectStatuses.Inactive));
    projects.push(createProject(name2, "2012-0008", client2, 1368296808746, Clok.Data.ProjectStatuses.Inactive));
    projects.push(createProject(name3, "2012-0011", client1, 1368296808747, Clok.Data.ProjectStatuses.Inactive));
    projects.push(createProject(name1, "2012-0017", client3, 1368296808748));
    projects.push(createProject(name3, "2012-0018", client4, 1368296808749, Clok.Data.ProjectStatuses.Deleted));
    projects.push(createProject(name1, "2012-0023", client5, 1368296808750, Clok.Data.ProjectStatuses.Deleted));
    projects.push(createProject(name3, "2012-0027", client6, 1368296808751, Clok.Data.ProjectStatuses.Inactive));
    projects.push(createProject(name3, "2012-0030", client7, 1368296808752, Clok.Data.ProjectStatuses.Inactive));
    projects.push(createProject(name3, "2012-0033", client3, 1368296808753));
    projects.push(createProject(name2, "2012-0039", client1, 1368296808754, Clok.Data.ProjectStatuses.Inactive));
    projects.push(createProject(name4, "2012-0042", client3, 1368296808755, Clok.Data.ProjectStatuses.Inactive));
    projects.push(createProject(name3, "2012-0050", client5, 1368296808756, Clok.Data.ProjectStatuses.Inactive));
    projects.push(createProject(name1, "2012-0053", client4, 1368296808757, Clok.Data.ProjectStatuses.Inactive));
    projects.push(createProject(name2, "2013-0012", client5, 1368296808758));
    projects.push(createProject(name2, "2013-0013", client7, 1368296808759));
    projects.push(createProject(name4, "2013-0016", client1, 1368296808760, Clok.Data.ProjectStatuses.Deleted));
    projects.push(createProject(name4, "2013-0017", client6, 1368296808761));
    projects.push(createProject(name3, "2013-0018", client2, 1368296808762));
})();


// add temp time entry data
(function () {
    var createTime = function (id, projectId, dateWorked, elapsedSeconds, notes) {
        var newTimeEntry = new Clok.Data.TimeEntry();
        newTimeEntry.id = id;
        newTimeEntry.projectId = projectId;
        newTimeEntry.dateWorked = dateWorked;
        newTimeEntry.elapsedSeconds = elapsedSeconds;
        newTimeEntry.notes = notes;

        return newTimeEntry;
    }

    var time = Clok.Data.Storage.timeEntries;

    var date1 = (new Date()).addMonths(-1).addDays(1);
    var date2 = (new Date()).addMonths(-1).addDays(2);
    var date3 = (new Date()).addMonths(-1).addDays(3);
    var date4 = (new Date()).addMonths(-1).addDays(4);
    var date5 = (new Date()).addMonths(-1).addDays(5);

    var timeId = 1369623987766;
    time.push(createTime(timeId++, 1368296808757, date1, 10800, "Lorem ipsum dolor sit."));
    time.push(createTime(timeId++, 1368296808757, date2, 7200, "Amet, consectetur adipiscing."));
    time.push(createTime(timeId++, 1368296808757, date3, 7200, "Praesent congue euismod diam."));
    time.push(createTime(timeId++, 1368296808760, date2, 7200, "Curabitur euismod mollis."));
    time.push(createTime(timeId++, 1368296808759, date1, 7200, "Donec sit amet porttitor."));
    time.push(createTime(timeId++, 1368296808758, date3, 8100, "Praesent congue euismod diam."));
    time.push(createTime(timeId++, 1368296808758, date2, 14400, "Curabitur euismod mollis."));
    time.push(createTime(timeId++, 1368296808761, date4, 7200, "Donec sit amet porttitor."));
    time.push(createTime(timeId++, 1368296808748, date3, 7200, "Praesent congue euismod diam."));
    time.push(createTime(timeId++, 1368296808748, date2, 7200, "Curabitur euismod mollis."));
    time.push(createTime(timeId++, 1368296808748, date1, 7200, "Donec sit amet porttitor."));
    time.push(createTime(timeId++, 1368296808746, date4, 8100, "Praesent congue euismod diam."));
    time.push(createTime(timeId++, 1368296808753, date2, 14400, "Curabitur euismod mollis."));
    time.push(createTime(timeId++, 1368296808753, date1, 7200, "Donec sit amet porttitor."));
    time.push(createTime(timeId++, 1368296808761, date5, 10800, "Donec semper risus nec."));
})();









