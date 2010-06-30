//this file depends on jquery for its event handler abstractions.
//this is not compatible with IE;



ngv = window.ngv || {};

//the goal of this script is to gather high level information about the mouse
// for use in continuous animation functions. The information is gathered in the ngv.mouse object
// x, y : page position
// vx, vy: mouse velocity
// lb: boolean specifying whether the left mouse button is pressed or not
// ux, uy: the position of the mouse when the button was last pressed down
// dx, dy: the position of the mouse when the button was last released
// odx, ody: the distance in pixels that the mouse has traveled.
// gestures: a buffer containing the last 10 gestures performed

// Velocity and distance is only calculated while the mousebutton is being held down.
// This works best for touch screens, that are only ever aware of the "pointer" while someone is touching
// the screen. Attempts to calculate during any other time on a touch screen leads to erroneous data.




ngv.mouse={x:0,y:0,vx:0,vy:0,lb:false,dx:0,dy:0, ux:0,uy:0,odx:0,ody:0,gestures:[], toString:function(){
    var r = "";
    for(i in this){
        if(typeof this[i]!=="function"){
            r+=(i+": "+this[i]+"; \n");
        }
    }
    return r;
}};

jQuery(function(){
    var timeinterval=20;
    
    function calculateMouseVelocity(mousetrail, mouse) {
        if(mouse.lb){
            var mousevelocity={x:0,y:0},softness=4,l;
            mousetrail.unshift({x:mouse.x,y:mouse.y});
            //limit mousetrail length to value of "softness";
            l = mousetrail.length;
            mousetrail.length = l > softness? softness : l;
            l= mousetrail.length;
            
            var lm=mousetrail[l-1]; //get the oldest available mouse info;
            var norm=l-1; // if I've got four points 0-0-0-0, there's 3 unit lengths between them.
                              // to obtain the average distance between the points, I divide by 3.
            if(norm){
            mousevelocity.x= (mouse.x - lm.x)/(norm||1);
            mousevelocity.y= (mouse.y - lm.y)/(norm||1);
            return mousevelocity;
            }
        }
        return {x:0,y:0};
    }
    //run on mouse up, and examine the mouse object to determine if any gestures have been performed
    
    function detectGesture (m){
        var dirnumber = (m.dx-m.ux>100) + (m.dx-m.ux<-100)*2 + (m.dy-m.uy>100)*4 + (m.dy-m.uy<-100)*8;
        //check for a tap on left or right hand side of screen
        var ba=(m.ux < window.innerWidth*0.5);
        var gesturenumber = dirnumber + (ba&&!dirnumber)*32+ (!ba&&!dirnumber)*64;
        //turn results into an integer that I can map to specific gesture id letters
        var gestures = ["n", "l", "r", "lr", "u", "ul", "ur", "ulr", "d", "dl", "dr", "dlr"]
        gestures[32]="b";
        gestures[64]="a";
        
        return gestures[gesturenumber];
        
    }
    

    
    //mousemoves happen very quickly (and in great number). It's best to have as little JS running
    //on this event as possible.
    
    jQuery(document).bind("mousemove", function (e) {
        ngv.mouse.x=e.pageX; 
        ngv.mouse.y=e.pageY;  
    });
    

    
    
    
    jQuery(document).bind("mouseup", function (e) {
        ngv.mouse.lb=false;
        ngv.mouse.ux=ngv.mouse.x;
        ngv.mouse.uy=ngv.mouse.y;
        ngv.mouse.gestures.unshift(detectGesture(ngv.mouse));
        

        ngv.mouse.gestures.length=10;
        
    });
    jQuery(document).bind("mousedown", function (e) {
        ngv.mouse.lb=true;
        mousetrail.length=0;
        ngv.mouse.dx=ngv.mouse.x;
        ngv.mouse.dy=ngv.mouse.y;
        
    });
    
    
    
    var mousetrail = [];

    
    setInterval(function () {
       var velocity = calculateMouseVelocity(mousetrail, ngv.mouse);
       ngv.mouse.vx=velocity.x;
       ngv.mouse.vy=velocity.y;
       ngv.mouse.odx+=((Math.abs(velocity.x))||0);
       ngv.mouse.ody+=((Math.abs(velocity.y))||0);
       
    },timeinterval);
});

