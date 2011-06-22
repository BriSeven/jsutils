// a simple functional tweener
// an object with parameters is passed in
// an object with a single method set() is returned;
// set takes a time in miliseconds; The object contains the tweened parameters.
// a begin and and end object has parameters that are tweened between
// Only number properties are tweened
// if the end object does not contain a parameter, begin's is kept.
// if the end object contins a parameter begin doesn't, that parameter is discarded
// startTime marks when the tween will begin
// duration sets how long the animation will last
// provide a one argument easing function for fine control of the quality of the animation
// onenter is fired if set is called, and the tween wasn't happening before
// onchange is fired if set is called, and the tween is happening.
// onexit is fired when the tween isn't happening anymore.


var global = (function() {
    return this;
})();
global.ngv = global.ngv || {};

global.ngv.Tween = function Tween(params) {
    var istweening = false;
    var opt = {
        begin: params.begin || {
            x: 0
        },
        end: params.end || {
            x: 1
        },
        startTime: params.startTime || 0,
        duration: params.duration == null ? 1000 : params.duration,
        ease: params.ease ||
        function(x) {
            return x;
        },
        onchange: params.onchange ||
        function() {},
        onenter: params.onenter ||
        function() {},
        onexit: params.onexit ||
        function() {}

    };

    var tween = {
        set: function set(time) {
            var i, t = time - opt.startTime;
            if (t >= 0 && t < opt.duration) {

                for (i in opt.begin) {
                    if (opt.begin.hasOwnProperty(i) && i !== "set" && !isNaN(opt.begin[i])) {
                        if(!isNaN(opt.end[i])){
                            tween[i]=opt.ease(t / opt.duration) * (opt.end[i] - opt.begin[i]) + opt.begin[i];
                        } else {
                            tween[i]=opt.begin[i];
                        }
                    }
                }

                if (!istweening) {
                    opt.onenter(tween);
                    istweening = true;
                }
                opt.onchange(tween);


            }
            else {
                for (i in opt.begin) {
                    if (opt.begin.hasOwnProperty(i) && i !== "set") {
                        tween[i] = opt.begin[i];
                    }
                }
                if (istweening) {
                    for (i in opt.end) {
                        if (opt.end.hasOwnProperty(i) && i !== "set") {
                            tween[i] = opt.end[i];
                        }
                    }
                    opt.onexit(tween);
                    istweening = false;

                }

            }
            return tween;
        }
    };




};