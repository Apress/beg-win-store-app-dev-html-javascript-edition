(function () {
    "use strict";

    var projectClass = WinJS.Class.define(
        function constructor() {

            // define and initialize properties
            this.id = (new Date()).getTime();
            this.name = "";
            this.projectNumber = "";
            this.status = statuses.Active;
            this.description = "";
            this.startDate = new Date();
            this.dueDate = new Date();
            this.clientName = "";
            this.contactName = "";
            this.address1 = "";
            this.address2 = "";
            this.city = "";
            this.region = "";
            this.postalCode = "";
            this.email = "";
            this.phone = "";
        },
        {
            // instance members
        },
        {
            // static members
        }
    );


    // clockModes is an enum(eration) of the different ways our clock control can behave
    var statuses = Object.freeze({
        Active: "active",
        Inactive: "inactive",
        Deleted: "deleted",
    });

    var projectStatusToBoolConverter = WinJS.Binding.converter(function (status) {
        return (status === Clok.Data.ProjectStatuses.Active);
    });



    WinJS.Namespace.define("Clok.Data", {
        Project: projectClass,
        ProjectStatuses: statuses,
        ProjectStatusToBoolConverter: projectStatusToBoolConverter,
    });

})();

