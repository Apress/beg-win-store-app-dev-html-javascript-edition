/// <reference path="../controls/js/clockControl.js" />
// For an introduction to the Navigation template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232506
(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var nav = WinJS.Navigation;

    var appData = Windows.Storage.ApplicationData.current;
    var roamingSettings = appData.roamingSettings;

    app.addEventListener("activated", function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }

            if (app.sessionState.history) {
                nav.history = app.sessionState.history;
            }

            initializeRoamingSettings();

            // add our SettingsFlyout to the list when the Settings charm is shown
            WinJS.Application.onsettings = function (e) {
                e.detail.applicationcommands = {
                    "options": {
                        title: "Clok Options",
                        href: "/settings/options.html"
                    },
                    "about": {
                        title: "About Clok",
                        href: "/settings/about.html"
                    }
                };

                if (roamingSettings.values["enableIndexedDbHelper"]) {
                    e.detail.applicationcommands.idbhelper = {
                        title: "IndexedDB Helper",
                        href: "/settings/idbhelper.html"
                    };
                }

                WinJS.UI.SettingsFlyout.populateSettings(e);
            };

            args.setPromise(WinJS.UI.processAll().then(function () {
                configureClock();

                if (nav.location) {
                    nav.history.current.initialPlaceholder = true;
                    return nav.navigate(nav.location, nav.state);
                } else {
                    return nav.navigate(Application.navigator.home);
                }
            }));
        }
    });

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. If you need to 
        // complete an asynchronous operation before your application is 
        // suspended, call args.setPromise().
        app.sessionState.history = nav.history;
    };

    appData.addEventListener("datachanged", function (args) {
        configureClock();
    });

    var configureClock = function () {
        currentTime.winControl.showClockSeconds = roamingSettings.values["clockSeconds"];
        currentTime.winControl.mode = roamingSettings.values["clockMode"];
    };

    // ensure that our settings always have default values
    var initializeRoamingSettings = function () {
        roamingSettings.values["clockSeconds"] =
            roamingSettings.values["clockSeconds"] || false;

        roamingSettings.values["clockMode"] =
            roamingSettings.values["clockMode"] || Clok.UI.ClockModes.CurrentTime12;

        roamingSettings.values["bingMapsTimeout"] =
            roamingSettings.values["bingMapsTimeout"] || 5000;

        roamingSettings.values["bingDistanceUnit"] =
            roamingSettings.values["bingDistanceUnit"] || "mi";

        roamingSettings.values["enableIndexedDbHelper"] =
            roamingSettings.values["enableIndexedDbHelper"] || false;
    };

    app.start();
})();
