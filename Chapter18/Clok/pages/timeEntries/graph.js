/// <reference path="/js/extensions.js" />
// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/timeEntries/graph.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {

            var timeGraphWorker = new Worker("/js/workers/timeGraphWorker.js");

            timeGraphWorker.onmessage = function getGraphData(e) {
                var message = e.data;

                if (message && message.type === "graphdata") {
                    var graphoptions = {
                        bars: {
                            show: true,
                            stacked: true,
                            horizontal: false,
                            barWidth: 0.6,
                            lineWidth: 1,
                            shadowSize: 0
                        },
                        legend: {
                            position: "ne",
                            backgroundColor: "#fff",
                            labelBoxMargin: 10,
                        },
                        grid: {
                            color: "#000",
                            tickColor: "#eee",
                            backgroundColor: {
                                colors: [[0, "#ddf"], [1, "#cce"]],
                                start: "top",
                                end: "bottom"
                            },
                            verticalLines: true,
                            minorVerticalLines: true,
                            horizontalLines: true,
                            minorHorizontalLines: true,
                        },
                        xaxis: {
                            color: "#fff",
                            showLabels: true,
                            ticks: message.ticks,
                            minorTicks: message.minorTicks,
                        },
                        yaxis: {
                            color: "#fff",
                        },
                        title: this.formatDate(options.filter.startDate) + " - " + this.formatDate(options.filter.endDate),
                        HtmlText: true
                    };

                    // Draw graph
                    var graph = Flotr.draw(graphcontainer, message.data, graphoptions);

                    // clean up
                    timeGraphWorker.terminate();
                    graph.destroy();
                } else if (message && message.type === "noresults") {
                    graphcontainer.innerHTML = "No data found.  Try adjusting the filters.";
                }
            }.bind(this);

            timeGraphWorker.postMessage({
                startDate: options.filter.startDate,
                endDate: options.filter.endDate,
                projectId: options.filter.projectId
            });

            Clok.Utilities.DisableInSnappedView();
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            Clok.Utilities.DisableInSnappedView();
        },


        formatDate: function (dt) {
            var formatting = Windows.Globalization.DateTimeFormatting;
            var formatter = new formatting.DateTimeFormatter("day month.abbreviated");
            return formatter.format(dt);
        },

    });
})();
