/// <reference path="/data/project.js" />
/// <reference path="/data/storage.js" />
// For an introduction to the Share Contract template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232513

(function () {
    "use strict";

    var app = WinJS.Application;
    var appData = Windows.Storage.ApplicationData.current;
    var storage = Clok.Data.Storage;

    var createOption = Windows.Storage.CreationCollisionOption;
    var standardDataFormats = Windows.ApplicationModel.DataTransfer.StandardDataFormats;

    var share;

    function onShareSubmit() {
        document.querySelector(".progressindicators").style.visibility = "visible";
        document.querySelector("#project").disabled = true;
        document.querySelector(".submitbutton").disabled = true;

        share.reportStarted();
        addDocuments();
        share.reportCompleted();
    }

    function project_change() {
        document.querySelector(".submitbutton").disabled
            = (project.options[project.selectedIndex].value === "");
    }

    // This function responds to all application activations.
    app.onactivated = function (args) {
        if (args.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.shareTarget) {
            WinJS.Application.addEventListener("shareactivated", shareActivated, false);
            WinJS.Application.queueEvent({ type: "shareactivated", detail: args.detail });
        }
    };

    var shareActivated = function (args) {
        var thumbnail;

        document.querySelector(".submitbutton").disabled = true;
        document.querySelector(".submitbutton").onclick = onShareSubmit;

        bindListOfProjects();
        project.onchange = project_change;

        share = args.detail.shareOperation;

        document.querySelector(".shared-title").textContent = share.data.properties.title;
        document.querySelector(".shared-description").textContent = share.data.properties.description;

        thumbnail = share.data.properties.thumbnail;
        if (thumbnail) {
            // If the share data includes a thumbnail, display it.
            args.setPromise(thumbnail.openReadAsync().done(function displayThumbnail(stream) {
                document.querySelector(".shared-thumbnail").src = window.URL.createObjectURL(stream);
            }));
        } else {
            // If no thumbnail is present, expand the description  and
            // title elements to fill the unused space.
            document.querySelector("section[role=main] header").style.setProperty("-ms-grid-columns", "0px 0px 1fr");
            document.querySelector(".shared-thumbnail").style.visibility = "hidden";
        }

        if (share.data.contains(standardDataFormats.storageItems)) {
            share.data.getStorageItemsAsync().done(function (files) {
                if (files && files.length > 0) {
                    var names = files.map(function (file) { return "<li>" + file.name + "</li>"; }).join("");
                    fileNames.innerHTML = names;
                }
            });
        }
    };

    var getProjectFolder = function (projectId) {
        return appData.localFolder
            .createFolderAsync("projectDocs", createOption.openIfExists)
            .then(function (folder) {
                return folder.createFolderAsync(projectId.toString(), createOption.openIfExists)
            });
    };

    var addDocuments = function () {
        var projectId = project.options[project.selectedIndex].value;
        getProjectFolder(projectId).then(function (projFolder) {
            if (share.data.contains(standardDataFormats.storageItems)) {
                share.data.getStorageItemsAsync().done(function (files) {
                    var copyPromises = files.map(function (item) {
                        return item.copyAsync(projFolder, item.name, createOption.replaceExisting);
                    });

                    WinJS.Promise.join(copyPromises);
                });
            }
        });
    };

    var bindListOfProjects = function () {
        storage.initialize().then(function () {
            project.options.length = 1; // remove all except first project

            var activeProjects = storage.projects.filter(function (p) { return p.status === Clok.Data.ProjectStatuses.Active; });

            activeProjects.forEach(function (item) {
                var option = document.createElement("option");
                option.text = item.name + " (" + item.projectNumber + ")";
                option.title = item.clientName;
                option.value = item.id;
                project.appendChild(option);
            });
        });
    };

    app.start();
})();

