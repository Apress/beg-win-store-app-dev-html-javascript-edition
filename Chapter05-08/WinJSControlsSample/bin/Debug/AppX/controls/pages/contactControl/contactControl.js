(function () {
    "use strict";

    var controlDefinition = WinJS.UI.Pages.define(
        "/controls/pages/contactControl/contactControl.html",
        {
            // This function is called whenever a user navigates to this page. It
            // populates the page elements with the app's data.
            ready: function (element, options) {
                options = options || {};
                this._first = "";
                this._last = "";
                this._birthday = "";

                // Set user-defined options
                WinJS.UI.setOptions(this, options);

                firstContent.textContent = this.first;
                lastContent.textContent = this.last;
                birthdayContent.textContent = this.birthday;
            },

            first: {
                get: function () { return this._first; },
                set: function (value) {
                    this._first = value;
                }
            },

            last: {
                get: function () { return this._last; },
                set: function (value) { this._last = value; }
            },

            birthday: {
                get: function () { return this._birthday; },
                set: function (value) { this._birthday = value; }
            },

            unload: function () {
                // TODO: Respond to navigations away from this page.
            },

            updateLayout: function (element, viewState, lastViewState) {
                /// <param name="element" domElement="true" />

                // TODO: Respond to changes in viewState.
            }
        }
    );

    WinJS.Namespace.define("WinJSControlsSample.UI", {
        Contact: controlDefinition,
    });
})();

