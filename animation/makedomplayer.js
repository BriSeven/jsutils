//An animation back end for dom objects.
//
/*
    sprites createElementsAt(descriptor, selector) {
    void function setAttribute(sprite, property, value) {
    void function applyAttributes(sprites, attributes) 
    dict function getSpriteDictionary(sprites)
    player function makeAnimationPlayer(sprites,animation,applyAttributes,speed,interval){
*/
define(["jquery","playhead","underscore"],function($,playhead){

	function hw(el) {
        el = $(el);
        el.css("-webkit-transform", "translate3d(0px,0px,0px)");
        el.css("-moz-transform", "translate3d(0px,0px,0px)");
        el.css("-o-transform", "translate3d(0px,0px,0px)");
        el.css("transform", "translate3d(0px,0px,0px)");
    }

    function makeAnimationPlayer(objects, animation, applyAttributes,speed,interval){
        var ph = playhead();
        var time=0;
        speed = speed || 1;
        interval = interval || 20;
        //check for animation.
        //check for apply Attributes.
        //expect objects and apply attributes to be compatible
        //animation is result of makeAnimation. so it has frameDiff and frame

        var animationTimer = 0;
        var player = {
            onFinish:function(){},
            play:function(){
                var aproperties={};
                var animation1;
                clearInterval(animationTimer);
                ph.start(); 
                animationTimer = setInterval(function(){
                    var t=ph.time();
                    if(t*speed>1000){
                        clearInterval(animationTimer);
                        player.onFinish();
                        ph.stop();
                    }
                    if (t !== time) {
                        time=t;
                        animation1 = animation.frameDiff(aproperties, t*speed);
                        aproperties = animation.frame(t*speed);
                        requestAnimFrame(function(){
                            applyAttributes(objects,animation1);
                        });
                    }

                },interval);

            },
            stop:function(){
                ph.stop();
                clearInterval(animationTimer);

            }

        };
        return player;

    }
    function createElementsAt(descriptor, selector) {
        var $target = $(selector || "body");
        var keys = _.keys(descriptor);
        var selected =$(selector);
        
        function dommap(key) {
            var obj = descriptor[key];
            var jq;
            var tobj;
            if (obj.clone) {
                tobj = getElementByName(obj.clone, descriptor);
                if (tobj) {
                    jq = tobj.$.clone();
                } else {
                    delete descriptor[key];
                    return
                }
            } else if (obj.ref) {
                if (selected) {
                    jq = selected.parent().find(obj.ref) //should pass this in, but for now, global
                } else {
                    delete descriptor[key];
                    return
                }
            } else if (obj.href) {
                jq = jq || $("<a />");
                setAttribute(jq, "href", obj.href);
                if (obj.id) {
                    setAttribute(jq, "id", obj.id);
                }
            } else if (obj.id) {
                jq = $("<div id=\"" + obj.id + "\" />");
            } else {
                jq = $("<div />");
            }
            //apply attributes.
            for (var i in obj) {
                setAttribute(jq, i, obj[i]);
            }
            //someday, it should be realised that id is redundant. but for now it's needed for css;
            var domn = jq[0];
            obj.domNode = domn;
            obj.$ = jq;
            if (obj.children) {
                createElementsAt(obj.children, domn);
            }
            if (obj.ref) {
                return
            }
            return domn;
        }
        function notUndefined(o) {
            return o !== undefined;
        }
        var dom = _.filter(_.map(keys, dommap), notUndefined);
        //(dom);
        $target.append(dom);
        return descriptor;
    }
    function getElementByName(name, descriptor, array) {
        var a = array || [],
            i;
        for (i in descriptor) {
            if (descriptor.hasOwnProperty(i) && i !== "domNode" && i !== "$") {
                ////(i);
                if (name === i) {
                    a.push(descriptor[i]);
                }
                getElementByName(name, descriptor[i].children, a);
            }
        }
        return a[0];
    }
    function setAttribute(el, name, value) {
        if(el.$){
            el=el.$;
        }
        if(!el.css){
            $(el);
        }
        
        var attributes = {
            "id": "attr",
            "href": "attr",
            "width": "css",
            "height": "css",
            "left": "css",
            "top": "css",
            "backgroundx": "bg",
            "backgroundy": "bg",
            "visible": "vis",
            "opacity": "css",
            "hw": "hw",
            "clear": "css",
            "display": "css",
            "marginLeft": "css",
            "marginTop": "css",
            "position": "css",
            "class": "attr",
            "background-repeat": "css"
        }
        var attributors = {
            attr: function (el, attrname, attrval) {
                $(el).attr(attrname, attrval);
            },
            css: function (el, cssname, cssval) {
                if(cssname==="width");
             //   //(el,cssname, cssval);

                 $(el).css(cssname, cssval);
                
            },
            hw: function (el, affirm, affirmval) {
                if (affirmval === true) {
                    hw(el);
                }
            },
            bg: function (el, name, value) {

                var $t = el
                $t.data(name, value);
                var bgx = $t.data("backgroundx") || "0";
                var bgy = $t.data("backgroundy") || "0";

                 //   //($t[0], bgx + " " + Math.round(bgy)+"px", el, name, value,$t.css("background-position"));
                    el.css({"backgroundPosition":bgx+" "+bgy+"px"});
                
            },
            vis: function (el, name, value) {
                if ( !! value) {
                    $(el).css({
                        "visibility": "",
                        display: "block"
                    });
                } else {
                    $(el).css("visibility", "hidden");
                    //$(el).css("display","none");
                }
            }
        }
        if (attributes.hasOwnProperty(name)) {
            attributors[attributes[name]](el, name, value);
        }
    }

    function applyAttributes(objects, attributes) {
    //    //("apply",objects, attributes);
        var objectname, attributename;
        for (objectname in objects) {
            for (attributename in attributes[objectname]) {
                setAttribute(objects[objectname], attributename, attributes[objectname][attributename])
            }
        }
    }
    function getSpriteDictionary(n){
        function recursivekeys(n) { 
            return _.map(_.keys(n),function(o){
                return  [{name: o, node: n[o]},  typeof n[o]==="object"&&n[o].children? recursivekeys(n[o].children):[]];
            });
        }
        var objects = {};
        _.forEach(_.flatten(recursivekeys(n)), function (o) {
            objects[o.name]=o.node;
        });
        return objects;
    }

 
    return {
		createElementsAt: createElementsAt,
		getElementByName: getElementByName,
		setAttribute: setAttribute,
		applyAttributes: applyAttributes,
		getSpriteDictionary: getSpriteDictionary,
        makeAnimationPlayer: makeAnimationPlayer
    }


});