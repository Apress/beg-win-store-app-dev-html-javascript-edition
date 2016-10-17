// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/windowscontrols/windowscontrols.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {

            // message dialog event binding
            document.getElementById("myShowDialogButton").addEventListener("click", myShowDialogButton_Click, false);


            // flyout event binding
            document.getElementById("myShowFlyoutButton").addEventListener("click", myShowFlyoutButton_Click, false);
            document.getElementById("myCloseFlyoutButton").addEventListener("click", myCloseFlyoutButton_Click, false);


            // settings flyout button event binding
            document.getElementById("myShowSettingsButton").addEventListener("click", function () {
                WinJS.UI.SettingsFlyout.show();
            }, false);

        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in viewState.
        }
    });

    function myShowDialogButton_Click() {
        // Create the message dialog and set its content
        var msg = new Windows.UI.Popups.MessageDialog("Some irreversible process is about to begin. Do you wish to continue?", "Message dialog sample");

        // Add commands and set their command handlers
        msg.commands.append(new Windows.UI.Popups.UICommand("Continue", function (command) {
            myDialogResult.textContent = "You chose 'Continue'";
        }));

        msg.commands.append(new Windows.UI.Popups.UICommand("Cancel", function (command) {
            myDialogResult.textContent = "You chose 'Cancel'";
        }));

        // Set the command that will be invoked by default
        msg.defaultCommandIndex = 0;
        msg.cancelCommandIndex = 1;

        // Show the message dialog
        msg.showAsync();
    }

    function myShowFlyoutButton_Click() {
        myFlyout.winControl.show(myShowFlyoutButton, "top");
    }

    function myCloseFlyoutButton_Click() {
        myFlyout.winControl.hide();
    }


})();
