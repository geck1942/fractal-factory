﻿var UI = function (JQuerylineCanvas) {
    /// private
    var linetemplateSteps = 24;
    var linetemplateWidth = JQuerylineCanvas.attr("width");
    var linetemplateUIWidth = JQuerylineCanvas.width();
    var linetemplateMargin = 20;
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
        var pattern = appViewModel.fractal().pattern().data();
        ctx.clearRect(0, 0, linetemplateWidth, linetemplateWidth);
        ctx.strokeStyle = "gray";
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
                ctx.fillRect(dotcoord.x, dotcoord.y, 1, 1);

            }
        }

        ctx.strokeStyle = "red";
        ctx.beginPath();
        for (var i = 0; i < pattern.length; i++) {
            var coords = getTemplateIMGCoordinates(pattern[i].x(), pattern[i].y());
            ctx.arc(coords.x, coords.y, 5, 0, 2 * Math.PI);
            if (i == 0)
                ctx.moveTo(coords.x, coords.y);
            else {
                ctx.lineTo(coords.x, coords.y);
            }
        }
        ctx.stroke();
        ctx.strokeStyle = "black";
        for (var i = 0; i < pattern.length; i++) {
            var coords = getTemplateIMGCoordinates(pattern[i].x(), pattern[i].y());
        }
    }
    var init = function () {

        var templatedragindex = null;
        element.on("mousedown", function (evt, data) {
            var linecoord = getTemplateLineCoordinates(evt.offsetX, evt.offsetY);
            var pattern = appViewModel.fractal().pattern().data();

            for (var i = 0; i < pattern.length; i++) {
                if (pattern[i].x() == linecoord.x && pattern[i].y() == linecoord.y) {
                    // user clicked on an existing point.
                    // declare drag and drop
                    templatedragindex = i
                    break;
                }
            }
            if (templatedragindex == null) {
                // user clicked on whitespace.
                // find a place to add a new point.
                for (var i = 1; i < pattern.length; i++) {
                    if ((pattern[i - 1].x() <= linecoord.x && pattern[i].x() >= linecoord.x
                            || pattern[i - 1].x() >= linecoord.x && pattern[i].x() <= linecoord.x)
                     && (pattern[i - 1].y() <= linecoord.y && pattern[i].y() >= linecoord.y
                            || pattern[i - 1].y() >= linecoord.y && pattern[i].y() <= linecoord.y)) {
                        // insert a new dot here.
                        pattern.splice(i, 0, new PatternStep({
                            'x': linecoord.x,
                            'y': linecoord.y,
                            'color' : "blue"
                        }));
                        templatedragindex = i;
                        appViewModel.fractal().pattern.notifySubscribers(appViewModel.fractal().pattern());
                        break;
                    }
                }

            }
        });
        element.on("mousemove", function (evt, data) {
            if (templatedragindex != null) {
                var linecoord = getTemplateLineCoordinates(evt.offsetX, evt.offsetY);
                if (linecoord.x < 0 || linecoord.x > 24 || linecoord.y < -12 || linecoord.y > 12) {
                    // dot is out of bounds. delete it
                    appViewModel.fractal().pattern().data.splice(templatedragindex, 1);
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
        });
        element.on("mouseup mouseout", function (evt, data) {
            templatedragindex = null;
        });
    }();

    /// public
    return {
        // properties
        'init': init,
        'drawtemplate': drawtemplate,
        'getTemplateIMGCoordinates': getTemplateIMGCoordinates,
        'getTemplateLineCoordinates': getTemplateLineCoordinates
    };
};
