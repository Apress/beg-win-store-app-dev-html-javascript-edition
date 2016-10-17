/// <reference path="/js/utilities.js" />
/// <reference path="/js/extensions.js" />
/// <reference path="/controls/js/clockControl.js" />
/// <reference path="/data/storage.js" />
/// <reference path="/data/timeEntry.js" />

(function () {
    "use strict";

    var appData = Windows.Storage.ApplicationData.current;
    var localSettings = appData.localSettings;
    var roamingSettings = appData.roamingSettings;

    var notifications = Windows.UI.Notifications;
    var notificationManager = notifications.ToastNotificationManager;
    var tileUpdateManager = notifications.TileUpdateManager;

    var startScreen = Windows.UI.StartScreen;
    var secondaryTile = startScreen.SecondaryTile;

    var nav = WinJS.Navigation;
    var storage = Clok.Data.Storage;

    WinJS.UI.Pages.define("/pages/home/home.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {

            this.initializeMenuPointerAnimations();
            this.bindListOfProjects();
            this.setDashboardStateFromSettings();
            this.setupTimerRelatedControls();

            toggleTimerMenuItem.onclick = this.toggleTimerMenuItem_click.bind(this);
            project.onchange = this.project_change.bind(this);
            timeNotes.onchange = this.timeNotes_change.bind(this);
            editProjectButton.onclick = this.editProjectButton_click.bind(this);
            saveTimeButton.onclick = this.saveTimeButton_click.bind(this);
            discardTimeButton.onclick = this.discardTimeButton_click.bind(this);

            cameraMenuItem.onclick = this.cameraMenuItem_click.bind(this);
            cameraMenuItem.oncontextmenu = this.cameraMenuItem_contextmenu.bind(this);
            projectsMenuItem.onclick = this.projectsMenuItem_click.bind(this);
            timesheetMenuItem.onclick = this.timesheetMenuItem_click.bind(this);

        },



        initializeMenuPointerAnimations: function () {
            var buttons = WinJS.Utilities.query(".mainMenuItem");
            buttons.listen("MSPointerDown", this.pointer_down, false);
            buttons.listen("MSPointerUp", this.pointer_up, false);
            buttons.listen("MSPointerOut", this.pointer_up, false);
        },

        pointer_down: function (e) {
            WinJS.UI.Animation.pointerDown(this);
            e.preventDefault();
        },

        pointer_up: function (e) {
            WinJS.UI.Animation.pointerUp(this);
            e.preventDefault();
        },


        timerIsRunning: false,

        toggleTimerMenuItem_click: function (e) {
            this.toggleTimer();
        },

        bindListOfProjects: function () {
            project.options.length = 1; // remove all except first project

            var activeProjects = storage.projects.filter(function (p) { return p.status === Clok.Data.ProjectStatuses.Active; });

            activeProjects.forEach(function (item) {
                var option = document.createElement("option");
                option.text = item.name + " (" + item.projectNumber + ")";
                option.title = item.clientName;
                option.value = item.id;
                project.appendChild(option);
            });
        },

        project_change: function (e) {
            this.enableOrDisableButtons();
            this.saveDashboardStateToSettings();
        },

        timeNotes_change: function (e) {
            this.saveDashboardStateToSettings();
        },

        editProjectButton_click: function (e) {
            var id = project.options[project.selectedIndex].value;
            nav.navigate("/pages/projects/detail.html", { id: id });
        },

        discardTimeButton_click: function (e) {
            this.discard();
        },

        saveTimeButton_click: function (e) {
            this.save();
        },

        save: function () {
            var self = this;

            var transitionPromise = new WinJS.Promise(function (comp, err, prog) {
                timeEntry.style.transition = 'color 5ms ease 0s, transform 500ms ease 0s, opacity 500ms ease 0s';

                timeEntry.style.transformOrigin = "-130px 480px";
                timeEntry.style.transform = 'scale3d(0,0,0)';
                timeEntry.style.opacity = '0';
                timeEntry.style.color = '#00ff00';

                var self = this;
                var transitionend = function (e1) {
                    if (e1.propertyName === "transform") {
                        timeEntry.removeEventListener('transitionend', transitionend);
                        comp();
                    }
                };

                timeEntry.addEventListener('transitionend', transitionend, false);
            });

            var savePromise = new WinJS.Promise(function (comp, err, prog) {
                var timeEntry = new Clok.Data.TimeEntry();
                timeEntry.projectId = project.options[project.selectedIndex].value;
                timeEntry.dateWorked = new Date(elapsedTimeClock.winControl.startStops[0].startTime);
                timeEntry.elapsedSeconds = elapsedTimeClock.winControl.timerValue;
                timeEntry.notes = timeNotes.value;

                storage.timeEntries.save(timeEntry);

                comp();
            });

            WinJS.Promise.join([transitionPromise, savePromise]).done(function () {
                self.resetTimer();
                self.removeDashboardStateFromSettings();
            });
        },

        discard: function () {
            var self = this;

            var slideTransition = WinJS.UI.executeTransition(
                timeEntry,
                [
                    {
                        property: "transform",
                        delay: 0,
                        duration: 500,
                        timing: "ease",
                        from: "rotate(0deg) scale3d(1,1,1)",
                        to: "rotate(720deg) scale3d(0,0,0)"
                    },
                    {
                        property: "opacity",
                        delay: 0,
                        duration: 500,
                        timing: "ease",
                        from: 1,
                        to: 0
                    },
                    {
                        property: "color",
                        delay: 0,
                        duration: 5,
                        timing: "ease",
                        from: '#ffffff',
                        to: '#ff0000'
                    }
                ]).done(function () {
                    self.resetTimer();
                    self.removeDashboardStateFromSettings();
                });
        },

        toggleTimer: function () {
            this.timerIsRunning = !this.timerIsRunning;
            this.setupTimerRelatedControls();
            this.saveDashboardStateToSettings();
        },

        resetTimer: function () {
            this.timerIsRunning = false;
            elapsedTimeClock.winControl.reset();
            project.selectedIndex = 0;
            timeNotes.value = "";

            this.resetTimerStyles();
            this.setupTimerRelatedControls();
        },

        resetTimerStyles: function () {
            timeEntry.style.transition = 'none';
            timeEntry.style.transformOrigin = "50% 50%";
            timeEntry.style.transform = 'scale3d(1,1,1)';
            timeEntry.style.opacity = '1';
            timeEntry.style.color = '#ffffff';
        },

        setupTimerRelatedControls: function () {
            if (this.timerIsRunning) {
                this.startTimer();
                this.scheduleToast();
                this.enableLiveTile();
            } else {
                this.stopTimer();
                this.unscheduleToast();
                this.disableLiveTile();
            }

            this.enableOrDisableButtons();
        },

        startTimer: function () {
            elapsedTimeClock.winControl.start();
            timerImage.src = "/images/Clock-Running.png";
            timerTitle.innerText = "Stop Clok";
            this.timerIsRunning = true;
        },

        stopTimer: function () {
            elapsedTimeClock.winControl.stop();
            timerImage.src = "/images/Clock-Stopped.png";
            timerTitle.innerText = "Start Clok";
            this.timerIsRunning = false;
        },

        enableOrDisableButtons: function () {
            if ((project.options[project.selectedIndex].value !== "") && (!this.timerIsRunning) && (elapsedTimeClock.winControl.timerValue > 0)) {
                saveTimeButton.disabled = false;
            } else {
                saveTimeButton.disabled = true;
            }

            discardTimeButton.disabled = (this.timerIsRunning) || (elapsedTimeClock.winControl.timerValue <= 0);

            editProjectButton.disabled = (project.options[project.selectedIndex].value === "");
        },

        cameraMenuItem_click: function (e) {
            nav.navigate("/pages/documents/cameraCapture.html");
        },

        cameraMenuItem_contextmenu: function (e) {
            var pinMenu = new Windows.UI.Popups.PopupMenu();

            var pinCommand = new Windows.UI.Popups.UICommand("Pin to Start");
            pinCommand.id = "pin";

            var unpinCommand = new Windows.UI.Popups.UICommand("Unpin from Start");
            unpinCommand.id = "unpin";

            if (!secondaryTile.exists("Camera")) {
                pinMenu.commands.append(pinCommand);
            } else {
                pinMenu.commands.append(unpinCommand);
            }


            var buttonRect = cameraMenuItem.getBoundingClientRect();
            var buttonCoordinates = {
                x: buttonRect.left,
                y: buttonRect.top,
                width: buttonRect.width,
                height: buttonRect.height
            };

            pinMenu.showForSelectionAsync(buttonCoordinates)
                .then(function (command) {
                    if (command) {
                        if (command.id === "pin") {
                            this.pinCameraToStart();
                        } else if (command.id === "unpin") {
                            this.unpinCameraFromStart();
                        }
                    }
                }.bind(this));

        },

        pinCameraToStart: function () {
            var uriLogo = new Windows.Foundation.Uri("ms-appx:///images/Camera.png");
            var displayName = "Clok Camera";

            var tile = new secondaryTile(
                "Camera",
                displayName,
                displayName,
                "camera",
                startScreen.TileOptions.showNameOnLogo,
                uriLogo);

            tile.foregroundText = startScreen.ForegroundText.light;

            var buttonRect = cameraMenuItem.getBoundingClientRect();
            var buttonCoordinates = {
                x: buttonRect.left,
                y: buttonRect.top,
                width: buttonRect.width,
                height: buttonRect.height
            };
            var placement = Windows.UI.Popups.Placement.above;

            tile.requestCreateForSelectionAsync(buttonCoordinates, placement).done();
        },


        unpinCameraFromStart: function () {
            var buttonRect = cameraMenuItem.getBoundingClientRect();
            var buttonCoordinates = {
                x: buttonRect.left,
                y: buttonRect.top,
                width: buttonRect.width,
                height: buttonRect.height
            };
            var placement = Windows.UI.Popups.Placement.above;

            var tile = new secondaryTile("Camera");
            tile.requestDeleteForSelectionAsync(buttonCoordinates, placement).done();
        },


        projectsMenuItem_click: function (e) {
            nav.navigate("/pages/projects/list.html");
        },

        timesheetMenuItem_click: function (e) {
            nav.navigate("/pages/timeEntries/list.html");
        },

        saveDashboardStateToSettings: function () {
            var state = JSON.stringify({
                startStops: elapsedTimeClock.winControl.startStops,
                projectId: project.options[project.selectedIndex].value,
                timeNotes: timeNotes.value,
            });

            localSettings.values["dashboardState"] = state;
        },

        removeDashboardStateFromSettings: function () {
            localSettings.values.remove("dashboardState");
        },

        setDashboardStateFromSettings: function () {
            var state = localSettings.values["dashboardState"];

            if (state) {
                state = JSON.parse(state);

                elapsedTimeClock.winControl.startStops = state.startStops;
                project.selectedIndex = this.getIndexOfProjectId(state.projectId);
                timeNotes.value = state.timeNotes;

                if (elapsedTimeClock.winControl.isRunning) {
                    this.startTimer();
                    if (!roamingSettings.values["hideAlreadyRunningToastOnLaunchToggle"]) {
                        this.showLocalToast();
                    }
                }
            }
        },

        getIndexOfProjectId: function (projectId) {
            var index = 0;

            for (var i = 0; i < project.options.length; i++) {
                if (ClokUtilities.Guid.isGuid(project.options[i].value) && project.options[i].value === projectId) {
                    index = i;
                    break;
                }
            }

            return index;
        },

        getStillRunningToastContent: function (seconds) {
            seconds = seconds || elapsedTimeClock.winControl.timerValue;

            if (elapsedTimeClock.winControl.isRunning && seconds > 0) {
                var hours = Math.floor(Clok.Utilities.SecondsToHours(seconds, false));

                var template = notifications.ToastTemplateType.toastImageAndText02;
                var toastContent = notificationManager.getTemplateContent(template);

                // image
                var imageNodes = toastContent.getElementsByTagName("image");
                imageNodes[0].setAttribute("src", "ms-appx:///images/Clock-Running.png");

                // text
                var textNodes = toastContent.getElementsByTagName("text");
                textNodes[0].appendChild(toastContent.createTextNode("Clok is running"));
                textNodes[1].appendChild(toastContent.createTextNode(
                    "Clok has been running for more than " + hours + " hours."));

                // audio
                //var toastNode = toastContent.selectSingleNode("/toast");
                //toastNode.setAttribute("duration", "long");

                //var audio = toastContent.createElement("audio");
                //audio.setAttribute("src", "ms-winsoundevent:Notification.Looping.Call");
                //audio.setAttribute("loop", "true");

                //toastNode.appendChild(audio);

                return toastContent;
            }
        },

        showLocalToast: function () {
            var toastContent = this.getStillRunningToastContent();

            if (toastContent) {
                var toast = new notifications.ToastNotification(toastContent);
                notificationManager.createToastNotifier().show(toast);
            }
        },

        scheduleToast: function () {
            var reminderThreshold = 8; // hours
            var toastContent = this.getStillRunningToastContent(reminderThreshold * 60 * 60);

            if (toastContent) {
                var seconds = elapsedTimeClock.winControl.timerValue;
                var notifyTime = (new Date()).addSeconds(-seconds).addHours(reminderThreshold);
                //var notifyTime = (new Date()).addSeconds(20);
                if (notifyTime.getTime() > (new Date()).getTime()) {
                    var snoozeTime = 30 * 60 * 1000; // 30 min
                    var snoozeCount = 5;
                    var toast = new notifications.ScheduledToastNotification(
                        toastContent,
                        notifyTime,
                        snoozeTime,
                        snoozeCount);
                    toast.id = "IsRunningToast";
                    notificationManager.createToastNotifier().addToSchedule(toast);
                }
            }
        },

        unscheduleToast: function () {
            var notifier = notificationManager.createToastNotifier();
            var scheduled = notifier.getScheduledToastNotifications();

            for (var i = 0, len = scheduled.length; i < len; i++) {
                if (scheduled[i].id === "IsRunningToast") {
                    notifier.removeFromSchedule(scheduled[i]);
                }
            }
        },

        enableLiveTile: function () {
            var tileContentString = "<tile>"
                + "<visual>"
                + "<binding template=\"TileSquarePeekImageAndText04\" branding=\"logo\">"
                + "<image id=\"1\" src=\"ms-appx:///images/Clock-Running.png\"/>"
                + "<text id=\"1\">Clok is running</text>"
                + "</binding>  "
                + "<binding template=\"TileWidePeekImage06\" branding=\"none\">"
                + "<image id=\"1\" src=\"ms-appx:///images/widelogo.png\"/>"
                + "<image id=\"2\" src=\"ms-appx:///images/Clock-Running.png\"/>"
                + "<text id=\"1\">Clok is running</text>"
                + "</binding>"
                + "</visual>"
                + "</tile>";

            var tileContentXml = new Windows.Data.Xml.Dom.XmlDocument();
            tileContentXml.loadXml(tileContentString);

            // create a tile notification
            var tile = new notifications.TileNotification(tileContentXml);

            // send the notification to the app's application tile
            tileUpdateManager.createTileUpdaterForApplication().update(tile);


        },

        disableLiveTile: function () {
            tileUpdateManager.createTileUpdaterForApplication().clear();
        },

    });
})();
