var FractalAnimation = function (data) {
    data = data || {};
    /// private
    var that = this;
    var animated = ko.observable(data.animated);


    var play = function () {

    };
    // returns object raw data for storage / initialization
    var getdata = function () {
        return {
            'animated': animated()
        }
    };
    var init = function () {

    }();
    /// public
    return {
        // properties
        'animated': animated,
        // methods
        'play': play,
        'getdata' : getdata,
        'init': init
    };
};
