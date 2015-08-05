//================================================================
//===  extensions.js  =========================================
//==========================================================


String.prototype.fieldWrapDelete = function() {
	'use strict';
	if (s.OS === 'linux') {
		var str = this.replace(/\[/g,'');
		str = str.replace(/\]/g,'');
		return str;
	} else if (s.OS === 'windows') {
		return this.replace(/\"/g,'');
	}
};



String.prototype.fieldWrapAdd = function() {
	'use strict';
	if (s.OS === 'linux') {
		return '[' + this + ']';
	} else if (s.OS === 'windows') {
		return '"' + this + '"';
	}
};



String.prototype.fieldWrapToArray = function() {
	'use strict';
	var arr = [];
	if (s.OS === 'linux') {
		arr = this.match(/\[(.*?)\]/g);
		if (arr === null ) {
			arr = [];
		} else {
			$.each(arr, function( index, value ) {
				arr[index] = value;
			});
		}
		return arr;
	} else if (s.OS === 'windows') {
		var arrTemp = this.split('"');
		arr = [];
		$.each(arrTemp, function( index, value ) {
			if (index % 2 > 0) {
				arr.push(value.fieldWrapAdd());
			}
		});
		return arr;
	}
};



function nullIfBlank(val) {
	'use strict';
	if (val === '') {
		return null;
	} else {
		return val;
	}
}




function getUrlParameter(sParam) {
	'use strict';
  var sPageURL = window.location.search.substring(1);
  var sURLVariables = sPageURL.split('&');
  var val = null;
  for (var i = 0; i < sURLVariables.length; i++) 
  {
      var sParameterName = sURLVariables[i].split('=');
      if (sParameterName[0] === sParam) 
      {
          val = sParameterName[1];
          break;
      }
  }

  if (val === undefined) {
  	val = null;
  }

  return val;
}




function indentString(str, indent) {
	'use strict';

	if (str === '') {
		return str;
	}

	var arr = str.split('\n');
	str = '';

	if (arr.length === 1) {
		str = indent + arr[0] + '\n';
	} else {
		$.each(arr, function( index, value ) {
			if ( index < (arr.length - 1) ) {
				str += indent + value + '\n';
			}
		});
	}

	return str;
}