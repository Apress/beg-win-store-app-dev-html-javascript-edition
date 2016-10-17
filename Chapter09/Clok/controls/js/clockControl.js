(function () {
    "use strict";

    var controlDefinition = WinJS.Class.define(
        function Control_ctor(element, options) {
            this.element = element || document.createElement("div");
            this.element.winControl = this;

            // Set option defaults
            this._mode = clockModes.CurrentTime12;
            this._showClockSeconds = true;
            this._initialCounterValue = [0, 0, 0];
            this._autoStartCounter = false;

            // Set user-defined options
            WinJS.UI.setOptions(this, options);

            this._init();
        },
        {
            _intervalId: 0,
            _counterValue: 0,

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

            autoStartCounter: {
                get: function () {
                    return this._autoStartCounter;
                },
                set: function (value) {
                    this._autoStartCounter = value;
                }
            },

            counterValue: {
                get: function () {
                    return this._counterValue;
                }
            },

            counterValueAsTimeSpan: {
                get: function () {
                    return this._convertToTimeSpan(this._counterValue);
                }
            },

            initialCounterValue: {
                set: function (value) {
                    if (isNaN(value)) {
                        this._counterValue = (value[0] * 3600) + (value[1] * 60) + (value[2]);
                        this._initialCounterValue = value;
                    } else {
                        this._counterValue = value;
                        this._initialCounterValue = [0, 0, value];
                    }
                }
            },

            showClockSeconds: {
                set: function (value) {
                    this._showClockSeconds = value;
                }
            },

            _init: function () {
                if (this._mode === clockModes.CurrentTime12 || this._mode === clockModes.CurrentTime24) {
                    this.start();
                } else {
                    this._updateCounter();
                    if (this._autoStartCounter) {
                        this.start();
                    }
                }
            },

            start: function () {
                if (!this.isRunning) {
                    if (this._mode === clockModes.CurrentTime12 || this._mode === clockModes.CurrentTime24) {
                        this._intervalId = setInterval(this._refreshTime.bind(this), 500);
                    } else {
                        this._intervalId = setInterval(this._refreshCounterValue.bind(this), 1000);
                    }
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

            reset: function () {
                this.initialCounterValue = this._initialCounterValue;
                this._updateCounter();
                this.dispatchEvent("reset", {});
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

            _refreshCounterValue: function () {
                if (this._mode === clockModes.CountDown) {
                    this._counterValue--;
                    if (this._counterValue <= 0) {
                        this._counterValue = 0;
                        this.stop();
                        this.dispatchEvent("countdownComplete", {});
                    }
                } else {
                    this._counterValue++;
                }

                this._updateCounter();

                this.dispatchEvent("counterTick", {
                    value: this._counterValue
                });
            },

            _updateCounter: function () {
                var ts = this._convertToTimeSpan(this._counterValue);

                var sec = ts[2];
                var min = ts[1];
                var hr = ts[0];

                min = ((min < 10) ? "0" : "") + min;
                sec = ((sec < 10) ? "0" : "") + sec;

                var formattedTime = new String();
                formattedTime = hr + ":" + min + ":" + sec;

                this.element.textContent = formattedTime;
            },

            _convertToTimeSpan: function (totalSec) {
                var sec = totalSec % 60;
                var min = ((totalSec - sec) / 60) % 60;
                var hr = ((totalSec - sec - (60 * min)) / 3600);

                return [hr, min, sec];
            },
        }
    );

    // clockModes is an enum(eration) of the different ways our clock control can behave
    var clockModes = Object.freeze({
        CurrentTime12: "currenttime12",
        CurrentTime24: "currenttime24",
        CountDown: "countdown",
        CountUp: "countup",
    });


    WinJS.Namespace.define("Clok.UI", {
        Clock: controlDefinition,
        ClockModes: clockModes,
    });


    WinJS.Class.mix(Clok.UI.Clock,
        WinJS.Utilities.createEventProperties("counterTick"),
        WinJS.Utilities.createEventProperties("countdownComplete"),
        WinJS.Utilities.createEventProperties("start"),
        WinJS.Utilities.createEventProperties("stop"),
        WinJS.Utilities.createEventProperties("reset"),
        WinJS.UI.DOMEventMixin);

})();
