(function () {
    "use strict";

    var utilClass = WinJS.Class.define(
        function constructor() {
            // define and initialize properties
        },
        {
            // instance members
        },
        {
            SecondsToTimeSpan: function (totalSec) {
                if (!isNaN(totalSec)) {
                    var sec = totalSec % 60;
                    var min = ((totalSec - sec) / 60) % 60;
                    var hr = ((totalSec - sec - (60 * min)) / 3600);

                    return [hr, min, sec];
                }

                return [0, 0, 0];
            },


            TimeSpanToSeconds: function (timespan) {
                if (isNaN(timespan)) {
                    return (timespan[0] * 3600) + (timespan[1] * 60) + (timespan[2]);
                }

                return 0;
            },

        }
    );

    WinJS.Namespace.define("Clok", {
        Utilities: utilClass,
    });

})();
