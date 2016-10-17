/// <reference path="/data/data.js" />

// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    var storage = Clok.Data.Storage;

    WinJS.UI.Pages.define("/pages/projects/detail.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {

            this.currProject = storage.projects.getById(options && options.id) || new Clok.Data.Project();
            this.configureAppBar(options && options.id);
            var form = document.getElementById("projectDetailForm");
            WinJS.Binding.processAll(form, this.currProject);

            this.bindClients();

            saveProjectCommand.onclick = this.saveProjectCommand_click.bind(this);
            deleteProjectCommand.onclick = this.deleteProjectCommand_click.bind(this);
            goToTimeEntriesCommand.onclick = this.goToTimeEntriesCommand_click.bind(this);
            goToDirectionsCommand.onclick = this.goToDirectionsCommand_click.bind(this);
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in viewState.
            var viewStates = Windows.UI.ViewManagement.ApplicationViewState;
            if (viewState === viewStates.snapped) {
                startDate.winControl.monthPattern = "{month.abbreviated}";
                dueDate.winControl.monthPattern = "{month.abbreviated}";
            } else {
                startDate.winControl.monthPattern = "{month.full}";
                dueDate.winControl.monthPattern = "{month.full}";
            }
        },

        saveProjectCommand_click: function (e) {
            // don't set the required attribute until the first submit attempt
            // this prevents the form from appearing to be in error when first loaded
            WinJS.Utilities
                .query(".required input, .required textarea, .required select")
                .setAttribute("required", "required");

            if (projectDetailForm.checkValidity()) {
                this.populateProjectFromForm();
                storage.projects.save(this.currProject);
                WinJS.Navigation.back();
            }
        },

        deleteProjectCommand_click: function (e) {
            storage.projects.delete(this.currProject);
            WinJS.Navigation.back();
        },

        goToTimeEntriesCommand_click: function (e) {
            if (this.currProject && this.currProject.id) {
                WinJS.Navigation.navigate("/pages/timeEntries/list.html", { projectId: this.currProject.id });
            }
        },

        goToDirectionsCommand_click: function (e) {
            if (this.currProject
                    && this.currProject.id
                    && this.currProject.isAddressSpecified()) {
                WinJS.Navigation.navigate("/pages/projects/directions.html", {
                    project: this.currProject
                });
            }
        },

        populateProjectFromForm: function () {
            this.currProject.name = document.getElementById("projectName").value;
            this.currProject.projectNumber = document.getElementById("projectNumber").value;

            this.currProject.status = (projectStatus.winControl.checked) ?
                Clok.Data.ProjectStatuses.Active : Clok.Data.ProjectStatuses.Inactive;

            this.currProject.description = document.getElementById("projectDescription").value;
            this.currProject.startDate = startDate.winControl.current;
            this.currProject.dueDate = dueDate.winControl.current;
            this.currProject.clientName = document.getElementById("clientName").value;
            this.currProject.contactName = document.getElementById("contactName").value;
            this.currProject.address1 = document.getElementById("address1").value;
            this.currProject.address2 = document.getElementById("address2").value;
            this.currProject.city = document.getElementById("city").value;
            this.currProject.region = document.getElementById("region").value;
            this.currProject.postalCode = document.getElementById("postalCode").value;
            this.currProject.email = document.getElementById("contactEmail").value;
            this.currProject.phone = document.getElementById("phone").value;
        },

        configureAppBar: function (existingId) {
            var fields = WinJS.Utilities.query("#projectDetailForm input, "
                + "#projectDetailForm textarea, "
                + "#projectDetailForm select");

            fields.listen("focus", function (e) {
                projectDetailAppBar.winControl.show();
            }, false);

            if (existingId) {
                deleteProjectCommand.winControl.disabled = false;
                goToTimeEntriesCommand.winControl.disabled = false;

                if (this.currProject.isAddressSpecified()) {
                    goToDirectionsCommand.winControl.disabled = false;
                }
            }
        },

        bindClients: function () {
            storage.clients.forEach(function (item) {
                var option = document.createElement("option");
                option.textContent = item;
                option.value.textContent = item;
                clientList.appendChild(option);
            });
        },
    });
})();
