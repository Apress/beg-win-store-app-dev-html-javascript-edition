/// <reference path="/data/storage.js" />
/// <reference path="/data/project.js" />
// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    var data = Clok.Data;
    var storage = data.Storage;

    WinJS.UI.Pages.define("/pages/projects/list.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            allProjectsButton.onclick = this.allStatusFilter_click.bind(this);
            activeProjectsButton.onclick = this.activeStatusFilter_click.bind(this);
            inactiveProjectsButton.onclick = this.inactiveStatusFilter_click.bind(this);

            this.filter = WinJS.Binding.as({ value: [data.ProjectStatuses.Active, data.ProjectStatuses.Inactive] });
            this.filter.bind("value", this.filter_value_changed.bind(this));

            addProjectCommand.onclick = this.addProjectCommand_click.bind(this);
            listView.winControl.oniteminvoked = this.listView_itemInvoked.bind(this);
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />
            this.configureListViewLayout();
        },

        addProjectCommand_click: function (e) {
            WinJS.Navigation.navigate("/pages/projects/detail.html");
        },

        listView_itemInvoked: function (e) {
            var item = this.filteredProjects.getAt(e.detail.itemIndex);
            WinJS.Navigation.navigate("/pages/projects/detail.html", { id: item.id });
        },

        filter_value_changed: function (e) {
            this.filteredProjects = storage.projects.getGroupedProjectsByStatus(this.filter.value);

            listView.winControl.itemDataSource = this.filteredProjects.dataSource;
            listView.winControl.groupDataSource = this.filteredProjects.groups.dataSource;
            zoomedOutListView.winControl.itemDataSource = this.filteredProjects.groups.dataSource;

            this.configureListViewLayout();
        },

        configureListViewLayout: function () {
            var viewState = Windows.UI.ViewManagement.ApplicationView.value;

            if (viewState === Windows.UI.ViewManagement.ApplicationViewState.snapped) {
                listView.winControl.layout = new WinJS.UI.ListLayout();
                semanticZoom.winControl.enableButton = false;
            } else {
                listView.winControl.layout = new WinJS.UI.GridLayout();
                zoomedOutListView.winControl.layout = new WinJS.UI.GridLayout();
                semanticZoom.winControl.enableButton = true;
            }
        },

        allStatusFilter_click: function (e) {
            this.filter.value = [data.ProjectStatuses.Active, data.ProjectStatuses.Inactive];
            this.setSelectedButton(allProjectsButton);
        },

        activeStatusFilter_click: function (e) {
            this.filter.value = [data.ProjectStatuses.Active];
            this.setSelectedButton(activeProjectsButton);
        },

        inactiveStatusFilter_click: function (e) {
            this.filter.value = [data.ProjectStatuses.Inactive];
            this.setSelectedButton(inactiveProjectsButton);
        },

        setSelectedButton: function (btnToSelect) {
            WinJS.Utilities.query("#filters button").removeClass("selected");
            WinJS.Utilities.addClass(btnToSelect, "selected");
        },
    });


})();
