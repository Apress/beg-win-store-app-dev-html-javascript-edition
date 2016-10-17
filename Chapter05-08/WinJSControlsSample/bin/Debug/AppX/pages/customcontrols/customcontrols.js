// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/customcontrols/customcontrols.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            downStart.addEventListener("click", function (e) {
                myCountDown.winControl.start();
            }, false);
            downStop.addEventListener("click", function (e) {
                myCountDown.winControl.stop();
            }, false);
            downReset.addEventListener("click", function (e) {
                myCountDown.winControl.reset();
                downReset.disabled = true;
            }, false);

            myCountDown.addEventListener("countdownComplete", function (e) {
                handleCountDownEvent(e.type);
            }, false);
            myCountDown.addEventListener("start", function (e) {
                handleCountDownEvent(e.type);
            }, false);
            myCountDown.addEventListener("stop", function (e) {
                handleCountDownEvent(e.type);
            }, false);
            myCountDown.addEventListener("reset", function (e) {
                handleCountDownEvent(e.type);
            }, false);

            var handleCountDownEvent = function (eventName) {
                downEventStatus.textContent = eventName;
                var enableStart = (eventName === "start") ? false : true;
                downStart.disabled = !enableStart;
                downStop.disabled = enableStart;
                downReset.disabled = !enableStart;
            };

            myCountUp.addEventListener("counterTick", function (e) {
                if (e.value % 10 === 0) upEventStatus.textContent += "'";
            }, false);
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in viewState.
        },

    });


})();
