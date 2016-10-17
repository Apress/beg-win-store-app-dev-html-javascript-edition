/// <reference path="/controls/js/clockControl.js" />

(function () {
    "use strict";

    var appData = Windows.Storage.ApplicationData.current;
    var roamingSettings = appData.roamingSettings;

    var page = WinJS.UI.Pages.define("/settings/options.html", {

        ready: function (element, options) {
            this.initializeSettingsControls();

            clockSecondsToggle.onchange = this.clockSecondsToggle_change;
            clockModeToggle.onchange = this.clockModeToggle_change;

            bingMapsTimeout_2000.onchange = this.bingMapsTimeout_change;
            bingMapsTimeout_5000.onchange = this.bingMapsTimeout_change;
            bingMapsTimeout_10000.onchange = this.bingMapsTimeout_change;

            bingMapsDistanceUnitToggle.onchange = this.bingMapsDistanceUnitToggle_change;
            indexedDbHelperToggle.onchange = this.indexedDbHelperToggle_change;
        },


        initializeSettingsControls: function() {
            clockSecondsToggle.winControl.checked =
                roamingSettings.values["clockSeconds"];

            clockModeToggle.winControl.checked = 
                roamingSettings.values["clockMode"] === Clok.UI.ClockModes.CurrentTime24;

            switch (roamingSettings.values["bingMapsTimeout"]) {
                case 5000:
                    bingMapsTimeout_5000.checked = true;
                    break;
                case 10000:
                    bingMapsTimeout_10000.checked = true;
                    break;
                default:
                    bingMapsTimeout_2000.checked = true;
            }

            bingMapsDistanceUnitToggle.winControl.checked = 
                roamingSettings.values["bingDistanceUnit"] === "km";

            indexedDbHelperToggle.winControl.checked = 
                roamingSettings.values["enableIndexedDbHelper"];

        },

        clockSecondsToggle_change: function (e) {
            roamingSettings.values["clockSeconds"] =
                (clockSecondsToggle.winControl.checked);

            appData.signalDataChanged();
        },

        clockModeToggle_change: function (e) {
            roamingSettings.values["clockMode"] =
                (clockModeToggle.winControl.checked)
                ? Clok.UI.ClockModes.CurrentTime24
                : Clok.UI.ClockModes.CurrentTime12;

            appData.signalDataChanged();
        },

        bingMapsTimeout_change: function (e) {
            roamingSettings.values["bingMapsTimeout"] = Number(e.currentTarget.value);
        },

        bingMapsDistanceUnitToggle_change: function (e) {
            roamingSettings.values["bingDistanceUnit"] =
                (bingMapsDistanceUnitToggle.winControl.checked) ? "km" : "mi";

            appData.signalDataChanged();
        },

        indexedDbHelperToggle_change: function (e) {
            roamingSettings.values["enableIndexedDbHelper"] =
                (indexedDbHelperToggle.winControl.checked);
        },
    });

})();


