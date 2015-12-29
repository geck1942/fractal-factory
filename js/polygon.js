var Polygon = function (PolygonData) {
    /// private
    var that = this;
    var init = function () {

    }
    var sides = PolygonData.sides;
    var width = PolygonData.width;
    var padding = PolygonData.padding;

    /// public
    return {
        // properties
        'sides': ko.observable(sides),
        'width': ko.observable(width),
        'padding': ko.observable(padding)
        // methods

    };
};
