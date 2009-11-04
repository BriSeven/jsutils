


var global = (function(){ return this })();
global.ngv=global.ngv || {};




(function () {
    
    function merge(baseuri, uri) {
        if(baseuri.authority!=null && baseuri.path === ""){
            return "/"+(uri.path);
        } else {
            var basepathsplit = (baseuri.path||"").split("/");
            basepathsplit.pop();
            basepathsplit.push(uri.path);
            return basepathsplit.join("/");

        }
    }

    
    function removeDotSegments(patharray) { //return patharray;
        var input = patharray;
        var output = [];
        while (input.length > 0) {
            if ((input[0] == ".." || input[0] == ".") && input[1] == "/") {
                input.shift();
                input.shift();
            } else if (input[0] === "/" && (input[1] == "." || input[1]=="..") && (input[2] == "/" || input.length==2)) {
                if(input[1]==".."){
                    output.pop();
                    output.pop();
                }
                input.shift();
                input.shift();
                if (input.length == 0) {
                    input = ["/"];
                };
            } else if (input.length == 1 && (input[0] == "." || input[0] == "..")) {
                input = [];
            } else {
                output.push(input.shift());
            }
        }
        return output;
    }
   
    
    function parseURI(uristring) {
        //upper level parse
        var r = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/.exec(uristring);
        var obj = {scheme:r[2], authority:r[4], path:r[5], query:r[7], fragment:r[9]};
        //normalize scheme
        if(obj.scheme){
            obj.scheme=obj.scheme.toLowerCase();
        }


        if(r){
            return ngv.URI(obj);
        }
    }
    
    
    
    ngv.URI=function (obj){

        if(this===global || this===ngv){
            return new ngv.URI(obj);
        }
        if(typeof obj === "string"){
            return parseURI(obj);
        }
        if(typeof obj === "object"){
            for(i in obj){
                if(obj.hasOwnProperty(i) && i in ngv.URI.prototype){
                    this[i]=obj[i];
                }
            }
        }
    };
    
    ngv.URI.prototype={
        scheme:null,authority:null,path:null,query:null,fragment:null,pathsegments:null,
        toString:function(){
            return [
                (this.scheme!=null ? this.scheme+":":""),
                (this.authority!=null ? "//"+this.authority:""),
                (this.parsePath().join("") || ""),
                (this.query != null ? "?" + this.query : ""),
                (this.fragment != null ? "#" + this.fragment : "")
            ].join("");
        },
        parsePath : function (path){
                path=path||this.path||"";

                var pathseg=path.split(/(\/)/);
                pathseg = pathseg.filter(function(o,i,a){
                    return !!o;
                });
                pathseg=removeDotSegments(pathseg);

                return pathseg;
        },
        withBaseURI: function (baseuri) {
            var base = ngv.URI(baseuri);
            var T = {};
            var R = this;
            
            if(R.scheme!=null){
                T.scheme = R.scheme;
                T.authority = R.authority;
                T.path = R.parsePath().join(""); //remove dot segments
                T.query = R.query;
                
            } else {
                if(R.authority!=null){
                    T.authority = R.authority;
                    T.path = R.parsePath().join("");  //remove dot segments
                    T.query = R.query;
                } else {
                    if (R.path == "") {
                        T.path = base.parsePath().join("");  //remove dot segments
                        if(R.query!=null){
                            T.query = R.query
                        } else {
                            T.query = base.query
                        }
                    } else  {
                        if(R.path.charAt(0) == "/"){
                            T.path = R.parsePath().join("");//remove dot segments
                        } else {
                            T.path = merge(base, R);
                            T.path = this.parsePath(T.path).join(""); // remove dot segments
                        }
                        T.query = R.query;
                    }
                    T.authority = base.authority;
                }
                T.scheme = base.scheme;
            }
            T.fragment = R.fragment;
            
            return ngv.URI(T);
            
        
            
        
        }
    };
    
    
})();