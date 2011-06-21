(function () {
  var imageTotal=0;
  var imageCount=0;
  var slidelist;
  var listitems;
  var images;
  var slideDuration=2000;
  var transition=200;
  var transitionType="fade";
  var ph;
  var listwatcher = setInterval(poll,0);
  
  function poll() {
        var ul=document.getElementsByTagName("ul"),i;
        
        for(i=0;i<ul.length;i++){
            
            if(/ngvslides/.test(ul[i].className)){
                clearInterval(listwatcher);
                onlistload(ul[i]);
            }
        }
        
  }
  function opacity (o) {
      this.style.opacity=o;
  }
  function onlistload(list){
      list.style.position="relative";
      list.style.backgroundColor="#88FF33";
      list.style.backgroundImage="url(images/loader.gif)";
      list.style.backgroundPosition="center";
      list.style.backgroundRepeat="no-repeat";
      
      list.style.overflow="hidden";
      slidelist=list;
      images=Array.prototype.slice.apply(list.getElementsByTagName("img"));
      imageTotal=images.length;
      images.forEach(function(o){
          o.onload=onimgload;
          o.opacity=opacity;
          if(o.complete){
              o.onload();
          }
      });
      
      listitems=Array.prototype.slice.apply(list.getElementsByTagName("li"));
      listitems.forEach(function(o){
          o.style.position="absolute";
          o.style.left="600px";
          o.style.top="402px";
          
      });
  }
  function onimgload () {
      imageCount++;
      slidelist.style.width=this.width+"px";
      slidelist.style.margin="0 auto";
      if(imageTotal-imageCount === 0){
          onAllImagesLoaded();
      }
  }
  function onAllImagesLoaded () {
      var transitions=[];
      ph=new ngv.Playhead();
      images.forEach(function(img,i){
          var start=i*slideDuration;
          if(i==0){
              //overlap
              transitions.push(function(time){
                  img.opacity(ngv.crossfader(time,slideDuration,transition,start)+ngv.crossfader(time,slideDuration,transition,imageTotal*slideDuration));
              })
          }else{
              
              transitions.push(function(time){
                  img.opacity(ngv.crossfader(time,slideDuration,transition,start));
              })
          }

      })
      listitems.forEach(function(o){
          o.style.left="0px";
          o.style.top="0px";
          
      });
      ph.start();
      
      setInterval(function(){
          transitions.forEach(function(o){
              o(ph.time()%(imageTotal*slideDuration));
          });
      },20);
      var controls=document.getElementById("controls");
      controls.onclick=function(e){
          e=e||event;
          var href=e.target.href;
          var hash=/#(.*)$/.exec(href)[1];
          ({
              play:function(){
                  ph.start();
              },
              pause:function(){
                  ph.stop();
              },
              restart:function(){
                  ph.stop();
                  ph.reset();
                  ph.start();
              },
              forward:function(){
                  ph.set(ph.time()+slideDuration);
              },
              back:function(){
                  ph.set(ph.time()-slideDuration);
              }
          })[hash]();
          
      }
      
  }
  
  
})()