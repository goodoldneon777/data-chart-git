//================================================================
//===  sql.js  ================================================
//==========================================================



mSQL.runQuery = function(query, type) {
	'use strict';
	var urlQuery = '';
	var data = {};

	if (s.OS === 'windows') {
		urlQuery = 'php/query_windows.php';
	} else if (s.OS === 'linux') {
		urlQuery = 'php/query_linux.php';
	}


	$.ajax({
		type: 'POST',
		url: urlQuery,
		data: {
			'sql' : JSON.stringify(query),
			'type' : JSON.stringify(type)
		},
		dataType: 'json',
		success: function(results) {
			if (results.length > g.maxRows) {
				alert(
					'Too many results. Please narrow your search. \n\n' +
					'Results: ' + results.length + ' heats \n' +
					'Max: ' + g.maxRows + ' heats \n'
				);
			}

			console.log(query);
			console.log(mMaster);

			mMaster.queryResultsHandle(results.data, type);
			mSQL.updateLog(mMaster, results.duration, results.user, results.ip, null);
	
			mOptions.toggleSubmitBtn('enable');
		},
		error: function(results) {
			alert(
				'ERROR: AJAX/PHP/SQL issue. \n\n' +
				'This error isn\'t your fault. Please email a screenshot of this web page to Aaron Harper at amharper@uss.com.'
			);

			console.log(results.data);
			console.log(query);

			mSQL.updateLog(mMaster, null, null, null, 'Y');

			mOptions.toggleSubmitBtn('enable');
	  }
	 });
};



mSQL.updateLog = function(mMaster, duration, user, ip, error) {
	var me = getUrlParameter('me');
	var test = getUrlParameter('test');
	var log = getUrlParameter('log');

	if (log !== 'N') {
		$.ajax({
			type: "POST",
			url: 'php/updateLog.php',
			data: {
				"mMaster" : JSON.stringify(mMaster),
				"duration" : 	JSON.stringify(duration),
				"user" : 			JSON.stringify(user),
				"ip" : 				JSON.stringify(ip),
				"error" : 		JSON.stringify(error),
				"me" : 				JSON.stringify(me),
				"test" : 			JSON.stringify(test),
			},
			dataType: 'json',
			success: function(results) {
				// console.log(results);
				// console.log(mMaster);
			},
			error: function(results) {
				console.log("Log failed.");
				console.log(results);
		  }
		});
	}
};



