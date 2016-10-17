(function () {
    "use strict";

    var appData = Windows.Storage.ApplicationData.current;
    var roamingSettings = appData.roamingSettings;

    var page = WinJS.UI.Pages.define("/settings/invoiceOptions.html", {
        ready: function (element, options) {
            this.initializeSettingsControls();

            document.getElementById("companyName").onchange = this.companyName_change;
            document.getElementById("defaultRate").onchange = this.defaultRate_change;
            document.getElementById("paymentOptions").onchange = this.paymentOptions_change;
        },

        initializeSettingsControls: function () {
            document.getElementById("companyName").value = roamingSettings.values["invoiceCompanyName"];
            document.getElementById("defaultRate").value = roamingSettings.values["invoiceDefaultRate"];
            document.getElementById("paymentOptions").value = roamingSettings.values["invoicePaymentOptions"];
        },

        companyName_change: function (e) {
            roamingSettings.values["invoiceCompanyName"] = document.getElementById("companyName").value;
        },

        defaultRate_change: function (e) {
            if (!isNaN(document.getElementById("defaultRate").value)) {
                document.getElementById("defaultRate").value = Number(document.getElementById("defaultRate").value).toFixed(2);
                roamingSettings.values["invoiceDefaultRate"] = document.getElementById("defaultRate").value;
                document.getElementById("defaultRate").setCustomValidity("");
            } else {
                document.getElementById("defaultRate").setCustomValidity("Enter a number");
            }
        },

        paymentOptions_change: function (e) {
            roamingSettings.values["invoicePaymentOptions"] = document.getElementById("paymentOptions").value;
        },
    });
})();
