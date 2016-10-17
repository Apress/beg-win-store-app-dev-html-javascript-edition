/// <reference path="//Microsoft.WinJS.1.0/js/base.js" />
/// <reference path="project.js" />

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

    projects.push(createProject("Windows Store App", "2012-0003", "Northwind Traders", 1368296808745, Clok.Data.ProjectStatuses.Inactive));
    projects.push(createProject("Mobile Website", "2012-0008", "Contoso Ltd.", 1368296808746, Clok.Data.ProjectStatuses.Inactive));
    projects.push(createProject("Website Redesign", "2012-0011", "Northwind Traders", 1368296808747, Clok.Data.ProjectStatuses.Inactive));
    projects.push(createProject("Windows Store App", "2012-0017", "AdventureWorks Cycles", 1368296808748));
    projects.push(createProject("Website Redesign", "2012-0018", "TailSpin Toys", 1368296808749, Clok.Data.ProjectStatuses.Deleted));
    projects.push(createProject("Windows Store App", "2012-0023", "A. Datum Corporation", 1368296808750, Clok.Data.ProjectStatuses.Deleted));
    projects.push(createProject("Website Redesign", "2012-0027", "Woodgrove Bank", 1368296808751, Clok.Data.ProjectStatuses.Inactive));
    projects.push(createProject("Website Redesign", "2012-0030", "Fabrikam, Inc.", 1368296808752, Clok.Data.ProjectStatuses.Inactive));
    projects.push(createProject("Website Redesign", "2012-0033", "AdventureWorks Cycles", 1368296808753));
    projects.push(createProject("Mobile Website", "2012-0039", "Northwind Traders", 1368296808754, Clok.Data.ProjectStatuses.Inactive));
    projects.push(createProject("Employee Portal", "2012-0042", "AdventureWorks Cycles", 1368296808755, Clok.Data.ProjectStatuses.Inactive));
    projects.push(createProject("Website Redesign", "2012-0050", "A. Datum Corporation", 1368296808756, Clok.Data.ProjectStatuses.Inactive));
    projects.push(createProject("Windows Store App", "2012-0053", "TailSpin Toys", 1368296808757, Clok.Data.ProjectStatuses.Inactive));
    projects.push(createProject("Mobile Website", "2013-0012", "A. Datum Corporation", 1368296808758));
    projects.push(createProject("Mobile Website", "2013-0013", "Fabrikam, Inc.", 1368296808759));
    projects.push(createProject("Employee Portal", "2013-0016", "Northwind Traders", 1368296808760, Clok.Data.ProjectStatuses.Deleted));
    projects.push(createProject("Employee Portal", "2013-0017", "Woodgrove Bank", 1368296808761));
    projects.push(createProject("Website Redesign", "2013-0018", "Contoso Ltd.", 1368296808762));
})();
