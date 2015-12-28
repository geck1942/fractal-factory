
var AppViewModel = function (JQueryfractalCanvas, JQuerylineCanvas) {
    this.fractal = ko.observable(new fractal(JQueryfractalCanvas));
    this.fractal().shapesides.subscribe(this.fractal().draw, this.fractal());
    this.fractal().depth.subscribe(this.fractal().draw, this.fractal());

    this.linetemplate = ko.observableArray([
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 12, y: -10 },
        { x: 14, y: 0 },
        { x: 24, y: 0 }
    ]);
    this.linetemplateSteps = 24;
    this.linetemplateWidth = JQuerylineCanvas.attr("width");
    this.linetemplateUIWidth = JQuerylineCanvas.width();
    this.linetemplateMargin = 20;


    this.fullName = ko.pureComputed(function () {
        // Knockout tracks dependencies automatically. It knows that fullName depends on firstName and lastName, because these get called when evaluating fullName.
        return "";
    }, this);
};

var appViewModel;
$(function () {
    var FCanvas = $("#fractal-canvas");
    FCanvas.css({
        'height': FCanvas.width()
    });
    var templateCanvas = $("#template-canvas");
    templateCanvas.css({
        'height': templateCanvas.width()
    });

    appViewModel = new AppViewModel(FCanvas, templateCanvas);
    ko.applyBindings(appViewModel);

    appViewModel.fractal().draw();


    drawtemplate(templateCanvas, appViewModel.linetemplate());

    $("#btn-hdrendering").click(function () {
        // generate in good quality.
        // first, must define which quality (too much may crash browser)
        var quality = 14;
        switch (appViewModel.linetemplate().length ) {
            case 3: // 2 lines
                quality = 17;
                break;
            case 4: // 3 lines
                quality = 13;
                break;
            case 5: // 4 lines
                quality = 11;
                break;
            default: // 5+ lines
                quality = 10;
                break;
        }
        // based on a 8 sides polygon.
        if (appViewModel.fractal().shapesides() > 6)
            quality--;
        if (appViewModel.fractal().shapesides() > 12)
            quality--;
        appViewModel.fractal().draw(null, quality);
    })

    var templatedragindex = null;
    templateCanvas.on("mousedown", function (evt, data) {
        var linecoord = getTemplateLineCoordinates(evt.offsetX, evt.offsetY);
        var linetemplate = appViewModel.linetemplate();

        for (var i = 0; i < linetemplate.length; i++) {
            if (linetemplate[i].x == linecoord.x && linetemplate[i].y == linecoord.y) {
                // user clicked on an existing point.
                // declare drag and drop
                templatedragindex = i
                break;
            }
        }
        if (templatedragindex == null)
        {
            // user clicked on whitespace.
            // find a place to add a new point.
            for (var i = 1; i < linetemplate.length; i++) {
                if ((linetemplate[i-1].x <= linecoord.x && linetemplate[i].x >= linecoord.x
                        || linetemplate[i-1].x >= linecoord.x && linetemplate[i].x <= linecoord.x )
                 && (linetemplate[i-1].y <= linecoord.y && linetemplate[i].y >= linecoord.y
                        || linetemplate[i-1].y >= linecoord.y && linetemplate[i].y <= linecoord.y )) {
                    // insert a new dot here.
                    appViewModel.linetemplate.splice(i, 0, linecoord);
                    templatedragindex = i;
                    break;
                }
            }

        }
        drawtemplate(templateCanvas, linetemplate);
        appViewModel.fractal().draw();
    });
    templateCanvas.on("mousemove", function (evt, data) {
        if (templatedragindex != null) {
            var linecoord = getTemplateLineCoordinates(evt.offsetX, evt.offsetY);
            if(linecoord.x < 0 || linecoord.x > 24 || linecoord.y < -12 || linecoord.y > 12){
                // dot is out of bounds. delete it
                appViewModel.linetemplate.splice(templatedragindex, 1);
                templatedragindex = null;
            }
            else {

                // first dot must remain on far left
                if (templatedragindex == 0)
                    linecoord.x = 0;
                // last dot must remain on far right
                else if (templatedragindex == appViewModel.linetemplate().length - 1)
                    linecoord.x = 24;

                // check if the dot at least moved:
                if (appViewModel.linetemplate()[templatedragindex].x == linecoord.x
                    && appViewModel.linetemplate()[templatedragindex].y == linecoord.y)
                    return;
                // moving the dot
                appViewModel.linetemplate()[templatedragindex] = linecoord;
            }
            drawtemplate(templateCanvas, appViewModel.linetemplate());
            appViewModel.fractal().draw();
        }
    });
    templateCanvas.on("mouseup mouseout", function (evt, data) {
        templatedragindex = null;
        //drawtemplate(templateCanvas, appViewModel.linetemplate());
    });
});



