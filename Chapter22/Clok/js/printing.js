/// <reference path="/js/utilities.js" />
(function () {
    "use strict";

    var printingClass = WinJS.Class.define(
        function ctor() {
            this.printManager = Windows.Graphics.Printing.PrintManager.getForCurrentView();
            this.printManager_printtaskrequested_boundThis = this.printManager_printtaskrequested.bind(this);
            this._document = null;
            this._title = "Clok";
            this._completed = null;
        },
        {
            register: function (title, completed) {
                this._title = title || this._title;
                this._completed = completed || this._completed;
                this.printManager.addEventListener("printtaskrequested", this.printManager_printtaskrequested_boundThis);
            },

            unregister: function () {
                this.printManager.removeEventListener("printtaskrequested", this.printManager_printtaskrequested_boundThis);
                this._removeAlternateContent();
            },

            setAlternateContent: function (href) {
                this._removeAlternateContent();

                var alternateContent = document.createElement("link");
                alternateContent.setAttribute("id", "alternateContent");
                alternateContent.setAttribute("rel", "alternate");
                alternateContent.setAttribute("href", href);
                alternateContent.setAttribute("media", "print");
                document.getElementsByTagName("head")[0].appendChild(alternateContent);

                this.setDocument(document);
            },

            _removeAlternateContent: function () {
                var alternateContent = document.getElementById("alternateContent");
                if (alternateContent) {
                    document.getElementsByTagName("head")[0].removeChild(alternateContent);
                }
            },

            setDocument: function (doc) {
                this._document = doc;
            },

            print: function () {
                Windows.Graphics.Printing.PrintManager.showPrintUIAsync();
            },

            printManager_printtaskrequested: function (e) {
                if (this._document) {
                    var printTask = e.request.createPrintTask(this._title, function (args) {
                        args.setSource(MSApp.getHtmlPrintDocumentSource(this._document));
                        printTask.oncompleted = this._completed;
                    }.bind(this));
                }
            },
        }
    );

    WinJS.Namespace.define("Clok", {
        Printer: printingClass,
    });
})();
