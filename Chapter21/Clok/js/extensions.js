// ----------------------- Date extensions --------------------------------

Date.prototype.addSeconds = function (n) {
    var year = this.getFullYear();
    var month = this.getMonth();
    var date = this.getDate();
    var hours = this.getHours();
    var minutes = this.getMinutes();
    var seconds = this.getSeconds();

    seconds += n;

    return new Date(year, month, date, hours, minutes, seconds);
}

Date.prototype.addMinutes = function (n) {
    var year = this.getFullYear();
    var month = this.getMonth();
    var date = this.getDate();
    var hours = this.getHours();
    var minutes = this.getMinutes();
    var seconds = this.getSeconds();

    minutes += n;

    return new Date(year, month, date, hours, minutes, seconds);
}

Date.prototype.addHours = function (n) {
    var year = this.getFullYear();
    var month = this.getMonth();
    var date = this.getDate();
    var hours = this.getHours();
    var minutes = this.getMinutes();
    var seconds = this.getSeconds();

    hours += n;

    return new Date(year, month, date, hours, minutes, seconds);
}

Date.prototype.addDays = function (n) {
    var year = this.getFullYear();
    var month = this.getMonth();
    var date = this.getDate();

    date += n;

    return new Date(year, month, date);
}

Date.prototype.addMonths = function (n) {
    var year = this.getFullYear();
    var month = this.getMonth();
    var date = this.getDate();

    month += n;

    return new Date(year, month, date);
}

Date.prototype.addYears = function (n) {
    var year = this.getFullYear();
    var month = this.getMonth();
    var date = this.getDate();

    year += n;

    return new Date(year, month, date);
}

Date.prototype.removeTimePart = function () {
    var year = this.getFullYear();
    var month = this.getMonth();
    var date = this.getDate();

    return new Date(year, month, date);
}

Date.prototype.firstDayOfMonth = function () {
    var year = this.getFullYear();
    var month = this.getMonth();

    return new Date(year, month, 1);
}

Date.prototype.lastDayOfMonth = function () {
    // last day of month is the day before the first day of the next month
    return this.firstDayOfMonth().addMonths(1).addDays(-1);
}

