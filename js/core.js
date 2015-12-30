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

    var ui = new UI(templateCanvas);

    var polygonData = {
        'sides' : 6,
        'width': FCanvas.attr("width"),
        'padding': 100
};
    var patternData = [
        { x: 0, y: 0, color: "red" },
        { x: 10, y: 0, color: "orange" },
        { x: 12, y: -10, color: "yellow" },
        { x: 14, y: 0, color: "orange" },
        { x: 24, y: 0, color: "red" }
    ];
    var fractal = new Fractal(FCanvas, polygonData, patternData);

    appViewModel = new AppViewModel({
        'fractal': fractal,
        'userid': 0123
    });

    ko.applyBindings(appViewModel);
    fractal.polygon().sides.subscribe(fractal.draw, fractal);
    fractal.maxdepth.subscribe(fractal.draw, fractal);
    fractal.pattern.subscribe(fractal.draw, fractal);
    fractal.pattern.subscribe(ui.drawtemplate, fractal);
    fractal.draw();
    ui.drawtemplate();


    $("#btn-hdrendering").click(function () {
        // generate in good quality.
        // first, must define which quality (too much may crash browser)
        var quality = 16;
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

});

/// AppViewModel ctor.
var AppViewModel = function (appViewModelData) {
    /// public
    this.fractal = ko.observable(appViewModelData.fractal);
};
