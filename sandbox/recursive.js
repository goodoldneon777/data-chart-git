var str = 'x';
console.log(str);
str = foo(str, '  ');
console.log(str);


function foo(str, indent) {
	'use strict';
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



String.prototype.fieldWrapToArray = function() {
	var str = this;
	var arr = str.match(/\[(.*?)\]/g);
	if (arr === null ) {
		arr = [];
	} else {
		$.each(arr, function( index, value ) {
			arr[index] = value;
		});
	}
	return arr;
};


String.prototype.fieldWrapAdd = function() {
	'use strict';
	var str = this;
	return '[' + str + ']';
};


String.prototype.fieldWrapDelete = function() {
	'use strict';
	var str = this;
	str = str.replace(/\[/g,'');
	str = str.replace(/\]/g,'');
	return str;
};



// var idFull = '';
// var output = '';
// var filterGlobal = '';

// idFull = '[add]';
// // idFull = '[add] / [difference]';
// filterGlobal = 'tap_yr = \'15\' \n';
// // idFull = '[difference]';
// output = createSubQuery(idFull, filterGlobal);
// console.log(output);





function createSubQuery(id, filterGlobal, queryDepth) {
	if (queryDepth === undefined) { queryDepth = 1; } else { queryDepth += 1; }
	if (queryDepth > 5) { return false; }
	var query = '';
	var subQuery = '';
	var selectPrefix = '';
	var calcField = null;
	var obj = {};
	var subFields = [];
	var filter = '';
	var filterRealisticArray = [];
	var subName = '';
	
	subFields = id.fieldWrapToArray();
	console.log(subFields);
	id = id.fieldWrapDelete();
	console.log(id);
	obj = getDefs(id);
	field = obj.field;

	// subFields = field.fieldWrapToArray();

	if (subFields.length > 0) { calcField = true; } else { calcField = false; }

	if ( (queryDepth === 1)  &&  (calcField === false) ) {
		subName = 'sub1';
		selectPrefix = createSelectPrefix(obj.joinKeyArray, subName);
		query = 
			'select ' + selectPrefix + ', ' + obj.field + ' as ' + id.fieldWrapAdd() + ' \n' +
			'from ' + obj.table + ' \n' +
			'where ' + subName + '.' + filterGlobal +
			'  and ' + subName + '.' + obj.filterRealistic;
	} else if ( (queryDepth > 1)  &&  (calcField === false) ) {
		subName = 'sub1';
		selectPrefix = createSelectPrefix(obj.joinKeyArray, obj.table);
		query = 
			'select ' + selectPrefix + ', ' + obj.field + ' as ' + id.fieldWrapAdd() + ' \n' +
			'from ' + obj.table + ' \n' +
			'where ' + subName + '.' + filterGlobal;
	} else if (calcField === true) {
		subName = 'sub1';
		selectPrefix = createSelectPrefix(obj.joinKeyArray, subName);
		query = 
			'select ' + selectPrefix + ', ' + obj.field + ' as ' + id.fieldWrapAdd() + ' \n' +
			'from( \n';

		$.each(subFields, function( index, value ) {
			subName = 'sub' + (index + 1);
			obj = getDefs( value.fieldWrapDelete() );
			subQuery = createSubQuery(value, filterGlobal, queryDepth);
			subQuery = indent(subQuery, '  ');

			if (index === 0) {
				obj.joinType = '';
				obj.joinOn = '';
			} else {
				obj.joinType += '( \n';
				obj.joinOn = createJoinOn(obj.joinKeyArray, 'sub1', subName);
			}


			filterRealisticArray.push(obj.filterRealistic);


			query +=
				obj.joinType +
				subQuery +
				') ' + subName + ' \n' +
				obj.joinOn;
		});

		$.each(filterRealisticArray, function(index, value) {
			subName = 'sub' + (index + 1);
			if (value.length > 0) {
				if (filter.substr(0, 5) != 'where') {
					filter +=
						'where \n' +
						'  ';
				} else {
					filter += '  and ';
				}
				filter += subName + '.' + value + ' \n';
			}
			
		});

		query += filter;

	} else {
		query = 'how did this get generated?';
	}



	return query;
}



function createSelectPrefix(joinKeyArray, table) {
	var selectPrefix = '';

	if (joinKeyArray.length === 0) { return selectPrefix; }

	$.each(joinKeyArray, function( index, value ) {
		selectPrefix += table + '.' + value;
		if ( index !== (joinKeyArray.length - 1) ) { selectPrefix += ', '; }
	});
	return selectPrefix;
}



function createJoinOn(joinKeyArray, subNameMain, subNameThis) {
	var joinOn = '';

	if (joinKeyArray.length === 0) { return joinOn; }

	joinOn += 'on ';
	$.each(joinKeyArray, function( index, value ) {
		if (index > 0) { joinOn += '  and '; }
		joinOn += subNameMain + '.' + value + ' = ' + subNameThis + '.' + value + ' \n';
	});
	return joinOn;
}



function indent(str, indent) {
	'use strict';
	var arr = str.split('\n');
	str = '';
	$.each(arr, function( index, value ) {
		if ( index < (arr.length - 1) ) {
			str += indent + value + '\n';
		}
	});
	return str;
};






function getDefs(id) {
	var field = '';
	var table = '';
	var joinType = 'inner join';
	var joinKeyArray = ['ht_num', 'tap_yr'];
	var filterRealistic = '';

	switch (id) {
		case 'recovery':
			field = '[add] / [difference]';
			break;
		case 'add':
			field = 'wgt';
			table = 'alloy';
			joinType ='left outer join';
			filterRealistic = 'wgt > 2';
			break;
		case 'difference':
			field = '[2nd] - [1st]';
			break;
		case '1st':
			field = 'test1';
			table = 'chem';
			filterRealistic = 'test1 > 1';
			break;
		case '2nd':
			field = 'test2';
			table = 'chem';
			break;
		default:
			break;
	}

	return {
		field: field,
		table: table,
		joinType: joinType,
		joinKeyArray: joinKeyArray,
		filterRealistic
	}
}