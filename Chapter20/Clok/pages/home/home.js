/// <reference path="/js/extensions.js" />
/// <reference path="/controls/js/clockControl.js" />
/// <reference path="/data/storage.js" />
/// <reference path="/data/timeEntry.js" />

(function () {
    "use strict";

    var appData = Windows.Storage.ApplicationData.current;
    var localSettings = appData.localSettings;

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
            } else {
                this.stopTimer();
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
        }
    });
})();
