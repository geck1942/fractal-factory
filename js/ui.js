var UI = function (JQuerylineCanvas) {
    /// private
    var linetemplateSteps = 24;
    var linetemplateWidth = JQuerylineCanvas.attr("width");
    var linetemplateUIWidth = JQuerylineCanvas.width();
    var linetemplateMargin = 20;
    var pattern_selectedPin = ko.observable(null);
    //var pattern_isSelectedPin = ko.pureComputed(function () { return pattern_selectedPin() != null; });

    var grid = function () {
        var gridSize = 24;
        this.origin = {
            x: 0, y: 0
        };
        this.lineangle = 0;
        this.unitlength = 0;
        this.getRelLocation = function (xGrid, yGrid) {
            return {
                x: this.origin.x
                   + (xGrid - 12) * this.unitlength * Math.cos(this.lineangle)
                   + (yGrid - 0) * this.unitlength * Math.cos(this.lineangle - Math.PI / 2),
                y: this.origin.y
                   + (yGrid - 0) * this.unitlength * Math.sin(this.lineangle - Math.PI / 2)
                   + (xGrid - 12) * this.unitlength * Math.sin(this.lineangle),
            };
        };

        this.initFromLineBounds = function (FromRelX, FromRelY, ToRelX, ToRelY) {
            // FromRel is located at x=0, y=12
            // ToRel is located at x=24, y=12
            // so:
            this.lineangle = Math.atan2(ToRelY - FromRelY, ToRelX - FromRelX);
            // origin is located at 12, 12
            this.origin = {
                x: (ToRelX + FromRelX) / 2,
                y: (ToRelY + FromRelY) / 2
            }
            var linelength = Math.sqrt(Math.pow(ToRelY - FromRelY, 2) + Math.pow(ToRelX - FromRelX, 2));
            this.unitlength = (linelength / 24); 

        }
    };
    var templatedragindex = null;
    // end of Grid

    var that = this;
    var element = JQuerylineCanvas;
    var ctx = element[0].getContext("2d");
    //var draw = function () {
    //    drawtemplate(appViewModel.linetemplate());
    //};
    var getTemplateIMGCoordinates = function (x, y) {
        var margin = linetemplateMargin;
        var steps = linetemplateSteps;
        var width = linetemplateWidth;

        return {
            x: (width - margin * 2) * (x / steps) + margin,
            y: (width - margin * 2) * ((-y + 12) / steps) + margin
        };
    }
    var getTemplateLineCoordinates = function (x, y) {
        var margin = linetemplateMargin;
        var steps = linetemplateSteps;
        var width = linetemplateUIWidth;

        return {
            x: Math.round((x - margin) * steps / (width - margin * 2), 0),
            y: Math.round(-(y - margin) * steps / (width - margin * 2) + 12, 0)
        };
    }
    var drawtemplate = function () {
        var pattern = appViewModel.fractal().pattern().getdata();
        // draw grid for pattern template
        ctx.clearRect(0, 0, linetemplateWidth, linetemplateWidth);
        ctx.fillStyle = "gray";
        ctx.font = "10px Arial";

        for (var x = 0; x <= linetemplateSteps; x++) {
            if (x % 4 == 0) {
                var txtcoordHoriz = getTemplateIMGCoordinates(x, 12.5);
                var txtcoordVert = getTemplateIMGCoordinates(-1, x - 12);
                ctx.fillText(x, txtcoordHoriz.x - 4, txtcoordHoriz.y);
                ctx.fillText((x - 12), txtcoordVert.x, txtcoordVert.y + 4);
            }
            for (var y = -12; y <= linetemplateSteps - 12; y++) {
                var dotcoord = getTemplateIMGCoordinates(x, y);
                if (y % 4 == 0)
                    ctx.fillRect(dotcoord.x - 1, dotcoord.y, 3, 1);
                if (x % 4 == 0)
                    ctx.fillRect(dotcoord.x, dotcoord.y - 1, 1, 3);
                if (x % 4 != 0 && y % 4 != 0)
                    ctx.fillRect(dotcoord.x, dotcoord.y, 1, 1);
            }
        }
        // end of grid

        // draw lines
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2
        ctx.beginPath();
        for (var i = 0; i < pattern.length; i++) {
            var coords = getTemplateIMGCoordinates(pattern[i].x, pattern[i].y);
            if (i == 0)
                ctx.moveTo(coords.x, coords.y);
            else
                ctx.lineTo(coords.x, coords.y);
        }
        ctx.stroke();

        // draw handles
        for (var i = 0; i < pattern.length; i++) {
            var coords = getTemplateIMGCoordinates(pattern[i].x, pattern[i].y);
            ctx.beginPath();
            ctx.fillStyle = pattern[i].color;
            if (pattern_selectedPin() == i) {
                // this handle is being moved by user: highlight
                ctx.lineWidth = 4
                ctx.arc(coords.x, coords.y, 10, 0, 2 * Math.PI);
            }
            else {
                // this handle is being moved by user: highlight
                ctx.lineWidth = 2
                ctx.arc(coords.x, coords.y, 6, 0, 2 * Math.PI);
            }
            ctx.stroke();
            ctx.fill();
        }
    };
    var deletePin = function (sender, evt, pintodelete) {
        if (!pintodelete > 0) // if not integer
            pintodelete = pattern_selectedPin();
        if (pintodelete > 0 && pintodelete < appViewModel.fractal().pattern().data().length)
        {
            appViewModel.fractal().pattern().data.splice(pintodelete, 1);
            appViewModel.fractal().pattern.notifySubscribers(appViewModel.fractal().pattern);
        }
    };
    var setPinColor = function (color, evt, pintodelete) {
        if (!pintodelete > 0) // if not integer
            pintodelete = pattern_selectedPin();
        appViewModel.fractal().pattern().data()[pintodelete].color(color.name);
        appViewModel.fractal().pattern.notifySubscribers(appViewModel.fractal().pattern);

    };
    var init = function () {

        element.on("mousedown", function (evt, data) {
            var linecoord = getTemplateLineCoordinates(evt.offsetX, evt.offsetY);
            var pattern = appViewModel.fractal().pattern().getdata();

            for (var i = 0; i < pattern.length; i++) {
                if (pattern[i].x >= linecoord.x - 1
                    && pattern[i].x <= linecoord.x + 1
                    && pattern[i].y >= linecoord.y - 1
                    && pattern[i].y <= linecoord.y + 1) {
                    // user clicked on an existing point.
                    // declare selected pin and for drag and drop
                    pattern_selectedPin(i);
                    templatedragindex = i
                    break;
                }
            }
            if (templatedragindex == null) {
                // user clicked on whitespace.
                // find a place to add a new point.
                for (var i = 1; i < pattern.length; i++) {
                    if ((pattern[i - 1].x <= linecoord.x && pattern[i].x >= linecoord.x
                            || pattern[i - 1].x >= linecoord.x && pattern[i].x <= linecoord.x)
                     && (pattern[i - 1].y <= linecoord.y && pattern[i].y >= linecoord.y
                            || pattern[i - 1].y >= linecoord.y && pattern[i].y <= linecoord.y)) {
                        // insert a new dot here.
                        appViewModel.fractal().pattern().data.splice(i, 0, new PatternStep({
                            'x': linecoord.x,
                            'y': linecoord.y,
                            'color': pattern[i - 1].color
                        }));
                        templatedragindex = i;
                        pattern_selectedPin(i);
                        //appViewModel.fractal().pattern.notifySubscribers(appViewModel.fractal().pattern());
                        break;
                    }
                }
            }
        });
        element.on("mousemove", function (evt, data) {
            var linecoord = getTemplateLineCoordinates(evt.offsetX, evt.offsetY);

            if (templatedragindex != null) {
                // arlready doing drag and drop
                if (linecoord.x < 0 || linecoord.x > 24 || linecoord.y < -12 || linecoord.y > 12) {
                    // dot is out of bounds. delete it
                    deletePin(null, null, templatedragindex);
                    templatedragindex = null;
                }
                else {

                    // first dot must remain on far left
                    if (templatedragindex == 0)
                        linecoord.x = 0;
                        // last dot must remain on far right
                    else if (templatedragindex == appViewModel.fractal().pattern().data().length - 1)
                        linecoord.x = 24;

                    // check if the dot at least moved:
                    if (appViewModel.fractal().pattern().data()[templatedragindex].x() == linecoord.x
                        && appViewModel.fractal().pattern().data()[templatedragindex].y() == linecoord.y)
                        return;
                    // moving the dot
                    appViewModel.fractal().pattern().data()[templatedragindex].x(linecoord.x);
                    appViewModel.fractal().pattern().data()[templatedragindex].y(linecoord.y);
                }
                appViewModel.fractal().pattern.notifySubscribers(appViewModel.fractal().pattern());
            }
            else
            {
                for (var i = 0; i < appViewModel.fractal().pattern.length; i++) {
                    if (appViewModel.fractal().pattern[i].x() == linecoord.x && appViewModel.fractal().pattern[i].y() == linecoord.y) {
                        // user mouse moved on an existing point.
                        // highlight it
                        templatedragindex = i
                        break;
                    }
                }
                // looking for a handle to drag
            }
        });
        element.on("mouseup mouseout", function (evt, data) {
            templatedragindex = null;
        });

        pattern_selectedPin.subscribe(drawtemplate, that);

    }();

    /// public
    return {
        // properties
        'getTemplateIMGCoordinates': getTemplateIMGCoordinates,
        'getTemplateLineCoordinates': getTemplateLineCoordinates,
        'pattern_selectedPin': pattern_selectedPin,
        // methods
        'init': init,
        'drawtemplate': drawtemplate,
        'deletePin': deletePin,
        'setPinColor': setPinColor
    };
};