var fractal = function (jQueryCanvasElement) {
    var that = this;

    this.element = jQueryCanvasElement;
    this.margin = 200;
    this.ctx = this.element[0].getContext("2d");
    this.shapesides = ko.observable(6);
    this.depth = ko.observable(6);
    this.livepreview = ko.observable(true);
    this.shapewidth = this.element.attr("width") - this.margin;
    this.shapecenter = {
        x: this.shapewidth / 2,
        y: this.shapewidth / 2
    };

    this._drawingstarted = false;

    this.draw = function (val, forcedDepth) {
        if (forcedDepth == null && !this.livepreview())
            return;
        this.clearShape();
        for (var i = 0; i < this.shapesides() ; i++) {
            this.drawShapeSide(i, forcedDepth);
        }
        $(".progress-bar").css({ 'width':'100%' });
    };
    this.clearShape = function() {
        this.ctx.clearRect(0, 0, this.shapewidth + this.margin, this.shapewidth + this.margin);
        this.setColor("black");
        this.ctx.fillRect(0, 0, this.shapewidth + this.margin, this.shapewidth + this.margin);
    }
    this.setColor = function(color) {
        this.ctx.strokeStyle = color;
    }


    this.drawShapeSide = function (sideNumber, forcedDepth) {
        var _depth = forcedDepth || this.depth();
        var angle = 360 / this.shapesides();
        var fromAngle = Math.PI * ((sideNumber + 0.5) * angle) / 180;
        var toAngle = Math.PI * ((sideNumber + 1.5) * angle) / 180;

        this.setColor("lightblue");
        this._drawingstarted = false;
        this.ctx.beginPath();  
        this.drawFLine(Math.cos(fromAngle), Math.sin(fromAngle), Math.cos(toAngle), Math.sin(toAngle), _depth);
        this.ctx.stroke();

        //this.setColor("black");
        //this.drawFLine(Math.cos(fromAngle), Math.sin(fromAngle), Math.cos(toAngle), Math.sin(toAngle), 0);
        //this.setColor("red");
        //this.drawFLine(Math.cos(fromAngle), Math.sin(fromAngle), Math.cos(toAngle), Math.sin(toAngle), 1);
        //setColor("orange");
        //drawFLine(Math.cos(fromAngle), Math.sin(fromAngle), Math.cos(toAngle), Math.sin(toAngle), 2);
        //setColor("yellow");
        //drawFLine(Math.cos(fromAngle), Math.sin(fromAngle), Math.cos(toAngle), Math.sin(toAngle), 3);
        //this.setColor("green");
        //this.drawFLine(Math.cos(fromAngle), Math.sin(fromAngle), Math.cos(toAngle), Math.sin(toAngle), 4);
        //setColor("cyan");
        //drawFLine(Math.cos(fromAngle), Math.sin(fromAngle), Math.cos(toAngle), Math.sin(toAngle), 5);
        //setColor("purple");
        //drawFLine(Math.cos(fromAngle), Math.sin(fromAngle), Math.cos(toAngle), Math.sin(toAngle), 6);
    }

    this.drawFLine = function(FromRelX, FromRelY, ToRelX, ToRelY, _depth) {
        if (_depth == 0)
            this.drawLine(FromRelX, FromRelY, ToRelX, ToRelY);
        else {
            var path = this.trimLine(FromRelX, FromRelY, ToRelX, ToRelY);
            for (var i = 1; i < path.length; i++) {
                this.drawFLine(path[i - 1].x, path[i - 1].y, path[i].x, path[i].y, _depth - 1);
            }
        }
    }
    this.trimLine = function(FromRelX, FromRelY, ToRelX, ToRelY) {
        var lineGrid = new grid();
        lineGrid.initFromLineBounds(FromRelX, FromRelY, ToRelX, ToRelY);
        var subPath = [];
        for (var i = 0; i < appViewModel.linetemplate().length; i++) {
            subPath.push(lineGrid.getRelLocation(appViewModel.linetemplate()[i].x, appViewModel.linetemplate()[i].y));
        }
        return subPath;
    }
    this.drawLine = function(FromRelX, FromRelY, ToRelX, ToRelY) {
        var FromX = this.margin / 2 + this.shapecenter.x + FromRelX * this.shapewidth / 2;
        var FromY = this.margin / 2 + this.shapecenter.y - FromRelY * this.shapewidth / 2;
        var ToX = this.margin / 2 + this.shapecenter.x + ToRelX * this.shapewidth / 2;
        var ToY = this.margin / 2 + this.shapecenter.y - ToRelY * this.shapewidth / 2;
        if (!this._drawingstarted)
        {
            this.ctx.moveTo(FromX, FromY);
            this._drawingstarted = true;
        }
        this.ctx.lineTo(ToX, ToY);
    }

};



