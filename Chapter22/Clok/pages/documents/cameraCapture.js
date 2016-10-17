/// <reference path="/js/camera.js" />
// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    var appData = Windows.Storage.ApplicationData.current;
    var createOption = Windows.Storage.CreationCollisionOption;
    var capture = Windows.Media.Capture;
    var devices = Windows.Devices.Enumeration;

    var nav = WinJS.Navigation;
    var storage = Clok.Data.Storage;


    WinJS.UI.Pages.define("/pages/documents/cameraCapture.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            this.file = null;

            var deviceInfo = devices.DeviceInformation;
            return deviceInfo.findAllAsync(devices.DeviceClass.videoCapture)
                .then(function (found) {
                    return found && found.length && found.length > 0;
                }, function error() {
                    return false;
                }).then(function (exists) {
                    this.showCameraControls(exists);
                    if (exists) {
                        this.bindProjects();
                        capturedImage.addEventListener("click", this.capturedImage_click.bind(this));
                        saveCameraCaptureButton.addEventListener("click", this.saveCameraCaptureButton_click.bind(this));
                        discardCameraCaptureButton.addEventListener("click", this.discardCameraCaptureButton_click.bind(this));
                        goToDocumentsButton.onclick = this.goToDocumentsButton_click.bind(this);
                        projects.addEventListener("change", this.projects_change.bind(this));

                        this.resetScreen();
                        // only if navigated, not if back arrow
                        if (!nav.canGoForward) {
                            this.showCameraCaptureUI();
                        }
                    }
                }.bind(this));

            Clok.Utilities.DisableInSnappedView();
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            Clok.Utilities.DisableInSnappedView();
        },

        showCameraControls: function (show) {
            if (show) {
                WinJS.Utilities.removeClass(cameraContainer, "hidden");
                WinJS.Utilities.addClass(noCamera, "hidden");
            } else {
                WinJS.Utilities.addClass(cameraContainer, "hidden");
                WinJS.Utilities.removeClass(noCamera, "hidden");
            }
        },

        projects_change: function (e) {
            if (!this.file) {
                saveCameraCaptureButton.disabled = true;
            } else {
                saveCameraCaptureButton.disabled = !projects.options[projects.selectedIndex].value;
            }

            var id = projects.options[projects.selectedIndex].value;
            goToDocumentsButton.disabled = !ClokUtilities.Guid.isGuid(id);
        },

        goToDocumentsButton_click: function (e) {
            var id = projects.options[projects.selectedIndex].value;
            if (ClokUtilities.Guid.isGuid(id)) {
                nav.navigate("/pages/documents/library.html", { projectId: id });
            }
        },

        discardCameraCaptureButton_click: function (e) {
            this.resetScreen();
        },

        saveCameraCaptureButton_click: function (e) {
            var dateFormatString = "{year.full}{month.integer(2)}{day.integer(2)}"
                + "-{hour.integer(2)}{minute.integer(2)}{second.integer(2)}";
            var clockIdentifiers = Windows.Globalization.ClockIdentifiers;

            var formatting = Windows.Globalization.DateTimeFormatting;
            var formatterTemplate = new formatting.DateTimeFormatter(dateFormatString);
            var formatter = new formatting.DateTimeFormatter(formatterTemplate.patterns[0],
                        formatterTemplate.languages,
                        formatterTemplate.geographicRegion,
                        formatterTemplate.calendar,
                        clockIdentifiers.twentyFourHour);

            var filename = formatter.format(new Date()) + ".png";

            var projectId = projects.options[projects.selectedIndex].value;

            this.getProjectFolder(projectId)
                .then(function (projectFolder) {
                    return this.file.copyAsync(projectFolder, filename, createOption.generateUniqueName);
                }.bind(this)).then(function (file) {
                    this.resetScreen();
                }.bind(this));
        },

        bindProjects: function () {
            projects.options.length = 1; // remove all except first project

            var activeProjects = storage.projects.filter(function (p) {
                return p.status === Clok.Data.ProjectStatuses.Active;
            });

            activeProjects.forEach(function (item) {
                var option = document.createElement("option");
                option.text = item.name + " (" + item.projectNumber + ")";
                option.title = item.clientName;
                option.value = item.id;
                projects.appendChild(option);
            });
        },

        getProjectFolder: function (projectId) {
            return appData.localFolder
                .createFolderAsync("projectDocs", createOption.openIfExists)
                .then(function (folder) {
                    return folder.createFolderAsync(projectId.toString(), createOption.openIfExists)
                });
        },

        capturedImage_click: function (e) {
            this.showCameraCaptureUI();
        },

        resetScreen: function () {
            capturedImage.src = "/images/camera-placeholder.png";
            this.file = null;
            saveCameraCaptureButton.disabled = true;
            discardCameraCaptureButton.disabled = true;
        },

        showCameraCaptureUI: function () {
            var dialog = new capture.CameraCaptureUI();
            dialog.photoSettings.maxResolution = capture.CameraCaptureUIMaxPhotoResolution.highestAvailable;
            dialog.captureFileAsync(capture.CameraCaptureUIMode.photo)
                .done(function (file) {
                    if (file) {
                        var photoBlobUrl = URL.createObjectURL(file, { oneTimeOnly: true });
                        capturedImage.src = photoBlobUrl;
                        saveCameraCaptureButton.disabled = !projects.options[projects.selectedIndex].value;
                        discardCameraCaptureButton.disabled = false;
                        this.file = file;
                    } else {
                        this.resetScreen();
                    }
                }.bind(this), function (err) {
                    this.resetScreen();
                }.bind(this));
        },

    });
})();
