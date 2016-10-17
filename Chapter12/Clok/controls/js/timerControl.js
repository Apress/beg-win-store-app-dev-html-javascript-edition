/// <reference path="/js/utilities.js" />
(function () {
    "use strict";

    var controlDefinition = WinJS.Class.define(
        function Control_ctor(element, options) {
            this.element = element || document.createElement("div");
            this.element.winControl = this;

            // Set option defaults
            this._startStops = [];

            // Set user-defined options
            WinJS.UI.setOptions(this, options);

            this._init();
        },
        {
            _intervalId: 0,

            isRunning: {
                get: function () {
                    return (this.startStops.length > 0
                        && this.startStops[this.startStops.length - 1]
                        && this.startStops[this.startStops.length - 1].startTime
                        && !this.startStops[this.startStops.length - 1].stopTime);
                }
            },

            startStops: {
                get: function () {
                    return this._startStops;
                },
                set: function (value) {
                    this._startStops = value;
                }
            },

            timerValue: {
                get: function () {
                    if (this.startStops.length <= 0) {
                        return 0;
                    } else {
                        var val = 0;

                        for (var i = 0; i < this.startStops.length; i++) {
                            var startStop = this.startStops[i];
                            if (startStop.stopTime) {
                                val += (startStop.stopTime - startStop.startTime);
                            } else {
                                val += ((new Date()).getTime() - startStop.startTime);
                            }
                        }

                        return Math.round(val / 1000);
                    }
                }
            },

            timerValueAsTimeSpan: {
                get: function () {
                    return Clok.Utilities.SecondsToTimeSpan(this.timerValue);
                }
            },

            _init: function () {
                this._updateTimer();
            },

            start: function () {
                if (!this.isRunning) {
                    this._intervalId = setInterval(this._updateTimer.bind(this), 250);
                    this.startStops[this.startStops.length] = { startTime: (new Date()).getTime() };
                    this.dispatchEvent("start", {});
                }
            },

            stop: function () {
                if (this.isRunning) {
                    clearInterval(this._intervalId);
                    this._intervalId = 0;
                    this.startStops[this.startStops.length - 1].stopTime = (new Date()).getTime();
                    this._updateTimer();
                    this.dispatchEvent("stop", {});
                }
            },

            reset: function () {
                this._startStops = [];
                this._updateTimer();
                this.dispatchEvent("reset", {});
            },

            _updateTimer: function () {
                var ts = this.timerValueAsTimeSpan;

                var sec = ts[2];
                var min = ts[1];
                var hr = ts[0];

                min = ((min < 10) ? "0" : "") + min;
                sec = ((sec < 10) ? "0" : "") + sec;

                var formattedTime = new String();
                formattedTime = hr + ":" + min + ":" + sec;

                this.element.textContent = formattedTime;
            },

        }
    );

    WinJS.Namespace.define("Clok.UI", {
        Timer: controlDefinition,
    });


    WinJS.Class.mix(Clok.UI.Timer,
        WinJS.Utilities.createEventProperties("start"),
        WinJS.Utilities.createEventProperties("stop"),
        WinJS.Utilities.createEventProperties("reset"),
        WinJS.UI.DOMEventMixin);

})();
