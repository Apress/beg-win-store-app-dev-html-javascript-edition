/// <reference path="/js/extensions.js" />
(function () {
    "use strict";

    var apikey = "PUT_YOUR_KEY_HERE";
    var apiEndpoint = "http://dev.virtualearth.net/REST/v1/";
    var xhrTimeout = 2000;

    var mapsClass = WinJS.Class.define(
        function constructor() { /* empty constructor */ },
        { /* static class, no instance members */ },
        {
            credentials: {
                get: function () { return apikey; }
            },

            getDirections: function (start, end) {
                var distanceUnit = "mi";

                var routeRequest = apiEndpoint + "Routes?"
                    + "wp.0=" + start
                    + "&wp.1=" + end
                    + "&du=" + distanceUnit
                    + "&routePathOutput=Points&output=json"
                    + "&key=" + apikey;


                return WinJS.Promise.timeout(xhrTimeout, WinJS.xhr({ url: routeRequest }))
                    .then(function (response) {

                        var resp = JSON.parse(response.responseText);

                        if (resp
                                && resp.resourceSets
                                && resp.resourceSets[0]
                                && resp.resourceSets[0].resources
                                && resp.resourceSets[0].resources[0]
                                && resp.resourceSets[0].resources[0].routeLegs
                                && resp.resourceSets[0].resources[0].routeLegs[0]
                                && resp.resourceSets[0].resources[0].routeLegs[0].itineraryItems
                                && resp.resourceSets[0].resources[0].routeLegs[0].itineraryItems.length > 0
                        ) {
                            var directions = {
                                copyright: resp.copyright,
                                distanceUnit: resp.resourceSets[0].resources[0].distanceUnit,
                                durationUnit: resp.resourceSets[0].resources[0].durationUnit,
                                travelDistance: resp.resourceSets[0].resources[0].travelDistance,
                                travelDuration: resp.resourceSets[0].resources[0].travelDuration,
                                bbox: resp.resourceSets[0].resources[0].bbox
                            }

                            var itineraryItems =
                                resp.resourceSets[0].resources[0].routeLegs[0].itineraryItems.map(
                                    function (item) {
                                        return {
                                            compassDirection: item.compassDirection,
                                            instructionText: item.instruction.text,
                                            maneuverType: item.instruction.maneuverType,
                                            travelDistance: item.travelDistance,
                                            travelDuration: item.travelDuration,
                                            warnings: item.warnings || []
                                        };
                                    });

                            directions.itineraryItems = new WinJS.Binding.List(itineraryItems);

                            return directions;
                        }

                        return null;
                    });
            }

        }
    );

    var secondsToTravelTimeConverter = WinJS.Binding.converter(function (s) {
        if (s > 3600) {
            return Clok.Utilities.SecondsToHours(s, true) + " hr";
        } else if (s > 60) {
            return (s / 60).toFixed(0) + " min";
        } else {
            return "< 1 min"
        }
    });

    var travelDistanceConverter = WinJS.Binding.converter(function (distance) {
        if (distance >= 5) {
            return distance.toFixed(0) + " mi";
        } else if (distance >= 0.2) {
            return distance.toFixed(2) + " mi";
        } else {
            return (distance * 5280).toFixed(0) + " ft";
        }
    });

    WinJS.Namespace.define("Clok.Data", {
        BingMaps: mapsClass,
        TravelTimeConverter: secondsToTravelTimeConverter,
        TravelDistanceConverter: travelDistanceConverter
    });

})();

