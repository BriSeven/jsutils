/**
* 
* tedit Creates a behavior that allows elements' content to be edited
* by changing them temporarily into a form field when clicked.
* 
* depends on jquery
*  example usage:
*  tedit(description, "description", function(t){ console.log(t); return t }, 400);
* 
* @PARAM (jQuery) jqElem the jquery containing the element 
*     you wish to attach the behavior to
* @PARAM (string) formname the value of the name attribute on the resulting form
* @PARAM (function) callback to be called when the field is finished being edited
*    the callback recieves a single parameter, a string contianing the contents of the field.
* @PARAM (number) length the maximum length of the form field
* @PARAM (jQuery) jqLink is a jquery containing anything else you want
*    to activate the editing mode. for example: an "edit title" link.


*/
function tedit (jqElem, formname, callback, length, jqLink) {
	jqElem.click(clickfun);
	if(jqLink instanceof jQuery){ jqLink.click(clickfun);}
	var ftype = length > 200? "textarea":"input";
	
	var ftext = [
		'<form class="',
		formname,
		'"> <',
		ftype,
		' name="',
		(formname||""),
		'"  maxlength="',
		(length || 40),
		'" type="text"></',
		ftype,
		'></form>'
	].join("");
	
	var f = jQuery(ftext);
	f.css({display:"inline"});
	function clickfun () {
		var cb = function () { 
			var t= f.children().attr("value");
			f.replaceWith(jqElem); 
			var r = callback(t);
			jqElem.click(clickfun).text(r||t);
			return r;  
		};
		jqElem.replaceWith(f)
		f.bind("submit", cb).find("input, textarea").bind("blur",cb);
		f.children().attr("value", jqElem.text()).select();
		return false;
	}
	
}
