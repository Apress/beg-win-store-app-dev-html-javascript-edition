﻿/// <reference path="/controls/js/clockControl.js" />
(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/home/home.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            this.initializeMenuPointerAnimations();

            toggleTimerMenuItem.onclick = this.toggleTimerMenuItem_click.bind(this);

            project.onchange = this.project_change.bind(this);
            saveTimeButton.onclick = this.saveTimeButton_click.bind(this);
            discardTimeButton.onclick = this.discardTimeButton_click.bind(this);

            this.setupTimerRelatedControls();

            //elapsedTimeClock.winControl.initialCounterValue = [3, 21, 09];
        },

        initializeMenuPointerAnimations: function () {
            var buttons = WinJS.Utilities.query(".mainMenuItem");
            buttons.listen("MSPointerDown", this.pointer_down, false);
            buttons.listen("MSPointerUp", this.pointer_up, false);
            buttons.listen("MSPointerOut", this.pointer_up, false);
        },

        pointer_down: function (e) {
            WinJS.UI.Animation.pointerDown(this);
            e.preventDefault();
        },

        pointer_up: function (e) {
            WinJS.UI.Animation.pointerUp(this);
            e.preventDefault();
        },


        timerIsRunning: false,

        toggleTimerMenuItem_click: function (e) {
            this.toggleTimer();
        },

        project_change: function (e) {
            this.enableOrDisableButtons();
        },

        discardTimeButton_click: function (e) {
            this.discard();
        },

        saveTimeButton_click: function (e) {
            this.save();
        },

        save: function () {
            // TODO: save the time entry

            timeEntry.style.transition = 'color 5ms ease 0s, transform 500ms ease 0s, opacity 500ms ease 0s';

            timeEntry.style.transformOrigin = "-130px 480px";
            timeEntry.style.transform = 'scale3d(0,0,0)';
            timeEntry.style.opacity = '0';
            timeEntry.style.color = '#00ff00';

            var self = this;
            var transitionend = function (e1) {
                if (e1.propertyName === "transform") {
                    timeEntry.removeEventListener('transitionend', transitionend);
                    self.resetTimer();
                }
            };

            timeEntry.addEventListener('transitionend', transitionend, false);
        },

        discard: function () {
            var self = this;

            var slideTransition = WinJS.UI.executeTransition(
                timeEntry,
                [
                    {
                        property: "transform",
                        delay: 0,
                        duration: 500,
                        timing: "ease",
                        from: "rotate(0deg) scale3d(1,1,1)",
                        to: "rotate(720deg) scale3d(0,0,0)"
                    },
                    {
                        property: "opacity",
                        delay: 0,
                        duration: 500,
                        timing: "ease",
                        from: 1,
                        to: 0
                    },
                    {
                        property: "color",
                        delay: 0,
                        duration: 5,
                        timing: "ease",
                        from: '#ffffff',
                        to: '#ff0000'
                    }
                ]).done(function () { self.resetTimer(); });
        },

        toggleTimer: function () {
            this.timerIsRunning = !this.timerIsRunning;
            this.setupTimerRelatedControls();
        },

        resetTimer: function () {
            this.timerIsRunning = false;
            elapsedTimeClock.winControl.reset();
            project.selectedIndex = 0;
            timeNotes.value = "";

            this.resetTimerStyles();
            this.setupTimerRelatedControls();
        },

        resetTimerStyles: function () {
            timeEntry.style.transition = 'none';
            timeEntry.style.transformOrigin = "50% 50%";
            timeEntry.style.transform = 'scale3d(1,1,1)';
            timeEntry.style.opacity = '1';
            timeEntry.style.color = '#ffffff';
        },

        setupTimerRelatedControls: function () {
            if (this.timerIsRunning) {
                elapsedTimeClock.winControl.start();
                timerImage.src = "/images/Clock-Running.png";
                timerTitle.innerText = "Stop Clok";
            } else {
                elapsedTimeClock.winControl.stop();
                timerImage.src = "/images/Clock-Stopped.png";
                timerTitle.innerText = "Start Clok";
            }

            this.enableOrDisableButtons();
        },

        enableOrDisableButtons: function () {
            if ((project.value !== "") && (!this.timerIsRunning) && (elapsedTimeClock.winControl.counterValue > 0)) {
                saveTimeButton.disabled = false;
            } else {
                saveTimeButton.disabled = true;
            }

            discardTimeButton.disabled = (this.timerIsRunning) || (elapsedTimeClock.winControl.counterValue <= 0);
        },
    });


})();
