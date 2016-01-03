var Fractal = function (jQueryCanvasElement, data) {
    /// private
    var that = this;
    var maxdepth = ko.observable(6);
    var camera = {
        'zoom': 1,
        'rotation': 0,
        'translation': {
            x: 0,
            y: 0
        }
    };
    var element = jQueryCanvasElement;
    var playing = null;
    var ctx = element[0].getContext("2d");
    var onsomethingchanged = function () {
        stop();
        draw();
        save(getdata());
    };
    var play = function () {
        playing = setInterval(function () {
            animation().nextframe();
            draw();
        }, 200);
    };
    var stop = function () {
        clearTimeout(playing);
    };
    var draw = function (foo, forcedmaxdepth) {
        ctx.save();
        draw_clearpolygon();

        // update the patter location with the camera modifier.
        camera = getcamera();
        ctx.translate(camera.translation.x, camera.translation.y);
        ctx.rotate(camera.rotation);
        ctx.scale(camera.zoom, camera.zoom);
        draw_debug();

        //if (animation().animated())
        //    draw_flatpolygon(forcedmaxdepth || maxdepth());
        //else
            draw_polygon(forcedmaxdepth || maxdepth());
        ctx.restore();
    };

    var draw_debug = function () {
        ctx.beginPath();
        ctx.fillStyle = 'white';
        ctx.moveTo(-1, 0);
        ctx.lineTo(1, 0);
        ctx.moveTo(0, -1);
        ctx.lineTo(0, 1);
        ctx.stroke();
    };
    // draw the fractal in the jQueryCanvasElement HTML canvas.
    var draw_clearpolygon = function () {
        ctx.clearRect(0, 0, polygon().width(), polygon().width());
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, polygon().width(), polygon().width());
    };

    // draw the fractal in the jQueryCanvasElement HTML canvas.
    var draw_polygon = function (forcedmaxdepth) {
        var sides = polygon().sides(); //int
        var angle = 360 / sides;

        for (var sideindex = 0; sideindex < sides; sideindex++) {
            // defines polygon line coordinates in a 1 unit long space (center at [0,0] ).
            var fromAngle = Math.PI * ((sideindex - 0.5) * angle) / 180;
            var toAngle = Math.PI * ((sideindex + 0.5) * angle) / 180;
            if (sides == 1)
            { fromAngle = Math.PI; toAngle = 0; }
            var line_from = {
                x: Math.cos(fromAngle),
                y: Math.sin(fromAngle)
            }
            var line_to = {
                x: Math.cos(toAngle),
                y: Math.sin(toAngle)
            }
            draw_segment(line_from, line_to, 0, forcedmaxdepth);
        }
    };
    // draw the fractal for animation in the jQueryCanvasElement HTML canvas.
    var draw_flatpolygon = function (forcedmaxdepth) {
        draw_segment({ x: -1, y: 0 }, { x: 0, y: 0 }, 0, forcedmaxdepth);
        draw_segment({ x: 0, y: 0 }, { x: 1, y: 0 }, 0, forcedmaxdepth);
    };
    // draw a fractal segment. Depending the current depth, the segment will be splitted in 
    // sub segments (recursivity) or drawn as a single line (end of recursivity)
    var draw_segment = function (line_from, line_to, depth, forcedmaxdepth) {
        var linelength = Math.sqrt(Math.pow(line_to.y - line_from.y, 2) + Math.pow(line_to.x - line_from.x, 2));
        var appliedPatternDataArray = pattern().applyPattern(line_from, line_to);

        if (linelength < drawing_min_polarlength || depth >= forcedmaxdepth) {
            // no more details to add. Draw the pattern.
            draw_pattern(appliedPatternDataArray, depth);
        }
        else
        {
            // parse each sub line and redraw sub segments
            for (var i = 0; i < appliedPatternDataArray.length - 1; i++) {
                draw_segment(appliedPatternDataArray[i], appliedPatternDataArray[i + 1], depth + 1, forcedmaxdepth);
            }
        }
    };
    // draw a pattern representation. 1 unit long space (center at [0,0] ).
    var draw_pattern = function (patternDataArray, depth) {
        var depthpct = depth / maxdepth();
        //switch (polygon().drawingmode()) {
        //    case "dots":
                for (var i = 0; i < patternDataArray.length; i++) {

                    // set color for the dot
                    ctx.fillStyle = patternDataArray[i].color;
                    //var IMG_location = drawing_getImageCoordinates(patternDataArray[i].x, patternDataArray[i].y);
                    ctx.beginPath();
                    ctx.arc(patternDataArray[i].x, patternDataArray[i].y, 2 * depthpct / camera.zoom, 0, 2 * Math.PI);
                    ctx.fill();
                }
                //break;
        //    case "lines":
        //        ctx.beginPath();
        //        for (var i = 0; i < patternDataArray.length; i++) {
        //            var IMG_location = drawing_getImageCoordinates(patternDataArray[i].x, patternDataArray[i].y);
        //            ctx.strokeStyle = patternDataArray[i].color;
        //            if (i == 0)
        //                ctx.moveTo(IMG_location.x, IMG_location.y);
        //            else
        //                ctx.lineTo(IMG_location.x, IMG_location.y);
        //            ctx.stroke();
        //        }
        //        break;
        //}

    };
    //// return the x/y coordinates of the picture from a 1 unit long space coordinates.
    //var drawing_getImageCoordinates = function (polar_x, polar_y) {
    //    var width = polygon().width();
    //    var height = width; // square
    //    var padding = polygon().padding();
    //    return {
    //        x: polar_x * (width - padding) / 2,
    //        y: polar_y * (width - padding) / 2
    //    };
    //};

    // gets the camera position for movement effect
    var getcamera = function () {
        //
        var width = polygon().width();
        var height = width; // square
        var padding = polygon().padding();
        if (animation().animated())
        {
            // animation is made in N steps, where we move from
            // a segment bounds to the bounds of the first sub segment.
            // it creates a zoom and a rotation, then loop is repeated.
            // So, the scale factor (rotataion, zoom) is applied accordingly
            // where we are in the animation timeline.
            var coeff = animation().framepct();
            var origin_pattern = pattern().applyPattern({ x: 0, y: 0 }, { x: 1, y: 0 })
            var origin_from = origin_pattern[0];
            var origin_to = origin_pattern[1];
            var origin_angle = Math.atan2(origin_to.y - origin_from.y, origin_to.x - origin_from.x);
            var origin_length = Math.sqrt(Math.pow(origin_to.y - origin_from.y, 2) + Math.pow(origin_to.x - origin_from.x, 2));

            var destination_pattern = pattern().applyPattern(origin_from, origin_to)
            var destination_from = destination_pattern[0];
            var destination_to = destination_pattern[1];
            var destination_angle = Math.atan2(destination_to.y - destination_from.y, destination_to.x - destination_from.x);
            var destination_legnth = Math.sqrt(Math.pow(destination_to.y - destination_from.y, 2) + Math.pow(destination_to.x - destination_from.x, 2));

            var scale_required = destination_legnth / origin_length;

            return {
                'zoom': (width - padding) * (coeff*(scale_required - 1) + 1),
                'rotation': origin_angle + (destination_angle - origin_angle) * coeff,
                'translation': { // translation is based on the canvas size.
                    x: (width / 2),
                    y: (width / 2)
                }
            };
        }
        else {
            // if there is no animation, default value
            return {
                'zoom': (width - padding),
                'rotation': 0,
                'translation': { // translation is based on the canvas size.
                    x: (width / 2),
                    y: (width / 2)
                }
            };
        }
    };


    // ko
    var polygon = ko.observable(new Polygon(data.polygon));
    var pattern = ko.observable(new Pattern(data.pattern));
    var animation = ko.observable(new FractalAnimation(data.animation));

    // 3 pixels is the minmimum length for dividing a pattern, less than that, no more depth needed.
    var drawing_min_polarlength = 6 / (polygon().width() / 2 - (polygon().padding())) // drawable area


    // returns object raw data for storage / initialization
    var getdata = function () {
        return {
            'polygon': polygon().getdata(),
            'pattern': pattern().getdata(),
            'animation': animation().getdata()
        }
    };
    var init = function () {

        polygon().sides.subscribe(onsomethingchanged, that);
        polygon().drawingmode.subscribe(onsomethingchanged, that);
        animation.subscribe(onsomethingchanged, that);
        maxdepth.subscribe(onsomethingchanged, that);
        pattern.subscribe(onsomethingchanged, that);
    }();

    /// public
    return {
        // properties
        'UIElement': element,
        // todo init ui properties through jquery attibutes
        'UIMargin': 200,
        'UIWidth': 800,
        'polygon': polygon,
        'pattern': pattern,
        'animation': animation,
        'maxdepth': maxdepth,
        //'drawingmode': drawingmode,
        // methods
        'play': play,
        'stop': stop,
        'draw': draw,
        'getdata' : getdata,
        'init': init
    };
};
