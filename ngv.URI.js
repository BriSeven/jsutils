/*
Copyright (c) 2009, National Gallery of Victoria
All rights reserved.

Redistribution and use in source and binary forms, with or without 
modification, are permitted provided that the following conditions 
are met:

Redistributions of source code must retain the above copyright notice, 
this list of conditions and the following disclaimer.
Redistributions in binary form must reproduce the above copyright notice, 
this list of conditions and the following disclaimer in the documentation 
and/or other materials provided with the distribution.
Neither the name of the National Gallery of Victoria nor the names of its 
contributors may be used to endorse or promote products derived from this 
software without specific prior written permission.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS 
IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, 
THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR 
PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR 
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, 
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, 
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR 
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING 
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS 
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/


/*
Simple URI parser. There's just enough of the RFC spec implemented here
for relative URI resolution. That is done as follows:

ngv.URI("./relativereference")
.withBaseUri("http://baseuri.example")
.toString();


*/


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