/// <reference path="/js/extensions.js" />
/// <reference path="storage.js" />
(function () {
    "use strict";

    var timeEntryClass = WinJS.Class.define(
        function constructor() {

            // define and initialize properties
            this.id = (new Date()).getTime();
            this._projectId = -1;
            this._dateWorked = (new Date()).removeTimePart();
            this.elapsedSeconds = 0;
            this.notes = "";
        },
        {
            // instance members
            projectId: {
                get: function () {
                    return this._projectId;
                },
                set: function (value) {
                    this._projectId = (value && !isNaN(value) && Number(value)) || this._projectId;
                }
            },

            dateWorked: {
                get: function () {
                    return this._dateWorked;
                },
                set: function (value) {
                    this._dateWorked = value.removeTimePart();
                }
            },


            project: {
                get: function () {
                    var p = Clok.Data.Storage.projects.getById(this._projectId);
                    return p;
                }
            },

        },
        {
            create: function (id, projectId, dateWorked, elapsedSeconds, notes) {
                var newTimeEntry = new Clok.Data.TimeEntry();

                newTimeEntry.id = id;
                newTimeEntry.projectId = projectId;
                newTimeEntry.dateWorked = dateWorked;
                newTimeEntry.elapsedSeconds = elapsedSeconds;
                newTimeEntry.notes = notes;

                return newTimeEntry;
            },

            createFromIndexedDbCursor: function (value) {
                return timeEntryClass.create(
                    value.id,
                    value._projectId,
                    value._dateWorked,
                    value.elapsedSeconds,
                    value.notes);
            },
        }
    );




    var dateToDayConverter = WinJS.Binding.converter(function (dt) {
        return formatDate("day", dt);
    });

    var dateToMonthConverter = WinJS.Binding.converter(function (dt) {
        return formatDate("month.abbreviated", dt);
    });

    var dateToYearConverter = WinJS.Binding.converter(function (dt) {
        return formatDate("year", dt);
    });


    var secondsToHoursConverter = WinJS.Binding.converter(function (s) {
        return Clok.Utilities.SecondsToHours(s, true);
    });


    var formatDate = function (format, dt) {
        var formatting = Windows.Globalization.DateTimeFormatting;
        var formatter = new formatting.DateTimeFormatter(format)
        return formatter.format(dt);
    }


    WinJS.Namespace.define("Clok.Data", {
        TimeEntry: timeEntryClass,
        DateToDayConverter: dateToDayConverter,
        DateToMonthConverter: dateToMonthConverter,
        DateToYearConverter: dateToYearConverter,
        SecondsToHoursConverter: secondsToHoursConverter,
    });

})();

