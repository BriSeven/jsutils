(function (ngv) {
    /*a sawtooth wave which repeats every duration+transition along time, 
    and whose teeth cross 0 at duration, and 1 at duration+transition*/
    function periodic(time, duration, transition) {
        var a=duration,b=transition,x=time;
        return (x%(a+b)-a)/b;
    }

    /* 
    a stair step with count steps of duration size,
     that transition with a soft slope for transition time,
     the steps increment by 1 for each flat.
    */
    function stepper(time, duration,transition){
        var a=duration,b=transition,x=time;
        var p=periodic(x,a,b);
        var r=Math.pow(p,2)*Math.max(Math.floor(p+1),0)+Math.floor(x/(a+b));
        return r;
    }


    /* a function for the opacity of a single element in a cross fader*/
    /* over time, start fading in at start-transition, hold for duration, and fade out at start+duration-transition*/

    function crossfader(time, duration, transition, start) {
       var x=time,a=duration,b=transition, c=start;
       var fadein=-(Math.pow(x-c,2)/(b*b))+1;
       var fadeout=-(Math.pow(x-c-a+b,2)/(b*b))+1;
       var sustain = 1;
       return  Math.max(x < c ? fadein : x > (c+a-b) ? fadeout : 1,0);
    }
    ngv.periodic=periodic;
    ngv.stepper=stepper;
    ngv.crossfader=crossfader;

})(this.ngv||this.exports||this);