mSQL.mainQueryBuild = function(obj) {
	'use strict';
	var query, x, y, heat, roundX, roundYavg, roundYcount, roundYstdev, filter, queryMoreFilters;
	query = x = y = heat = roundX = roundYavg = roundYcount = roundYstdev = filter = queryMoreFilters = '';
	var centralTable = obj.x.sql.centralTable;
	var centralDB = obj.x.sql.centralDB;
	var centralTableHeat = obj.x.sql.centralTableHeat;
	var filterGlobal = obj.sql.filterGlobal;

	if (obj.x.sql.joinType === 'left outer join') {
		x = 'isNull(subX.' + obj.x.sql.idFull + ', 0) as x';
	} else {
		x = 'subX.' + obj.x.sql.idFull + ' as x';
	}

	if (obj.y.sql.joinType === 'left outer join') {
		y = 'isNull(subY.' + obj.y.sql.idFull + ', 0) as y';
	} else {
		y = 'subY.' + obj.y.sql.idFull + ' as y';
	}

	heat = centralTable + '.' + centralTableHeat + ' as heat';

	if (obj.x.round !== null  &&  obj.x.type === 'datetime') {
		roundX = 'dateadd(' + obj.x.round + ', datediff(' + obj.x.round + ', 0, ' + obj.x.sql.idFull + '), 0) as roundX';
		roundYavg = 'avg(y) over(partition by roundX) as roundYavg';
		roundYcount = 'count(y) over(partition by roundX) as roundYcount';
		roundYstdev = 'stdev(y) over(partition by roundX) as roundYstdev';
	} else if (obj.x.round !== null  &&  obj.x.type === 'linear') {
		roundX = obj.x.round + '*round(' + obj.x.sql.idFull + '/' + obj.x.round + ', 0) as roundX';
		roundYavg = 'avg(y) over(partition by roundX) as roundYavg';
		roundYcount = 'count(y) over(partition by roundX) as roundYcount';
		roundYstdev = 'stdev(y) over(partition by roundX) as roundYstdev';
	} else {
		roundX = 'null as roundX';
		roundYavg = 'null as roundYavg';
		roundYcount = 'null as roundYcount';
		roundYstdev = 'null as roundYstdev';
	}

	obj.x.sql.query = mSQL.indent(obj.x.sql.query, '    ');
	obj.y.sql.query = mSQL.indent(obj.y.sql.query, '    ');

	queryMoreFilters = prepareMoreFiltersQuery();
	filter = prepareFilters(obj);

	query =
		'select \n' +
		'  x, y, heat, roundX, ' + roundYavg + ', ' + roundYcount + ', ' + roundYstdev + ' \n' +
		'from( \n' +
		'  select distinct \n' +
		'    ' + x + ', ' + y + ', ' + heat + ', ' + roundX + ' \n' + 
		'  from ' + centralDB + '.' + centralTable + ' ' + centralTable + ' \n' +
		'  ' + obj.x.sql.joinType + '( \n' +
		obj.x.sql.query +
		'  ) subX \n' +
		'    on bop_ht.ht_num = subX.ht_num \n' +
		'      and bop_ht.tap_yr = subX.tap_yr \n' +
		'  ' + obj.y.sql.joinType + '( \n' +
		obj.y.sql.query +
		'  ) subY \n' +
		'    on bop_ht.ht_num = subY.ht_num \n' +
		'      and bop_ht.tap_yr = subY.tap_yr \n' +
		queryMoreFilters +
		'  where ' + mMaster.sql.filterDate +
		filter +
		') sub \n' +
		'where \n' +
		'  x is not null \n' +
		'  and y is not null \n' +
		'order by x asc';

	return query;


	function prepareMoreFiltersQuery() {
		var query, centralTable, subName;
		var joinKeyArray = [];
		query = centralTable = subName = '';

		joinKeyArray = mMaster.x.sql.joinKeyArray;
		centralTable = mMaster.x.sql.centralTable;

		$.each(mMoreFilters.eachFilter, function( index, value ) {
			subName = value.sql.subName;
			query += value.sql.joinType + '( \n' +
				mSQL.indent(value.sql.query, '  ') +
				') ' + value.sql.subName + ' \n' +
				mSQL.createJoinOn(joinKeyArray, centralTable, subName);
		});

		query = mSQL.indent(query, '  ');
		return query;
	}


	function prepareFilters(obj) {
		var bigFilter = '';



		bigFilter = 
			prefixAnd( obj.x.sql.filter ) +
			prefixAnd( prefixSubName(obj.x.sql.subName, obj.x.sql.filterRealistic) ) +
			prefixAnd( obj.y.sql.filter ) +
			prefixAnd( prefixSubName(obj.y.sql.subName, obj.y.sql.filterRealistic) ) +
			prefixAnd( prefixSubName(mMaster.x.sql.centralTable, mMaster.sql.filterGrade) );


		$.each(mMoreFilters.eachFilter, function( index, value ) {
			bigFilter += prefixAnd(value.sql.filter);
			bigFilter += prefixAnd( prefixSubName(value.sql.subName, value.sql.filterRealistic) );
		});

		bigFilter = mSQL.indent(bigFilter, '    ');

		return bigFilter;


		function prefixSubName(subName, filter) {
			if (filter !== '') {
				filter = subName + '.' + filter;
			}

			return filter;
		}

		function prefixAnd(filter) {
			if (filter !== '') {
				filter = 'and ' + filter;
			}

			return filter;
		}
	}
};



