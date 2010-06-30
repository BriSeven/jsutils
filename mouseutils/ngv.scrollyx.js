/*global 
ngv jQuery setInterval document clearInterval parseFloat parseInt */

//depends on ngv.mouse
//and jQuery
// 
//description:
//enables you to make a physics based scrolling behavior on some html elements
//usage:
//create some html elements with a fixed size, style them using css to have 
//overflow:hidden,
//and ensure that the content *is* bigger than the viewport, or you won't see anything happen.
//give these html elements the class "ngvScrollyx"
//you can optionally set some parameters for the scrolling behavior by setting attributes on the element:
// ======================
// = Element Attributes =
// ======================
//margin (in pixels)
//friction (a number between 0, and 1, 1 means no friction, 0 means no momentum.)
//orientation (a string, either "horizontal" or "vertical")
//id (a string) if you want to be able to manipulate the scrolling behavior later with javascript, you should add an id attribute
//snap: how forceful are the margins? (a number between 0 and 1, default is 0.5);
//if you want to scroll to a specific point in the scrollyx
//you can use the following javascript:
//  ngv.Scrollyx.getScrollyxById("yourElementIdHere").scrollTo(60);
//where scrollTo() accepts a number in pixels, and optionally a second parameter 
//specifying how forcefully the scroll should happen. The default for that force is 1
//for example, ngv.Scrollyx.getScrollyxById("yourElementIdHere").scrollTo(60,2); would scroll instantaneously
// ngv.Scrollyx.getScrollyxById("yourElementIdHere").scrollTo(60,0.1); would slowly crawl to the target
var global = (function() {
    return this;
})();
global.ngv = global.ngv || {};
ngv.Scrollyx = function(o) {
    var i;
    for (i in o) {
        if (i in ngv.Scrollyx.prototype) {
            this[i] = o[i] || this[i];
        }
    }
};
ngv.Scrollyx.prototype = {
    id: null,
    orientation: "vertical",
    position: 0,
    velocity: 0,
    force: 0,
    scrollsize: 800,
    size: 200,
    margin: 40,
    friction: 0.9,
    gotoforce: 0,
    gotoposition: 0,
    clicked: false,
    element: null,
    snap: 0.5,
    simulate: function(mouse) {
        var dposition, dvelocity, dforce;
        var mousevelocity = this.orientation === "horizontal" ? mouse.vx : mouse.vy;
        dforce = this.force;
        dposition = this.position;
        dvelocity = this.velocity;
        var give = this.scrollsize - this.size;
        dforce = 0; //only apply a force if a mouse is clicked over the specified element.
        if (mouse.lb && this.clicked) {
            dforce = (-mousevelocity) - dvelocity;
        } //console.log(dforce);
        var snap = this.snap;
        var isnap = 1 - snap; //if under or over scroll margin, move back towards margin line.
        if (dposition < this.margin) {
            dposition = (dposition * isnap + this.margin * snap);
            dvelocity *= isnap;
        }
        if (dposition > (give - this.margin)) {
            dposition = (dposition * isnap + (give - this.margin) * snap);
            dvelocity *= isnap;
        } //apply physics
        dvelocity += dforce;
        dvelocity *= this.friction;
        dposition += dvelocity; //force element to animate towards a particular position
        dposition += 0.5 * this.gotoforce * (this.gotoposition - dposition);
        this.gotoforce *= this.friction;
        this.position = dposition;
        this.velocity = dvelocity;
        this.force = dforce;
        return this;
    },
    update: function() {
        if (this.orientation === "horizontal") {
            (this.element || {}).scrollLeft = this.position;
        } else {
            (this.element || {}).scrollTop = this.position;
        }
    },
    scrollTo: function(position, force) {
        this.gotoposition = position || this.position;
        this.gotoforce = force || 1;
    },
    destroy: function() {
        var i;
        for (i in this.objects) {
            if (this.objects[i] === this) {
                delete this.objects[i];
            }
        }
    }
};
ngv.Scrollyx.getScrollyxById = function(id) {
    var i;
    for (i in this.objects) {
        if (this.objects[i].id === id) {
            return this.objects[i];
        }
    }
};
ngv.Scrollyx.init = function() {
    var elements = jQuery(".ngvScrollyx");
    var objects = ngv.Scrollyx.objects || [];
    elements.map(function(o) {
        var jthis, that, orient, obj;
        if (!this.scrollyx) {
            this.scrollyx = true;
            jthis = jQuery(this);
            that = this;
            orient = jthis.attr("orientation");
            obj = new ngv.Scrollyx({
                id: jthis.attr("id"),
                orientation: orient,
                friction: parseFloat(jthis.attr("friction"), 10),
                snap: parseFloat(jthis.attr("snap"), 10),
                margin: parseInt(jthis.attr("margin"), 10),
                position: parseInt(jthis.attr("margin"), 10),
                size: orient === "horizontal" ? jthis.width() : jthis.height(),
                scrollsize: orient === "horizontal" ? that.scrollWidth : that.scrollHeight,
                element: that,
                watcher: setInterval(function() {
                    obj.size = orient === "horizontal" ? jthis.width() : jthis.height();
                    obj.scrollsize = orient === "horizontal" ? that.scrollWidth : that.scrollHeight;
                },
                1000)
            });
            objects.push(obj);
            jthis.bind("mousedown", function() {
                obj.clicked = true;
            });
        }
    });
    jQuery(document).bind("mouseup", function() {
        objects.forEach(function(o) {
            o.clicked = false;
        });
    }).bind("mousedown", function() {
        return false;
    });
    ngv.Scrollyx.objects = objects;
    if (!ngv.Scrollyx.interval) {
        ngv.Scrollyx.interval = setInterval(function() {
            objects.forEach(function(o) {
                o.simulate(ngv.mouse);
                o.update();
            });
        },
        20);
    }
};
ngv.Scrollyx.destroyAll = function() {
    clearInterval(ngv.Scrollyx.interval);
    delete ngv.Scrollyx.objects;
};

jQuery(function() {
    ngv.Scrollyx.init();
});
