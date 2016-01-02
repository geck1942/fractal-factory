var appViewModel;
var defaultFractalData = {
    'polygon': {
        'sides' : 6,
        'width': 800,
        'padding': 100
    },
    'pattern': [
        { x: 0, y: 0, color: "red" },
        { x: 10, y: 0, color: "orange" },
        { x: 12, y: -10, color: "yellow" },
        { x: 14, y: 0, color: "orange" },
        { x: 24, y: 0, color: "red" }
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
var reset = function () {
    var fractal = new Fractal(FCanvas, defaultFractalData);
    appViewModel.fractal(fractal);
    fractal.pattern.subscribe(ui.drawtemplate, fractal);
    fractal.draw();
    ui.drawtemplate();
}

/// AppViewModel ctor.
var AppViewModel = function (appViewModelData) {
    /// public
    this.fractal = ko.observable(appViewModelData.fractal);
};