mSQL.subQueryBuild = function(idFull, filterGlobal, queryDepth) {
	'use strict';
	if (queryDepth === undefined) { queryDepth = 1; } else { queryDepth += 1; }
	var query, subQuery, selectPrefix, field, filter, subName, idMain, joinType, joinOn;
	query = subQuery = selectPrefix = field = filter = subName = idMain = joinType = joinOn = '';
	var subFields = [], filterRealisticArray = [], params = [], paramsNames = [], idSplit = [];
	var calcField = null;
	var obj = {}, sql = {};
	var select = null;

	// Clean up and separate.
	idSplit = idFull.fieldWrapDelete().split(' ');
	// The actual id is only the first "word."
	idMain = idSplit[0];
	params = [];
	$.each(idSplit, function( index, value ) {
		if (index > 0) {
			params.push(value);
		}
	});
	paramsNames = params;

	obj = getDefinitions(idMain, params, paramsNames);
	field = obj.sql.field;
	if (obj.sql.selectDistinct) { select = 'select distinct'; } else { select = 'select'; }

	subFields = field.fieldWrapToArray();
	if (subFields.length > 0) { calcField = true; } else { calcField = false; }

	if ( (queryDepth === 1)  &&  (calcField === false) ) {
		subName = null;
		selectPrefix = mSQL.createSelectPrefix(obj.sql.joinKeyArray, subName);
		query = select + ' ' + selectPrefix + ', ' + obj.sql.field + ' as ' + idFull + ' \n' +
						'from ' + obj.sql.db + '.' + obj.sql.table + ' \n' +
						'where ' + filterGlobal;

		if (obj.sql.filterLocal !== '') {
			query += obj.sql.filterLocal;
		}

	} else if (calcField === true) {
		subName = 'sub1';
		selectPrefix = mSQL.createSelectPrefix(obj.sql.joinKeyArray, subName);
		query = select + ' ' + selectPrefix + ', ' + obj.sql.field + ' as ' + idFull + ' \n' +
						'from( \n';

		sql = obj.sql;  // Temporarily store obj.sql so that it can be reset after handing subqueries in the $.each() loop below.

		$.each(subFields, function( index, idFull ) {
			// Clean up and separate.
			idSplit = idFull.fieldWrapDelete().split(' ');
			// The actual id is only the first "word."
			idMain = idSplit[0];
			params = [];
			$.each(idSplit, function( index, value ) {
				if (index > 0) {
					params.push(value);
				}
			});
			paramsNames = params;	
			subName = 'sub' + (index + 1);

			obj = getDefinitions( idMain, params, null );

			subQuery = mSQL.subQueryBuild(idFull, filterGlobal, queryDepth).sql.query;
			subQuery = mSQL.indent(subQuery, '  ');

			if (index === 0) {
				joinType = '';
				joinOn = '';
			} else {
				joinType = obj.sql.joinType + '( \n'; 
				joinOn = mSQL.createJoinOn(obj.sql.joinKeyArray, 'sub1', subName);
			}


			filterRealisticArray.push(obj.sql.filterRealistic);


			query +=
				joinType +
				subQuery +
				') ' + subName + ' \n' +
				joinOn;
		});

		$.each(filterRealisticArray, function(index, value) {
			subName = 'sub' + (index + 1);
			if (value.length > 0) {
				if (filter.substr(0, 5) !== 'where') {
					filter +=
						'where \n' +
						'  ';
				} else {
					filter += '  and ';
				}
				filter += subName + '.' + value;
			}
			
		});

		obj.sql = sql;  // Restore obj.sql
		query += filter;

	} else if ( (queryDepth > 1)  &&  (calcField === false) ) {
		subName = null;
		selectPrefix = mSQL.createSelectPrefix(obj.sql.joinKeyArray, subName);
		query = select + ' ' + selectPrefix + ', ' + obj.sql.field + ' as ' + idFull + ' \n' +
						'from ' + obj.sql.db + '.' + obj.sql.table + ' \n' +
						'where ' + filterGlobal;

		if (obj.sql.filterLocal !== '') {
			query += obj.sql.filterLocal;
		}
	}


	obj.sql.query = query;

	return obj;
};



mSQL.createSelectPrefix = function(joinKeyArray, table) {
	'juse strict';
	var selectPrefix = '';

	if (joinKeyArray.length === 0) { return selectPrefix; }

	$.each(joinKeyArray, function( index, value ) {
		if (table === null) {
			selectPrefix += value;
		} else {
			selectPrefix += table + '.' + value;
		}
		if ( index !== (joinKeyArray.length - 1) ) { selectPrefix += ', '; }
	});
	return selectPrefix;
};



mSQL.createJoinOn = function(joinKeyArray, subNameMain, subNameThis) {
	'use strict';
	var joinOn = '';

	if (joinKeyArray.length === 0) { return joinOn; }

	joinOn += '  on ';
	$.each(joinKeyArray, function( index, value ) {
		if (index > 0) { joinOn += '    and '; }
		joinOn += subNameMain + '.' + value + ' = ' + subNameThis + '.' + value + ' \n';
	});

	return joinOn;
};



mSQL.indent = function(str, indent) {
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
};



mSQL.createSingleFilter = function(subName, idFull, operator, input1, input2, joinType) {
	'use strict';
	var filter = '';

	if (joinType === 'left outer join') {
		idFull = 'isNull(' + subName + '.' + idFull + ', 0)';
	} else {
		idFull = subName + '.' + idFull;
	}

	switch (operator) {
		case null:
			filter = '';
			if ( (input1)  &&  (input2) ) {
				filter = idFull + ' between \'' + input1 + '\' and \'' + input2 + '\' \n';
			} else if (input1) {
				filter = idFull + ' >= \'' + input1 + '\' \n';
			} else if (input2) {
				filter = idFull + ' <= \'' + input2 + '\' \n';
			} else {
				filter = '';
			}
			break;
		case 'between':
			filter = idFull + ' between \'' + input1 + '\' and \'' + input2 + '\' \n';
			break;
		case 'notBetween':
			filter = idFull + ' not between \'' + input1 + '\' and \'' + input2 + '\' \n';
			break;
		case '>':
			filter = idFull + ' > \'' + input1 + '\' \n';
			break;
		case '<':
			filter = idFull + ' < \'' + input1 + '\' \n';
			break;
		case '>=':
			filter = idFull + ' >= \'' + input1 + '\' \n';
			break;
		case '<=':
			filter = idFull + ' <= \'' + input1 + '\' \n';
			break;
		case '=':
			filter = idFull + ' = \'' + input1 + '\' \n';
			break;
		case '!=':
			filter = idFull + ' != \'' + input1 + '\' \n';
			break;
		default:
			break;
	}


	return filter;
};