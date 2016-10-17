Object.prototype.toTemplatedString = function (formatString, defaults) {
    var obj = this;
    if (typeof (formatString) === "string") {
        return formatString.replace(/\{\{|\}\}|\{([A-Za-z0-9]+)\}/g, function (match, capture) {
            if (match === "{{") { return "{"; }
            if (match === "}}") { return "}"; }
            return obj[capture] || (defaults && defaults[capture]) || "";
        });
    } else {
        return obj;
    }
};
