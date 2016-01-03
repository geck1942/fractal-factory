var FractalAnimation = function (data) {
    data = data || {};
    /// private
    var that = this;
    var animated = ko.observable(data.animated);
    var maxframes = 10;
    var frame = ko.observable(0);
    // returns the current frame in percent (depend. maxframe)
    var framepct = ko.pureComputed(function () {
        return frame() / maxframes;
    });


    // returns object raw data for storage / initialization
    var getdata = function () {
        return {
            'animated': animated()
        }
    };
    var nextframe = function () {
        this.frame((this.frame() + 1) % maxframes);
    };
    var init = function () {

    }();
    /// public
    return {
        // properties
        'animated': animated,
        'frame': frame,
        'framepct': framepct,
        // methods
        'nextframe': nextframe,
        'getdata' : getdata,
        'init': init
    };
};
