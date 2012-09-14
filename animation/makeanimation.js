//make animation takes base, and a,
//which are both objects with each key cooresponding to a sprite
//each sprite is an object with a list of properties. Base contains default properties
//while sprite contains properties which can optionally be an object in a particular format
//which specifies a keyframe animation.
// for example:
// {
//     "tween": "line",
//     "0500": 0,
//     "0750": -24
// }
//
// the result of makeAnimation is an object with frame, diffFrame, and find methods.
// find takes spritename, propertyname, and time, and returns the next and previous values
// for that sprite's property at that time. 
//
// frame takes T time (in milliseconds), and returns an entire flattened version of the animation object,
// and evaluates the values of all the properties for the given time.
// 
// diffFrame takes a value as returned from frame, and T, and gives you the differences
// between those two times. 
//
// in an animation all sprites are persistent through the whole animation and cannot be removed
// or put back, but a "visible" property can be switched on and off.

// this can be used in conjunction with domprop.js
// to animate dom objects.
//. Since this library does not depend on any other libraries or apis, it can be used in many otehr ways as well.
define([], function () {
    return function makeAnimation(base, a) {
        "use strict";
        base = base || {};
        var nprop = {},
            obj, prop, param, index = 0,
            adata = {},
            //perlin noise
            
            tweenfuncs = {
                line: function (a, t) {
                    //("line",a,t);
                    var interval = a[1][0] - a[0][0];
                    var time = (t - a[0][0]) / interval;
                    return a[0][1] * (1 - time) + a[1][1] * (time);
                },
                frame: function (a, step, t) {
                    var interval = a[1][0] - a[0][0];
                    var time = (t - a[0][0]) / interval;
                    ////(time, a[0][1]*step, a[1][1]*step);
                    return Math.floor(a[0][1] * (1 - time) + a[1][1] * (time)) * step;
                }
            },
            animation = {
            tweens: adata,
            //return next and prev frames via binary search.
            find: function find(obj, prop, t) {
                //first get timeline for prop.
                var tl = (adata[obj] || {})[prop];
                var lower = 0;
                var upper = null;
                var prev;
                var next;
                var middle;
                var depth = 55;
                var depthcounter = 0;
                if (tl && tl.length) {
                    upper = tl.length - 1;
                    if (t < tl[lower][0]) {
                        prev = -Infinity;
                        next = 0;
                    } else if (t >= tl[upper][0]) {
                        prev = upper;
                        next = Infinity;
                    } else if (lower === upper - 1) {
                        prev = lower;
                        next = upper;
                    } else {
                        while (next === undefined || (prev === undefined && depthcounter < depth)) {
                            depthcounter += 1;
                            middle = Math.floor((upper + lower) / 2);
                            if (t >= tl[middle][0]) {
                                lower = middle;
                            } else {
                                upper = middle;
                            }
                            if (lower === (upper - 1)) {
                                prev = lower;
                                next = upper;
                            }
                        }
                    }
                    if (depthcounter >= depth) {
                        return;
                    }
                    return [tl[prev], tl[next]];
                } else {
                    return tl;
                }
            },
            frame: function frame(t) {
                return animation.frameDiff({}, t);
            },
            frameDiff: function frameDiff(oframe, t) {
                //get only differences from previous state.
                //make a new object list nobjlist
                //for each object
                //  make a new object on nobjlist nobj 
                //  make a property counter
                //      for each property
                //          get next, prev, and tween fuction
                //          calculate value
                //          if value is different from oframe's
                //              assign value to nobjlist[nobj][prop]
                //              increment property counter
                //  if property counter is 0, delete nobj
                //return nobjlist;  
                var obj, prop, propcount, nobjlist = {},
                    prevnext, step, tween, value;
                for (obj in adata) {
                    nobjlist[obj] = {};
                    propcount = 0;
                    for (prop in adata[obj]) {
                        ////(typeof prevnext, prevnext);
                        if (typeof adata[obj][prop] === "object" && !isNaN(adata[obj][prop].length)) {
                            prevnext = animation.find(obj, prop, t);
                            if (typeof prevnext[0] === "undefined") {
                                value = prevnext[1][1];
                            } else if (typeof prevnext[1] === "undefined") {
                                value = prevnext[0][1];
                            } else {
                                if (typeof prevnext[0][1] === "number") {
                                    tween = adata[obj][prop].tween || "line";
                                    if (tween === "step" || tween === "frame") {
                                        step = adata[obj][prop].step;
                                        value = (tweenfuncs[tween] || tweenfuncs.line).call(null, prevnext, step, t);
                                    } else {
                                        value = (tweenfuncs[tween] || tweenfuncs.line).call(null, prevnext, t);
                                    }
                                } else {
                                    value = prevnext[0][1];
                                }
                            }
                        } else {
                            value = adata[obj][prop];
                        }
                        if (value !== (oframe[obj] || {})[prop]) {
                            nobjlist[obj][prop] = value;
                            propcount += 1;
                        }
                    }
                    if (propcount === 0) {
                        delete nobjlist[obj];
                    }
                }
                return nobjlist;
            }
        };
        //transform to a sorted structure.
        function sortKeyframes(a, b) {
            return a[0] - b[0];
        }
        for (obj in a) {
            adata[obj] = {};
            for (prop in a[obj]) {
                if (typeof a[obj][prop] === "object") {
                    adata[obj][prop] = {};
                    nprop = {
                        length: 0
                    };
                    for (param in a[obj][prop]) {
                        if (isNaN(param)) {
                            nprop[param] = a[obj][prop][param];
                        } else {
                            nprop[nprop.length] = [parseInt(param, 10), a[obj][prop][param]];
                            nprop.length += 1;
                        }
                    }
                    Array.prototype.sort.call(nprop, sortKeyframes);
                    nprop.base = (base[obj] || {})[prop];
                    adata[obj][prop] = nprop;
                } else {
                    adata[obj][prop] = a[obj][prop];
                }
            }
        }
        return animation;
    }
})