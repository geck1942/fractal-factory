var appViewModel;
var defaultFractalData = {
    'polygon': {
        'sides': 6,
        'drawingmode': 'dots',
        'width': 800,
        'padding': 100
    },
    'pattern': [
        { x: 0, y: 0, color: "red" },
        { x: 10, y: 0, color: "orange" },
        { x: 12, y: -10, color: "yellow" },
        { x: 14, y: 0, color: "orange" },
        { x: 24, y: 0, color: "red" } // last pattern point. must have the same color as first
    ],
    'animation': {
        'animated' : false
    }
}

var FCanvas;
var ui;

$(function () {
    FCanvas = $("#fractal-canvas");
    FCanvas.css({
        'height': FCanvas.width()
    });
    var templateCanvas = $("#template-canvas");
    templateCanvas.css({
        'height': templateCanvas.width()
    });

    ui = new UI(templateCanvas);

    var fractalData = load() || defaultFractalData;
    var fractal = new Fractal(FCanvas, fractalData);

    appViewModel = new AppViewModel({
        'fractal': fractal,
        'userid': 0123
    });

    ko.applyBindings(appViewModel);

    fractal.pattern.subscribe(ui.drawtemplate, fractal);
    fractal.draw();
    ui.drawtemplate();


    $("#btn-hdrendering").click(function () {
        // generate in good quality.
        // first, must define which quality (too much may crash browser)
        var quality = 14;
        //switch (appViewModel.fractal().pattern().steps) {
        //    case 3: // 2 lines
        //        quality = 17;
        //        break;
        //    case 4: // 3 lines
        //        quality = 13;
        //        break;
        //    case 5: // 4 lines
        //        quality = 11;
        //        break;
        //    default: // 5+ lines
        //        quality = 10;
        //        break;
        //}
        // based on a 8 sides polygon.
        if (appViewModel.fractal().polygon().sides() > 6)
            quality--;
        if (appViewModel.fractal().polygon().sides() > 12)
            quality--;
        appViewModel.fractal().draw(null, quality);
    });
    $("#btn-reset").click(function () {
        // reset fractal
        reset();
    });
    $("#btn-randomize").click(function () {
        // randomize fractal
        randomize();
    });

});

var save = function (data) {
    localStorage.setItem("fractal", JSON.stringify(data));
}
var load = function () {
    var objfractal = null;
    try {
        var strdata = localStorage.getItem("fractal");
        objfractal = JSON.parse(strdata);
        if (objfractal.polygon == null) throw ("fractal should contain polygon");
        if (objfractal.pattern == null) throw ("fractal should contain pattern");
        if (objfractal.animation == null) throw ("fractal should contain animation");
    }
    catch (ex) {
        objfractal = null;
    }
    return objfractal;
}
var init = function (newFractal) {
    appViewModel.fractal(newFractal);
    newFractal.pattern.subscribe(ui.drawtemplate, newFractal);
    newFractal.draw();
    ui.drawtemplate();
}
var reset = function () {
    init(new Fractal(FCanvas, defaultFractalData));
}
var randomize = function () {
    init(new Fractal(FCanvas, randomFractal()));
}

/// AppViewModel ctor.
var AppViewModel = function (appViewModelData) {
    /// public
    this.fractal = ko.observable(appViewModelData.fractal);
    this.gallery = ko.observableArray(appViewModelData.gallery);
};

var randomFractal = function () {
    var randomcolors = ['black', 'gray', 'white',
                        'red', 'orange', 'yellow',
                        'lime', 'green', 'chartreuse',
                        'blue', 'lightblue', 'turquoise',
                        'pink', 'brown', 'purple']
    var ranint = function (min, max) {
        return Math.round(Math.random() * (max - min),0) + min;
    }
    return {
        'polygon': {
            'sides': ranint(1, 8),
            'drawingmode': ranint(0, 1) == 0 ? 'dots' : 'lines',
            'width': 800,
            'padding': 100
        },
        'pattern': [
            { x: 0, y: 0, color: randomcolors[ranint(0, randomcolors.length-1)] },
            { x: ranint(0, 24), y: ranint(-12, 12), color: randomcolors[ranint(0, randomcolors.length - 1)] },
            { x: ranint(0, 24), y: ranint(-12, 12), color: randomcolors[ranint(0, randomcolors.length - 1)] },
            { x: ranint(0, 24), y: ranint(-12, 12), color: randomcolors[ranint(0, randomcolors.length - 1)] },
            { x: 24, y: 0, color: randomcolors[ranint(0, randomcolors.length - 1)] }
        ],
        'animation': {
            'animated': false
        }
    };
}
