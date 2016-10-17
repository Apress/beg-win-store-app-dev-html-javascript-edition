(function () {
    "use strict";

    var controlDefinition = WinJS.Class.define(
        function Control_ctor(element, options) {
            this.element = element || document.createElement("div");
            this.element.winControl = this;

            // Set option defaults
            this._mode = clockModes.CurrentTime12;
            this._showClockSeconds = true;

            // Set user-defined options
            WinJS.UI.setOptions(this, options);

            this._init();
        },
        {
            _intervalId: 0,

            isRunning: {
                get: function () {
                    return (this._intervalId != 0);
                }
            },

            mode: {
                get: function () {
                    return this._mode;
                },
                set: function (value) {
                    this._mode = value;
                }
            },

            showClockSeconds: {
                set: function (value) {
                    this._showClockSeconds = value;
                }
            },

            _init: function () {
                this.start();
            },

            start: function () {
                if (!this.isRunning) {
                    this._intervalId = setInterval(this._refreshTime.bind(this), 500);
                    this.dispatchEvent("start", {});
                }
            },

            stop: function () {
                if (this.isRunning) {
                    clearInterval(this._intervalId);
                    this._intervalId = 0;
                    this.dispatchEvent("stop", {});
                }
            },

            _refreshTime: function () {
                var dt = new Date();

                var hr = dt.getHours();
                var min = dt.getMinutes();
                var sec = dt.getSeconds();
                var ampm = (hr >= 12) ? " PM" : " AM";

                if (this._mode === clockModes.CurrentTime12) {
                    hr = hr % 12;
                    hr = (hr === 0) ? 12 : hr;
                } else {
                    ampm = "";
                }

                min = ((min < 10) ? "0" : "") + min;
                sec = ((sec < 10) ? "0" : "") + sec;

                var formattedTime = new String();
                formattedTime = hr + ":" + min + ((this._showClockSeconds) ? ":" + sec : "") + ampm;

                this.element.textContent = formattedTime;
            },

        }
    );

    // clockModes is an enum(eration) of the different ways our clock control can behave
    var clockModes = Object.freeze({
        CurrentTime12: "currenttime12",
        CurrentTime24: "currenttime24",
    });


    WinJS.Namespace.define("Clok.UI", {
        Clock: controlDefinition,
        ClockModes: clockModes,
    });


    WinJS.Class.mix(Clok.UI.Clock,
        WinJS.Utilities.createEventProperties("start"),
        WinJS.Utilities.createEventProperties("stop"),
        WinJS.UI.DOMEventMixin);

})();
