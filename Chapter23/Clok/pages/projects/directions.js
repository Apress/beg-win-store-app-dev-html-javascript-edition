/// <reference path="/data/bingMapsWrapper.js" />
/// <reference path="/js/printing.js" />

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
            this.printer = new Clok.Printer();
            this.printer.register("Directions");

            bingCommand.onclick = this.bingCommand_click.bind(this);
            printCommand.onclick = this.printCommand_click.bind(this);

            this.currentCoords = null;
            getLocationButton.disabled = true;
            this.checkForGeoposition();
            getLocationButton.onclick = this.getLocationButton_click.bind(this);

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

            Clok.Utilities.DisableInSnappedView();
        },

        unload: function () {
            appData.removeEventListener("datachanged", this.appData_datachanged_boundThis);

            app.sessionState.directionsFromLocation = null;
            app.removeEventListener("checkpoint", this.app_checkpoint_boundThis);

            this.printer.unregister();
        },

        checkpoint: function () {
            app.sessionState.directionsFromLocation = fromLocation.value;
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            Clok.Utilities.DisableInSnappedView();
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
            bingCommand.winControl.disabled = true;
            printCommand.winControl.disabled = true;
            this.printer.setDocument(null);

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

                            var printPage = "http://www.bing.com/maps/print.aspx?cp="
                                + ((directions.startCoords[0] + directions.endCoords[0]) / 2) + ","
                                + ((directions.startCoords[1] + directions.endCoords[1]) / 2)
                                + "&pt=pf&rtp=pos." + directions.startCoords[0] + "_"
                                + directions.startCoords[1] + "_" + fromLocation.value
                                + "~pos." + directions.endCoords[0] + "_" + directions.endCoords[1]
                                + "_" + this.dest

                            this.printer.setAlternateContent(printPage);

                            bingCommand.winControl.disabled = false;
                            printCommand.winControl.disabled = false;
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

        getLocationButton_click: function (e) {
            fromLocation.value = this.currentCoords.latitude.toString()
                + ", " + this.currentCoords.longitude.toString();
        },

        checkForGeoposition: function () {
            var locator = new Windows.Devices.Geolocation.Geolocator();
            var positionStatus = Windows.Devices.Geolocation.PositionStatus;

            if (locator != null) {
                locator.getGeopositionAsync()
                    .then(function (position) {
                        this.currentCoords = position.coordinate;
                        if (this.currentCoords.accuracy <= 200) {
                            getLocationButton.disabled = (locator.locationStatus !== positionStatus.ready);
                        }
                    }.bind(this));
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

        bingCommand_click: function (e) {
            var webPage = "http://www.bing.com/maps/default.aspx?rtp=adr."
                + fromLocation.value + "~adr." + this.dest;

            Windows.System.Launcher.launchUriAsync(Windows.Foundation.Uri(webPage));
        },

        printCommand_click: function (e) {
            this.printer.print();
        },
    });
})();
