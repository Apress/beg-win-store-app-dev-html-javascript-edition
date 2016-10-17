/// <reference path="//Microsoft.WinJS.1.0/js/base.js" />
/// <reference path="//Microsoft.WinJS.1.0/js/ui.js" />
(function () {
    "use strict";

    var util = WinJS.Utilities;

    var extenderClass = WinJS.Class.define(
        function constructor(extendedSplash, defaultSplash, loadingFunctionAsync) {
            this._extendedSplash = extendedSplash;
            this._defaultSplash = defaultSplash;
            this._loadingFunctionAsync = loadingFunctionAsync;

            this._defaultSplash.ondismissed = this._splash_dismissed.bind(this);

            this._show();
        },
        {
            _splash_dismissed: function (e) {
                WinJS.Promise.as(this._loadingFunctionAsync(e))
                    .done(function () {
                        this._hide();
                    }.bind(this));
            },

            _hide: function () {
                if (this._isVisible()) {
                    util.addClass(this._extendedSplash, "hidden");
                }
            },

            _show: function () {
                this._updatePosition();
                util.removeClass(this._extendedSplash, "hidden");
            },

            _isVisible: function () {
                return !util.hasClass(this._extendedSplash, "hidden");
            },

            _updatePosition: function () {
                var imgLoc = this._defaultSplash.imageLocation;

                var splashImage = this._extendedSplash.querySelector("#splashImage");
                splashImage.style.top = imgLoc.y + "px";
                splashImage.style.left = imgLoc.x + "px";
                splashImage.style.height = imgLoc.height + "px";
                splashImage.style.width = imgLoc.width + "px";

                var splashProgress = this._extendedSplash.querySelector("#splashProgress");
                splashProgress.style.marginTop = (imgLoc.y + imgLoc.height) + "px";
            },
        },
        { /* no static members */ }
    );


    WinJS.Namespace.define("Clok.SplashScreen", {
        Extender: extenderClass,
    });

})();

