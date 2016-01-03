var appViewModel;
var defaultFractalData = {
    'polygon': {
        'sides': 6,
        'drawingmode': 'dots',
        'width': 1280,
        'zoom': 1
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
        'userid': 0123,
        'colors': [{ name: 'black' }, { name: 'dimgray' }, { name: 'darkgray' }, { name: 'lightgrey' }, { name: 'white' },
                    { name: 'darkred' }, { name: 'firebrick' }, { name: 'red' },
                    { name: 'orange' }, { name: 'gold' }, { name: 'yellow' },
                    { name: 'saddlebrown' }, { name: 'sienna' }, { name: 'wheat' },
                    { name: 'darkgreen' }, { name: 'forestgreen' }, { name: 'lime' },
                    { name: 'teal' }, { name: 'turquoise' }, { name: 'cyan' },
                    { name: 'navy' }, { name: 'dodgerblue' }, { name: 'skyblue' },
                    { name: 'purple' }, { name: 'hotpink' }, { name: 'magenta' } ]
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
    this.userid = appViewModelData.userid;
    this.gallery = ko.observableArray(appViewModelData.gallery);

    this.colors = ko.observableArray(appViewModelData.colors);
    this.lock_drawingmode = ko.observable(false);
    this.lock_polygonsides = ko.observable(false);
};

var randomFractal = function () {
    var ranint = function (min, max) {
        return Math.round(Math.random() * (max - min),0) + min;
    }
    var f = {
        'polygon': {
            'sides': ranint(1, 8),
            'drawingmode': ranint(0, 1) == 0 ? 'dots' : 'lines',
            'width': 1280,
            'zoom' : 1
        },
        'pattern': [
            { x: 0, y: 0, color: appViewModel.colors()[ranint(0, appViewModel.colors().length-1)].name }
        ],
        'animation': {
            'animated': false
        }
    };
    // verify locked values
    if (appViewModel.lock_drawingmode())
        f.polygon.drawingmode = appViewModel.fractal().polygon().drawingmode();
    if (appViewModel.lock_polygonsides())
        f.polygon.sides = appViewModel.fractal().polygon().sides();

    var pattern_steps = ranint(2, 4);
    for (var i = 0; i < pattern_steps; i++)
        f.pattern.splice(1, 0, {
            x: ranint(0, 24),
            y: ranint(-12, 12),
            color: appViewModel.colors()[ranint(0, appViewModel.colors().length - 1)].name
        });
    // last dot is known, and color is the same as first
    f.pattern.push({
        x: 24,
        y: 0,
        color: f.pattern[0].color
    });
    return f;
}
