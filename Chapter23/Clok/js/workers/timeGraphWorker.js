/// <reference group="Dedicated Worker" />

importScripts(
    "//Microsoft.WinJS.1.0/js/base.js",
    "/js/extensions.js",
    "/js/utilities.js",
    "/data/project.js",
    "/data/timeEntry.js",
    "/data/storage.js"
    );

(function () {
    "use strict";

    var data = Clok.Data;
    var storage = data.Storage;

    self.onmessage = function (e) {
        getData(e.data);
    };


    function getData(messageData) {
        storage.timeEntries.getSortedFilteredTimeEntriesAsync(
                messageData.startDate,
                messageData.endDate,
                messageData.projectId)
            .then(
                function complete(results) {
                    if (results.length <= 0) {
                        self.postMessage({
                            type: "noresults"
                        });
                    } else {

                        var msInDay = 86400000;

                        var graphdata = results.map(function (item) {
                            return {
                                clientName: item.project.clientName
                                    + ((messageData.projectId > 0)
                                        ? ": " + item.project.name
                                        : ""),
                                dateWorked: item.dateWorked.removeTimePart(),
                                timeWorked: Clok.Utilities.SecondsToHours(item.elapsedSeconds, false)
                            };
                        }).reduce(function (accumulated, current) {
                            // first make sure that this client has all days defined, even if 0 hours
                            var found = false;
                            for (var i = 0; i < accumulated.length; i++) {
                                if (accumulated[i][0] === current.clientName) {
                                    found = true;
                                    continue;
                                }
                            }

                            if (!found) {
                                var worked = [];
                                var dt = messageData.startDate;
                                while (dt <= messageData.endDate) {
                                    worked[worked.length] = [dt / msInDay, 0];
                                    dt = dt.addDays(1);
                                }

                                accumulated[accumulated.length] = [current.clientName, worked];
                            }

                            for (var i = 0; i < accumulated.length; i++) {
                                if (accumulated[i][0] === current.clientName) {
                                    for (var j = 0; j < accumulated[i][1].length; j++) {
                                        if (accumulated[i][1][j][0] === current.dateWorked.getTime() / msInDay) {
                                            accumulated[i][1][j][1] += current.timeWorked;
                                            continue;
                                        }
                                    }
                                }
                            }

                            return accumulated;
                        }, []).map(function (item) {
                            return { label: item[0], data: item[1] };
                        });



                        var tickDays = [], otherDays = [];

                        var dateFormatter = function (dt) {
                            var formatting = Windows.Globalization.DateTimeFormatting;
                            var formatter = new formatting.DateTimeFormatter("day month.abbreviated");
                            return formatter.format(dt);
                        };



                        var dt = messageData.startDate;
                        while (dt <= messageData.endDate) {
                            if ((dt.getDay() === 0)
                                    || (messageData.startDate.addDays(7) >= messageData.endDate)
                                    || (messageData.startDate.getTime() === dt.getTime())
                                    || (messageData.endDate.getTime() === dt.getTime())
                                ) {
                                tickDays.push([dt / msInDay, dateFormatter(dt)]);
                            } else {
                                otherDays.push([dt / msInDay, dateFormatter(dt)]);
                            }

                            dt = dt.addDays(1);
                        }


                        //// simulate a long-running process
                        //for (var n = 1; n <= 10000000; n++) { }


                        self.postMessage({
                            type: "graphdata",
                            ticks: tickDays,
                            minorTicks: otherDays,
                            data: graphdata
                        });
                    }
                }.bind(this)
            );
    }
})();
