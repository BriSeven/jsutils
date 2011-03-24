// a simple functional playhead constructor.



var global = (function() {
    return this;
})();
global.ngv = global.ngv || {};

global.ngv.Playhead = function Playhead() {
    function getTime() {
        return (new Date()).getTime();
    }
    var startTime = 0;
    var stopTime = 0;
    var started = false;
    this.start = function() {
        started = true;
        startTime = getTime() - stopTime;
        return this;
    };
    this.stop = function() {
        if (started) {
            started = false;
            stopTime = getTime() - startTime;
        }
        return this;
    };
    this.reset = function() {
        if (!started) {
            startTime = 0;
            stopTime = 0;
        }
        return this;
    };
    this.set = function(x) {
        if (!isNaN(x) && x >= 0) {
            if (started) {
                startTime = getTime() - x;
            } else {
                stopTime = x;
            }
        }
        return this;
    };
    this.time = function() {
        if (started) {
            return getTime() - startTime;
        } else {
            return stopTime;
        }
    };
}; 
