(function () {
    "use strict";

    var nav = WinJS.Navigation;

    WinJS.UI.Pages.define("/pages/home/home.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            htmlButton.addEventListener("click", function (e) { nav.navigate("/pages/htmlcontrols/htmlcontrols.html") }, false);
            windowsButton.addEventListener("click", function (e) { nav.navigate("/pages/windowscontrols/windowscontrols.html") }, false);
            listViewBasicsButton.addEventListener("click", function (e) { nav.navigate("/pages/listViewBasics/listViewBasics.html") }, false);
            listViewGroupingButton.addEventListener("click", function (e) { nav.navigate("/pages/listViewGrouping/listViewGrouping.html") }, false);
            listViewLayoutsButton.addEventListener("click", function (e) { nav.navigate("/pages/listViewLayouts/listViewLayouts.html") }, false);
            flipViewButton.addEventListener("click", function (e) { nav.navigate("/pages/flipView/flipView.html") }, false);
            customControlsButton.addEventListener("click", function (e) { nav.navigate("/pages/customControls/customControls.html") }, false);
        }
    });
})();
