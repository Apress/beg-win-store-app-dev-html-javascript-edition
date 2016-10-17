/// <reference path="/js/extensions.js" />
/// <reference path="/data/storage.js" />
/// <reference path="/data/project.js" />
/// <reference path="/data/timeEntry.js" />
// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    var data = Clok.Data;
    var storage = data.Storage;

    WinJS.UI.Pages.define("/pages/timeEntries/list.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {

            this.bindListOfProjects(projectId);
            this.bindListOfProjects(filterProjectId);

            this.setupListViewBinding(options);

            timeEntriesListView.winControl.onselectionchanged = this.timeEntriesListView_selectionChanged.bind(this);
            timeEntriesListView.winControl.layout = new WinJS.UI.ListLayout();

            addTimeButton.onclick = this.addTimeButton_click.bind(this);
            subtractTimeButton.onclick = this.subtractTimeButton_click.bind(this);

            saveTimeButton.onclick = this.saveTimeButton_click.bind(this);
            cancelTimeButton.onclick = this.cancelTimeButton_click.bind(this);

            addTimeEntryCommand.winControl.onclick = this.addTimeEntryCommand_click.bind(this);
            graphTimeEntriesCommand.winControl.onclick = this.graphTimeEntriesCommand_click.bind(this);
            deleteTimeEntriesCommand.winControl.onclick = this.deleteTimeEntriesCommand_click.bind(this);

        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in viewState.
        },



        setupListViewBinding: function (options) {
            this.filter = WinJS.Binding.as({
                startDate: (options && options.startDate) || new Date().addMonths(-1).addDays(1),
                endDate: (options && options.endDate) || new Date().removeTimePart(),
                projectId: (options && options.projectId) || -1
            });

            this.filteredResults = null;

            this.filter.bind("startDate", this.filter_changed.bind(this));
            this.filter.bind("endDate", this.filter_changed.bind(this));
            this.filter.bind("projectId", this.filter_changed.bind(this));

            filterStartDate.winControl.current = this.filter.startDate;
            filterEndDate.winControl.current = this.filter.endDate;
            filterProjectId.value = this.filter.projectId;

            filterStartDate.winControl.onchange = this.filterStartDate_change.bind(this);
            filterEndDate.winControl.onchange = this.filterEndDate_change.bind(this);
            filterProjectId.onchange = this.filterProjectId_change.bind(this);
            clearFilterButton.onclick = this.clearFilterButton_click.bind(this);
        },

        filter_changed: function (e) {
            this.updateResultsArea(searchInProgress);

            storage.timeEntries.getSortedFilteredTimeEntriesAsync(
                    this.filter.startDate,
                    this.filter.endDate,
                    this.filter.projectId)
                .then(
                    function complete(results) {
                        if (results.length <= 0) {
                            timeEntryAppBar.winControl.show();
                            this.updateResultsArea(noMatchesFound);
                        } else {
                            this.updateResultsArea(timeEntriesListView);
                        }
                        this.showAddForm();
                        this.filteredResults = results;
                        timeEntriesListView.winControl.itemDataSource = results.dataSource;
                    }.bind(this),
                    function error(results) {
                        this.updateResultsArea(searchError);
                    }.bind(this)
                );
        },

        filterStartDate_change: function (e) {
            this.filter.startDate = filterStartDate.winControl.current.removeTimePart();
        },

        filterEndDate_change: function (e) {
            this.filter.endDate = filterEndDate.winControl.current.removeTimePart();
        },

        filterProjectId_change: function (e) {
            this.filter.projectId = filterProjectId.value;
        },

        clearFilterButton_click: function (e) {
            filterStartDate.winControl.current = new Date().addMonths(-1);
            filterEndDate.winControl.current = new Date().removeTimePart();
            filterProjectId.value = -1;

            this.filterStartDate_change();
            this.filterEndDate_change();
            this.filterProjectId_change();
        },

        updateResultsArea: function (div) {
            this.disableEditForm();

            var allDivs = WinJS.Utilities.query("#timeEntriesListView, "
                + "#noMatchesFound, "
                + "#searchError, "
                + "#searchInProgress");

            allDivs.addClass("hidden");
            if (div) {
                WinJS.Utilities.removeClass(div, "hidden");
            }

            timeEntriesListView.winControl.forceLayout();
        },


        addTimeButton_click: function (e) {
            var t = timeWorked.value;
            t = (isNaN(t) || t === "") ? 0 : Number(t);

            t += 0.25;
            if (t > 24) t = 24;
            timeWorked.value = t.toFixed(2);
        },

        subtractTimeButton_click: function (e) {
            var t = timeWorked.value;
            t = (isNaN(t) || t === "") ? 0 : Number(t);

            t -= 0.25;
            if (t < 0) t = 0;
            timeWorked.value = t.toFixed(2);
        },

        saveTimeButton_click: function (e) {
            this.currentTimeEntry = this.currentTimeEntry || new data.TimeEntry();

            var currElapsedSeconds = !isNaN(timeWorked.value) ? (Number(timeWorked.value) * 3600) : 0;

            this.currentTimeEntry.dateWorked = dateWorked.winControl.current;
            this.currentTimeEntry.projectId = projectId.value;
            this.currentTimeEntry.elapsedSeconds = currElapsedSeconds;
            this.currentTimeEntry.notes = notes.value;

            storage.timeEntries.save(this.currentTimeEntry);

            this.filter_changed();
        },

        cancelTimeButton_click: function (e) {
            this.timeEntriesListView_selectionChanged();
        },

        addTimeEntryCommand_click: function (e) {
            timeEntriesListView.winControl.selection.clear();
        },

        graphTimeEntriesCommand_click: function (e) {
            WinJS.Navigation.navigate("/pages/timeEntries/graph.html", {
                filter: this.filter,
            });
        },

        deleteTimeEntriesCommand_click: function (e) {
            timeEntriesListView.winControl.selection.getItems()
                .then(function (selectedItems) {
                    var deletePromises = selectedItems.map(function (item) {
                        return storage.timeEntries.delete(item.data);
                    });

                    return WinJS.Promise.join(deletePromises);
                })
                .then(null, function error(result) {
                    new Windows.UI.Popups
                        .MessageDialog("Could not delete all selected records.", "An error occurred. ")
                        .showAsync();
                });
        },

        timeEntriesListView_selectionChanged: function (e) {
            // Get the number of currently selected items
            var selectionCount = timeEntriesListView.winControl.selection.count();

            // Report the number
            if (selectionCount <= 0) {
                this.showAddForm();
                timeEntryAppBar.winControl.hide();
            } else if (selectionCount > 1) {
                this.disableEditForm();
                timeEntryAppBar.winControl.show();
            } else { // if (selectionCount === 1) {
                this.enableEditForm();
                timeEntryAppBar.winControl.show();
            }

        },

        showAddForm: function () {
            // disable edit form (convert to "add" form)
            this.bindForm(new data.TimeEntry());
            this.setFormEnabled(true);

            formHeader.innerHTML = "Add Time Entry";

            // disable AppBar delete button
            deleteTimeEntriesCommand.winControl.disabled = true;
        },

        disableEditForm: function () {
            // disable edit form
            this.bindForm(new data.TimeEntry());
            this.setFormEnabled(false);

            formHeader.innerHTML = "Add Time Entry";

            // enable AppBar delete button
            deleteTimeEntriesCommand.winControl.disabled = false;
        },

        enableEditForm: function () {
            // enable edit form
            // Get the actual selected items
            timeEntriesListView.winControl.selection.getItems()
                .done(function (selectedItems) {
                    this.bindForm(selectedItems[0].data);
                    this.setFormEnabled(true);
                }.bind(this));

            formHeader.innerHTML = "Edit Time Entry";

            // enable AppBar delete button
            deleteTimeEntriesCommand.winControl.disabled = false;
        },

        bindForm: function (te) {
            this.currentTimeEntry = te || new data.TimeEntry();
            var form = document.getElementById("timeEntryDetailPane");
            WinJS.Binding.processAll(form, this.currentTimeEntry);
        },

        bindListOfProjects: function (selectControl) {
            selectControl.options.length = 1; // remove all except first project

            var activeProjects = storage.projects.filter(function (p) { return p.status === Clok.Data.ProjectStatuses.Active; });

            activeProjects.forEach(function (item) {
                var option = document.createElement("option");
                option.text = item.name + " (" + item.projectNumber + ")"; // item.toTemplatedString("{name} ({projectNumber})");
                option.title = item.clientName; //item.toTemplatedString("{clientName}, {projectNumber}");
                option.value = item.id;
                selectControl.appendChild(option);
            });
        },

        setFormEnabled: function (enabled) {
            var fields = WinJS.Utilities.query("#timeEntryDetailPane input, "
                + "#timeEntryDetailPane textarea, "
                + "#timeEntryDetailPane select, "
                + "#timeEntryDetailPane button");

            if (enabled) {
                fields.forEach(function (field) { field.removeAttribute("disabled"); });
            } else {
                fields.setAttribute("disabled", "disabled");
            }
        },


    });
})();

