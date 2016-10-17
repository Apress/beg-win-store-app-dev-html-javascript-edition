/// <reference path="/data/bingMapsWrapper.js" />

// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    var app = WinJS.Application;
    var appData = Windows.Storage.ApplicationData.current;
    var roamingSettings = appData.roamingSettings;

    var maps = Clok.Data.BingMaps;

    WinJS.UI.Pages.define("/pages/projects/directions.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            fromLocation.value = app.sessionState.directionsFromLocation || "";
            this.populateDestination(options);
            getDirectionsButton.onclick = this.getDirectionsButton_click.bind(this);

            this.appData_datachanged_boundThis = this.appData_datachanged.bind(this);
            appData.addEventListener("datachanged", this.appData_datachanged_boundThis);

            this.app_checkpoint_boundThis = this.checkpoint.bind(this);
            app.addEventListener("checkpoint", this.app_checkpoint_boundThis);

            fromLocation.onchange = function (e) {
                app.sessionState.directionsFromLocation = fromLocation.value;
            }.bind(this);
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
            appData.removeEventListener("datachanged", this.appData_datachanged_boundThis);

            app.sessionState.directionsFromLocation = null;
            app.removeEventListener("checkpoint", this.app_checkpoint_boundThis);
        },

        checkpoint: function () {
            app.sessionState.directionsFromLocation = fromLocation.value;
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in viewState.
        },

        populateDestination: function (options) {
            if (options && options.project) {
                var proj = options.project;

                var addressParts = [
                    proj.address1,
                    proj.city,
                    ((proj.region || "") + " " + (proj.postalCode || "")).trim()];

                this.dest = addressParts.filter(function (part) {
                    return !!part;
                }).join(", ");
                toLocation.textContent = this.dest;
            }
        },

        getDirectionsButton_click: function (e) {
            if (fromLocation && fromLocation.value && this.dest) {

                maps.getDirections(fromLocation.value, this.dest)
                    .then(function (directions) {

                        if (directions
                                && directions.itineraryItems
                                && directions.itineraryItems.length > 0) {

                            WinJS.Binding.processAll(
                                document.getElementById("directionsContainer"), directions);

                            this.showDirectionResults(true);

                            directionsListView.winControl.itemDataSource
                                = directions.itineraryItems.dataSource;

                            directionsListView.winControl.forceLayout();
                        } else {
                            this.showDirectionResults(false);
                        }
                    }.bind(this), function (errorEvent) {
                        this.showDirectionResults(false);
                    }.bind(this));
            } else {
                this.showDirectionResults(false);
            }
        },

        showDirectionResults: function (hasDirections) {
            if (hasDirections) {
                WinJS.Utilities.removeClass(directionsSuccess, "hidden");
                WinJS.Utilities.addClass(directionsError, "hidden");
            } else {
                WinJS.Utilities.addClass(directionsSuccess, "hidden");
                WinJS.Utilities.removeClass(directionsError, "hidden");
            }
        },
        
        appData_datachanged: function (args) {
            this.getDirectionsButton_click();
        },
    });
})();