var grid = function () {
    var gridSize = 24;
    this.origin = {
        x: 0, y: 0
    };
    this.lineangle = 0;
    this.unitlength = 0;
    this.getRelLocation = function(xGrid, yGrid) {
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
        this.unitlength = (linelength / 24); // * (Math.cos(this.lineangle) > 0 ? 1 : -1);

    }
}

var drawtemplate = function (templateCanvas, array) {
    var ctx = templateCanvas[0].getContext("2d");
    var steps = appViewModel.linetemplateSteps;
    var width = appViewModel.linetemplateWidth;

    ctx.clearRect(0, 0, width, width);
    ctx.strokeStyle = "gray";
    ctx.font = "10px Arial";
    for (var x = 0; x <= steps; x++) {
        if (x % 4 == 0) {
            var txtcoordHoriz = getTemplateIMGCoordinates(x, 12.5);
            var txtcoordVert = getTemplateIMGCoordinates(-1, x - 12);
            ctx.fillText(x, txtcoordHoriz.x - 4, txtcoordHoriz.y);
            ctx.fillText((x - 12), txtcoordVert.x, txtcoordVert.y + 4);
        }
        for (var y = -12; y <= steps - 12; y++) {
            var dotcoord = getTemplateIMGCoordinates(x, y);
            ctx.fillRect(dotcoord.x, dotcoord.y, 1, 1);

        }
    }

    ctx.strokeStyle = "red";
    ctx.beginPath();
    for (var i = 0; i < array.length; i++) {
        var coords = getTemplateIMGCoordinates(array[i].x, array[i].y);
        ctx.arc(coords.x, coords.y, 5, 0, 2 * Math.PI);
        if (i == 0)
            ctx.moveTo(coords.x, coords.y);
        else {
            ctx.lineTo(coords.x, coords.y);
        }
    }
            ctx.stroke();
    ctx.strokeStyle = "black";
    for (var i = 0; i < array.length; i++) {
        var coords = getTemplateIMGCoordinates(array[i].x, array[i].y);
    }
}
var getTemplateIMGCoordinates = function (x, y) {
    var margin = appViewModel.linetemplateMargin;
    var steps = appViewModel.linetemplateSteps;
    var width = appViewModel.linetemplateWidth;

    return {
        x: (width - margin * 2) * (x / steps) + margin,
        y: (width - margin * 2) * ((-   y + 12) / steps) + margin
    };
}
var getTemplateLineCoordinates = function (x, y) {
    var margin = appViewModel.linetemplateMargin;
    var steps = appViewModel.linetemplateSteps;
    var width = appViewModel.linetemplateUIWidth;

    return {
        x: Math.round((x - margin) * steps / (width - margin * 2), 0),
        y: Math.round(-(y - margin) * steps / (width - margin * 2) + 12, 0)
    };
}