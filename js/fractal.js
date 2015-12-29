var Fractal = function (jQueryCanvasElement, PolygonData, PatternData) {
    /// private
    var that = this;
    var maxdepth = ko.observable(5);
    var element = jQueryCanvasElement;
    var ctx = element[0].getContext("2d");
    var drawingmode = "lines";
    var draw = function () {
        draw_clearpolygon();
        draw_polygon();
    };

    // draw the fractal in the jQueryCanvasElement HTML canvas.
    var draw_clearpolygon = function () {
        ctx.clearRect(0, 0, polygon.width(), polygon.width());
        ctx.strokeStyle = "black";
        ctx.fillRect(0, 0, polygon.width(), polygon.width());
    };

    // draw the fractal in the jQueryCanvasElement HTML canvas.
    var draw_polygon = function () {
        ctx.strokeStyle = "green";
        var sides = polygon.sides(); //int
        var angle = 360 / sides;

        for (var sideindex = 0; sideindex < sides; sideindex++) {
            // defines polygon line coordinates in a 1 unit long space (center at [0,0] ).
            var fromAngle = Math.PI * ((sideindex + 1.5) * angle) / 180;
            var toAngle = Math.PI * ((sideindex + 0.5) * angle) / 180;
            var line_from = {
                x: Math.cos(fromAngle),
                y: Math.sin(fromAngle)
            }
            var line_to = {
                x: Math.cos(toAngle),
                y: Math.sin(toAngle)
            }
            draw_segment(line_from, line_to, 0);
        }
    };
    // draw a fractal segment. Depending the current depth, the segment will be splitted in 
    // sub segments (recursivity) or drawn as a single line (end of recursivity)
    var draw_segment = function (line_from, line_to, depth) {
        var appliedPatternDataArray = pattern.applyPattern(line_from, line_to);
        if (depth >= maxdepth()) {
            // no more details to add. Draw the pattern.
            draw_pattern(appliedPatternDataArray);
        }
        else
        {
            // parse each sub line and redraw sub segments
            for (var i = 0; i < appliedPatternDataArray.length - 1; i++) {
                draw_segment(appliedPatternDataArray[i], appliedPatternDataArray[i + 1], depth + 1);
            }
        }
    };
    // draw a pattern representation. 1 unit long space (center at [0,0] ).
    var draw_pattern = function (patternDataArray) {
        switch (drawingmode) {
            case "dots":
                //this.ctx.moveTo(RelX, FromY);
                //if (!this.drawingfirstdot) {
                //    this.ctx.arc(FromRelX, FromRelY, 8 - _depth, 0, 2 * Math.PI);
                //    this.drawingfirstdot = true;
                //}
                //this.ctx.arc(RelX, RelY, 8 - _depth, 0, 2 * Math.PI);
                break;
            case "lines":
                ctx.beginPath();
                for (var i = 0; i < patternDataArray.length; i++) {
                    var IMG_location = drawing_getImageCoordinates(patternDataArray[i].x, patternDataArray[i].y);
                    if (i == 0)
                        ctx.moveTo(IMG_location.x, IMG_location.y);
                    else
                        ctx.lineTo(IMG_location.x, IMG_location.y);
                }
                ctx.stroke();
                break;
        }

    };
    // return the x/y coordinates of the picture from a 1 unit long space coordinates.
    var drawing_getImageCoordinates = function (polar_x, polar_y) {
        var width = polygon.width();
        var height = width; // square
        var padding = polygon.padding();
        return {
            x: (width / 2) + polar_x * (width - padding) / 2,
            y: (width / 2) + polar_y * (width - padding) / 2
    };
    }
    // ko
    var polygon = new Polygon(PolygonData);
    var pattern = new Pattern(PatternData);

    var init = function () {

    }();
    /// public
    return {
        // properties
        'UIElement': element,
        // todo init ui properties through jquery attibutes
        'UIMargin': 200,
        'UIWidth': 800,
        'polygon': ko.observable(polygon),
        'pattern': ko.observable(pattern),
        'maxdepth': maxdepth,
        // methods
        'draw': draw,
        'init': init
    };
};
