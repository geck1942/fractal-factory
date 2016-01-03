var Polygon = function (PolygonData) {
    /// private
    var that = this;
    var sides = ko.observable(PolygonData.sides);
    var zoom = ko.observable(PolygonData.zoom || 1);
    var drawingmode = ko.observable(PolygonData.drawingmode);
    var width = ko.observable(PolygonData.width);
    //var padding = ko.observable(PolygonData.padding);

    // returns object raw data for storage / initialization
    var getdata = function () {
        return {
            'sides': sides(),
            'width': width(),
            'zoom': zoom()
        }
    };
    var init = function () {

    }();
    /// public
    return {
        // properties
        'sides': sides,
        'drawingmode': drawingmode,
        'width': width,
        'zoom': zoom,
        // methods
        'getdata' : getdata
    };
};
