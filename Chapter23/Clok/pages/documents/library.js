﻿// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    var appData = Windows.Storage.ApplicationData.current;
    var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager;

    var createOption = Windows.Storage.CreationCollisionOption;
    var pickerLocationId = Windows.Storage.Pickers.PickerLocationId;
    var thumbnailOptions = Windows.Storage.FileProperties.ThumbnailOptions;
    var thumbnailMode = Windows.Storage.FileProperties.ThumbnailMode;

    var storage = Clok.Data.Storage;

    WinJS.UI.Pages.define("/pages/documents/library.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            this.projectId = options && options.projectId;

            this.setProjectName();

            this.bindProjectLibraryFiles();
            libraryListView.winControl.onselectionchanged = this.libraryListView_selectionChanged.bind(this);
            this.configureListViewLayout();

            openDocumentCommand.winControl.onclick = this.openDocumentCommand_click.bind(this);
            openWithDocumentCommand.winControl.onclick = this.openWithDocumentCommand_click.bind(this);
            exportDocumentsCommand.winControl.onclick = this.exportDocumentsCommand_click.bind(this);
            shareDocumentsCommand.winControl.onclick = this.shareDocumentsCommand_click.bind(this);
            deleteDocumentsCommand.winControl.onclick = this.deleteDocumentsCommand_click.bind(this);
            addDocumentsCommand.winControl.onclick = this.addDocumentsCommand_click.bind(this);

            var transferMgr = dataTransferManager.getForCurrentView();
            this.transferMgr_dataRequested_boundThis = this.transferMgr_dataRequested.bind(this);

            transferMgr.addEventListener("datarequested", this.transferMgr_dataRequested_boundThis);
        },

        unload: function () {
            var transferMgr = dataTransferManager.getForCurrentView();
            transferMgr.removeEventListener("datarequested", this.transferMgr_dataRequested_boundThis);
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            this.configureListViewLayout();
        },


        configureListViewLayout: function () {
            var viewState = Windows.UI.ViewManagement.ApplicationView.value;

            if (viewState === Windows.UI.ViewManagement.ApplicationViewState.snapped) {
                libraryListView.winControl.layout = new WinJS.UI.ListLayout();
            } else {
                libraryListView.winControl.layout = new WinJS.UI.GridLayout({ groupHeaderPosition: "top" });
            }

        },


        setProjectName: function () {
            if (this.projectId) {
                var project = storage.projects.getById(this.projectId);
                projectName.innerText = project.name + " (" + project.clientName + ")";
                projectName.title = project.name + " (" + project.clientName + ")";
            }
        },


        getProjectFolder: function () {
            if (this.projectId) {
                var projectId = this.projectId;

                return appData.localFolder
                    .createFolderAsync("projectDocs", createOption.openIfExists)
                    .then(function (folder) {
                        return folder.createFolderAsync(projectId.toString(), createOption.openIfExists)
                    });
            } else {
                return WinJS.Promise.as();
            }
        },

        bindProjectLibraryFiles: function () {
            this.initialDocumentCount = 0;

            if (this.projectId) {
                var resizeThumbnail = thumbnailOptions.resizeThumbnail;
                var singleItem = thumbnailMode.singleItem;

                this.getProjectFolder().then(function (folder) {
                    var fileQuery = folder.createFileQuery();

                    var dataSourceOptions = {
                        mode: singleItem,
                        requestedThumbnailSize: 64,
                        thumbnailOptions: resizeThumbnail
                    };

                    var dataSource = new WinJS.UI.StorageDataSource(fileQuery, dataSourceOptions);

                    dataSource.getCount().then(function (count) {
                        this.initialDocumentCount = count;

                        if (count >= 1) {
                            libraryListView.winControl.itemDataSource = dataSource;
                            WinJS.Utilities.addClass(noDocuments, "hidden");
                            WinJS.Utilities.removeClass(libraryListView, "hidden");
                        } else {
                            WinJS.Utilities.removeClass(noDocuments, "hidden");
                            WinJS.Utilities.addClass(libraryListView, "hidden");
                        }
                    }.bind(this));
                }.bind(this));
            }
        },

        libraryListView_selectionChanged: function (e) {
            // Get the number of currently selected items
            var selectionCount = libraryListView.winControl.selection.count();

            if (selectionCount <= 0) {
                openDocumentCommand.winControl.disabled = true;
                openWithDocumentCommand.winControl.disabled = true;
                exportDocumentsCommand.winControl.disabled = true;
                shareDocumentsCommand.winControl.disabled = true;
                deleteDocumentsCommand.winControl.disabled = true;
                libraryAppBar.winControl.hide();
            } else if (selectionCount > 1) {
                openDocumentCommand.winControl.disabled = true;
                openWithDocumentCommand.winControl.disabled = true;
                exportDocumentsCommand.winControl.disabled = false;
                shareDocumentsCommand.winControl.disabled = false;
                deleteDocumentsCommand.winControl.disabled = false;
                libraryAppBar.winControl.show();
            } else { // if (selectionCount === 1) {
                openDocumentCommand.winControl.disabled = false;
                openWithDocumentCommand.winControl.disabled = false;
                exportDocumentsCommand.winControl.disabled = false;
                shareDocumentsCommand.winControl.disabled = false;
                deleteDocumentsCommand.winControl.disabled = false;
                libraryAppBar.winControl.show();
            }
        },

        addDocumentsCommand_click: function (e) {
            if (!this.canOpenPicker()) {
                return;
            }

            var filePicker = new Windows.Storage.Pickers.FileOpenPicker();
            filePicker.commitButtonText = "Add to Document Library";
            filePicker.suggestedStartLocation = pickerLocationId.desktop;
            filePicker.fileTypeFilter.replaceAll(["*"]);

            filePicker.pickMultipleFilesAsync().then(function (files) {
                if (files && files.size > 0) {

                    this.getProjectFolder().then(function (projectFolder) {
                        var copyPromises = files.map(function (item) {
                            return item.copyAsync(projectFolder, item.name, createOption.replaceExisting);
                        });

                        return WinJS.Promise.join(copyPromises);
                    }).then(function () {
                        if (this.initialDocumentCount === 0) {
                            this.bindProjectLibraryFiles();
                        }
                    }.bind(this));
                } else {
                    return WinJS.Promise.as();
                }
            }.bind(this));

        },

        openDocumentCommand_click: function (e) {
            libraryListView.winControl.selection.getItems()
                .then(function (selectedItems) {
                    if (selectedItems && selectedItems[0] && selectedItems[0].data) {
                        return Windows.System.Launcher.launchFileAsync(selectedItems[0].data);
                    }
                })
                .then(null, function error(result) {
                    new Windows.UI.Popups
                        .MessageDialog("Could not open file.", "An error occurred. ")
                        .showAsync();
                });
        },

        openWithDocumentCommand_click: function (e) {
            libraryListView.winControl.selection.getItems()
                .then(function (selectedItems) {
                    if (selectedItems && selectedItems[0] && selectedItems[0].data) {
                        var options = new Windows.System.LauncherOptions();
                        options.displayApplicationPicker = true;

                        return Windows.System.Launcher.launchFileAsync(selectedItems[0].data, options);
                    }
                })
                .then(null, function error(result) {
                    new Windows.UI.Popups
                        .MessageDialog("Could not open file.", "An error occurred. ")
                        .showAsync();
                });
        },

        exportDocumentsCommand_click: function (e) {
            if (!this.canOpenPicker()) {
                return;
            }

            var folderPicker = new Windows.Storage.Pickers.FolderPicker;
            folderPicker.suggestedStartLocation = pickerLocationId.desktop;
            folderPicker.fileTypeFilter.replaceAll(["*"]);

            folderPicker.pickSingleFolderAsync().then(function (folder) {
                if (folder) {
                    return libraryListView.winControl.selection.getItems()
                        .then(function (selectedItems) {
                            var copyPromises = selectedItems.map(function (item) {
                                return item.data.copyAsync(folder, item.data.name, createOption.generateUniqueName);
                            });

                            return WinJS.Promise.join(copyPromises);
                        });
                } else {
                    return WinJS.Promise.as();
                }
            }).then(function error(result) {
                new Windows.UI.Popups
                    .MessageDialog("All files successfully exported.", "File export is complete.")
                    .showAsync();
            }, function error(result) {
                new Windows.UI.Popups
                    .MessageDialog("Could not export all selected files.", "An error occurred. ")
                    .showAsync();
            });

        },

        shareDocumentsCommand_click: function (e) {
            dataTransferManager.showShareUI();
        },

        deleteDocumentsCommand_click: function (e) {
            var msg = new Windows.UI.Popups.MessageDialog("This cannot be undone.  Do you wish to continue?", "You're about to permanently delete files.");

            var buttonText = (libraryListView.winControl.selection.count() <= 1) ? "Yes, Delete It" : "Yes, Delete Them";

            msg.commands.append(new Windows.UI.Popups.UICommand(buttonText, function (command) {
                libraryListView.winControl.selection.getItems()
                    .then(function (selectedItems) {
                        var deletePromises = selectedItems.map(function (item) {
                            return item.data.deleteAsync();
                        });

                        return WinJS.Promise.join(deletePromises);
                    })
                    .then(null, function error(result) {
                        new Windows.UI.Popups
                            .MessageDialog("Could not delete all selected files.", "An error occurred. ")
                            .showAsync();
                    });
            }));

            msg.commands.append(new Windows.UI.Popups.UICommand("No, Don't Delete Anything", function (command) { }));

            msg.defaultCommandIndex = 0;
            msg.cancelCommandIndex = 1;

            msg.showAsync();
        },

        canOpenPicker: function () {
            var views = Windows.UI.ViewManagement;

            var currentState = views.ApplicationView.value;
            if (currentState === views.ApplicationViewState.snapped &&
                    !views.ApplicationView.tryUnsnap()) {
                return false;
            }
            return true;
        },

        transferMgr_dataRequested: function (e) {
            var request = e.request;
            var selectionCount = libraryListView.winControl.selection.count();

            if (selectionCount <= 0) {
                request.failWithDisplayText("Please select one or more documents and try again.");
                return;
            }

            libraryListView.winControl.selection.getItems()
                .then(function (selectedItems) {
                    var project = storage.projects.getById(this.projectId);

                    if (selectionCount === 1 && isImageType(selectedItems[0].data.fileType)) {
                        // handle single image
                        request.data.properties.title = "Image shared from Clok project";
                        request.data.properties.description
                            = "From " + project.name + " (" + project.clientName + ")";

                        var streamRef = Windows.Storage.Streams.RandomAccessStreamReference;
                        var stream = streamRef.createFromFile(selectedItems[0].data);
                        request.data.properties.thumbnail = stream;
                        request.data.setBitmap(stream);
                    } else {
                        // handle non-images or multiple files
                        request.data.properties.title = "File(s) shared from Clok project";
                        request.data.properties.description
                            = selectionCount.toString() + " file(s) from " + project.name + " (" + project.clientName + ")";
                    }

                    // share as files whether single image, non-images or multiple files
                    var files = selectedItems.map(function (item) {
                        return item.data;
                    });

                    request.data.setStorageItems(files);
                }.bind(this));
        },

    });



    function bindLibraryItem(source, sourceProperty, destination, destinationProperty) {
        var filenameElement = destination.querySelector(".libraryItem-filename");
        var modifiedElement = destination.querySelector(".libraryItem-modified");
        var sizeElement = destination.querySelector(".libraryItem-size");
        var iconElement = destination.querySelector(".libraryItem-icon");

        filenameElement.innerText = source.name;

        modifiedElement.innerText = source.basicProperties
            && source.basicProperties.dateModified
            && formatDateTime(source.basicProperties.dateModified);

        var size = source.basicProperties && source.basicProperties.size;
        if (size > (Math.pow(1024, 3))) {
            sizeElement.innerText = (size / Math.pow(1024, 3)).toFixed(1) + " GB";
        }
        else if (size > (Math.pow(1024, 2))) {
            sizeElement.innerText = (size / Math.pow(1024, 2)).toFixed(1) + " MB";
        }
        else if (size > 1024) {
            sizeElement.innerText = (size / 1024).toFixed(1) + " KB";
        }
        else {
            sizeElement.innerText = size + " B";
        }


        var url;

        if (source.thumbnail && isImageType(source.fileType)) {
            url = URL.createObjectURL(source.thumbnail, { oneTimeOnly: true });
        } else {
            url = getIcon(source.fileType);
        }

        iconElement.src = url;
        iconElement.title = source.displayType;
    }

    function formatDateTime(dt) {
        var formatting = Windows.Globalization.DateTimeFormatting;
        var dateFormatter = new formatting.DateTimeFormatter("shortdate");
        var timeFormatter = new formatting.DateTimeFormatter("shorttime");
        return dateFormatter.format(dt) + " " + timeFormatter.format(dt);
    }

    function isImageType(fileType) {
        fileType = (fileType || "").toLocaleUpperCase();

        return fileType === ".PNG"
            || fileType === ".GIF"
            || fileType === ".JPG"
            || fileType === ".JPEG"
            || fileType === ".BMP";
    }

    function getIcon(fileType) {
        fileType = (fileType || "").replace(".", "");

        var knownTypes = ["WAV", "XLS", "XLSX", "ZIP",
            "AI", "BMP", "DOC", "DOCX", "EPS", "GIF",
            "ICO", "JPEG", "JPG", "MP3", "PDF", "PNG",
            "PPT", "PPTX", "PSD", "TIFF", "VSD", "VSDX"];

        if (knownTypes.indexOf(fileType.toLocaleUpperCase()) >= 0) {
            return "/images/fileTypes/" + fileType + ".png";
        }

        return "/images/fileTypes/default.png";
    }

    WinJS.Utilities.markSupportedForProcessing(bindLibraryItem);

    WinJS.Namespace.define("Clok.Library", {
        bindLibraryItem: bindLibraryItem,
    });

})();



