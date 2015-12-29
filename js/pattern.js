var Pattern = function (PatternDataArray) {
    /// private
    var that = this;
    var items = [];
    var init = function () {
        for (var i = 0; i < PatternDataArray.length; i++) {
            items.push(new PatternStep(PatternDataArray[i]));
        }

    }();
    // main function called recursively to adapt the inner pattern grid in a
    // previous depth line. It trims the line in deeper sub lines.
    // returns an array of PatternStepData (including relative x/y coordinates).
    var applyPattern = function (line_from, line_to) {
        var subline = [];
        var linelength = Math.sqrt(Math.pow(line_to.y - line_from.y, 2) + Math.pow(line_to.x - line_from.x, 2));
        var lineangle = Math.atan2(line_to.y - line_from.y, line_to.x - line_from.x);
        var lineorigin = {
            x: (line_to.x + line_from.x) / 2,
            y: (line_to.y + line_from.y) / 2
        }

        for (var i = 0; i < items.length; i++) {
            var patternStepData = {
                x : items[i].x(),
                y : items[i].y(),
                color :items[i].color()
            }
            // replace the [0 24, -12 12] grid coordinates to a [-0.5 0.5, -0.5 0.5] space.
            patternStepData.x = (patternStepData.x - 12) / 24;
            patternStepData.y = -patternStepData.y / 24;

            var newposition = {
                x: patternStepData.x + 0,
                y: patternStepData.y + 0
            };

            // transforms the [-1 1, -1 1] space to the parent line space.
            newposition.x = lineorigin.x
                   + patternStepData.x * linelength * Math.cos(lineangle)
                   + patternStepData.y * linelength * Math.cos(lineangle - Math.PI / 2);
            newposition.y = lineorigin.y
               + patternStepData.x * linelength * Math.sin(lineangle)
               + patternStepData.y * linelength * Math.sin(lineangle - Math.PI / 2);

            patternStepData.x = newposition.x;
            patternStepData.y = newposition.y;

            subline.push(patternStepData);
        }
        return subline;
    };

    /// public
    return {
        // properties
        'data': ko.observableArray(items),
        'steps': items.length,
        // methods
        'applyPattern': applyPattern

    };
};
var PatternStep = function (PatternStepData) {
    /// private
    var that = this;
    var init = function () {

    };
    // replace the [0 24, -12 12] grid coordinates to a [-1 1, -1 1] space.
    var relativizePosition = function () {
        x = (x - 12) / 12,
        y = y / 12
    };
    // x is from 0 to 24.
    var x = PatternStepData.x;
    // x is from -12 to 12.
    var y = PatternStepData.y;
    var color = PatternStepData.color;

    /// public
    return {
        // properties
        'x': ko.observable(x),
        'y': ko.observable(y),
        'color': ko.observable(color)
        // methods
    };
};
