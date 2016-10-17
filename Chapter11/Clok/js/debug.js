(function () {
    "use strict";

    var debugClass = WinJS.Class.define(
        function constructor() {
            // define and initialize properties
        },
        {
            // instance members
        },
        {
            // static members

            sleep: function (delay) {
                var start = new Date().getTime();
                while (new Date().getTime() < start + delay);
            },

            break: function () {
                debugger;
            }

        }
    );

    WinJS.Namespace.define("WinJS", {
        Debug: debugClass,
    });

})();
