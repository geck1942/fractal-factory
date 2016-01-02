var Polygon = function (PolygonData) {
    /// private
    var that = this;
    var init = function () {

    }
    var sides = ko.observable(PolygonData.sides);
    var drawingmode = ko.observable(PolygonData.drawingmode);
    var width = ko.observable(PolygonData.width);
    var padding = ko.observable(PolygonData.padding);

    // returns object raw data for storage / initialization
    var getdata = function () {
        return {
            'sides': sides(),
            'width': width(),
            'padding': padding()
        }
    };
    /// public
    return {
        // properties
        'sides': sides,
        'drawingmode': drawingmode,
        'width': width,
        'padding': padding,
        // methods
        'getdata' : getdata
    };
};
