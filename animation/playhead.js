// a simple functional playhead constructor.

define([],function(){
    return function Playhead() {
        var ph = {};
        function getTime() {
            return (new Date()).getTime();
        }

        var startTime = 0;
        var stopTime = 0;
        var started = false;
        ph.start = function() {
            started = true;
            startTime = getTime() - stopTime;
            return ph;
        };
        ph.stop = function() {
            if (started) {
                started = false;
                stopTime = getTime() - startTime;
            }
            return ph;
        };
        ph.reset = function() {
            if (!started) {
                startTime = 0;
                stopTime = 0;
            }
            return ph;
        };
        ph.set = function(x) {
            if (!isNaN(x) && x >= 0) {
                if (started) {
                    startTime = getTime() - x;
                } else {
                    stopTime = x;
                }
            }
            return ph;
        };
        ph.time = function() {
            if (started) {
                return getTime() - startTime;
            } else {
                return stopTime;
            }
        };
        return ph;
    }; 

})
