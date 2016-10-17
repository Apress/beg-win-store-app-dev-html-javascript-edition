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
            isAddressSpecified: function () {
                return (!!this.address1
                        || !!this.city
                        || !!this.region
                        || !!this.postalCode);
            }
        },
        {
            createFromDeserialized: function (value) {
                var project = new Clok.Data.Project();

                project.id = value.id;
                project.name = value.name;
                project.projectNumber = value.projectNumber;
                project.status = value.status;
                project.description = value.description;
                project.startDate = value.startDate;
                project.dueDate = value.dueDate;
                project.clientName = value.clientName;
                project.contactName = value.contactName;
                project.address1 = value.address1;
                project.address2 = value.address2;
                project.city = value.city;
                project.region = value.region;
                project.postalCode = value.postalCode;
                project.email = value.email;
                project.phone = value.phone;

                return project;
            },
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

