//================================================================
//===  _master.js  ============================================
//=========================================================


var mMaster = {
	sql: {},
	x: {
		target: '#options-x',
		sql: {
			subName: 'subX'
		}
	},
	y: {
		target: '#options-y',
		sql: {
			subName: 'subY'
		}
	},
	moreFilters: {
		eachFilter: [],
		sql: {}
	}
};

var mSQL = {};
var mOptions = {};
var mUpdateAxes = {};
var mUpdateSeries = {};
var mMoreFilters = {};
var mChart = {};



$(document).ready( function() {
	mOptions.init();
	mUpdateAxes.start();
	mUpdateSeries.start();
	mMoreFilters.init();
});





mMaster.submitHandle = function() {
	'use strict';
	var query, type;

	
	query = type = '';
	g.error = false;

	// Validate modules
	mOptions.validate();
	mMoreFilters.validate();
	if (g.error === true) {
		mOptions.toggleSubmitBtn('enable');
		return false;
	}

	// Prepare modules
	mMaster.prepareModuleOptions();
	mMaster.prepareModuleMoreFilters();

	// Build the query.
	mMaster.sql.mainQuery = mSQL.mainQueryBuild(mMaster);

	// Run the query.
	query = mMaster.sql.mainQuery;
	type = mMaster.x.type;
	mSQL.runQuery(query, type);
	

	return true;
};



mMaster.prepareModuleMoreFilters = function() {
	'use strict';

	mMoreFilters.getFromDOM();

	createFilters();

	createSubQueries();

	mMaster.moreFilters = mMoreFilters;


	function createFilters() {
		$.each(mMoreFilters.eachFilter, function( index, value ) {
			mMoreFilters.eachFilter[index].sql.filter = get(value);
		});

		function get(obj) {
			var subName = obj.sql.subName;
			var idFull = obj.sql.idFull;
			var operator = obj.operator;
			var input1 = $(obj.target + ' .input1').val();
			var input2 = $(obj.target + ' .input2').val();
			var joinType = obj.sql.joinType;
			var filter = '';

			if (obj.disableOperator === false) {
				filter = mSQL.createSingleFilter(subName, idFull, operator, input1, input2, joinType);
			}

			return filter;
		}
	}

	function createSubQueries() {
		var obj = {};

		$.each(mMoreFilters.eachFilter, function( index, value ) {
			obj = mSQL.subQueryBuild(value.sql.idFull, mMaster.sql.filterGlobal);
			mMoreFilters.eachFilter[index].sql.query = obj.sql.query;
		});
	}
};



mMaster.prepareModuleOptions = function() {
	'use strict';

	$.extend(mMaster, mOptions.getFromDOM());

	filters();

	subQueries();


	return true;


	function filters() {
		var centralTable = mMaster.x.sql.centralTable;
		var centralDate = mMaster.x.sql.centralTableDate;
		var timeMin = mMaster.timeMin;
		var timeMax = mMaster.timeMax;
		mMaster.x.sql.filter = createFilter(mMaster.x);
		mMaster.y.sql.filter = createFilter(mMaster.y);
		mMaster.sql.filterDate = mSQL.createSingleFilter(centralTable, centralDate, null, timeMin, timeMax, null);

		var tap_yr = timeMin.substr(timeMin.length - 2);
		mMaster.sql.filterGlobal = 'tap_yr >= \'' + tap_yr + '\' \n';


		if (mMaster.tapGrade) {
			mMaster.sql.filterGrade = 'tap_grd like \'' + mMaster.tapGrade + '\' \n';
		} else {
			mMaster.sql.filterGrade = '';
		}


		function createFilter(obj) {
			var subName = obj.sql.subName;
			var idFull = obj.sql.idFull;
			var operator = null;
			var input1 = $(obj.target + " .min").val();
			var input2 = $(obj.target + " .max").val();
			var joinType = obj.sql.joinType;

			var filter = mSQL.createSingleFilter(subName, idFull, operator, input1, input2, joinType);

			return filter;
		}
	}


	function subQueries() {
		var obj = {};

		obj = mSQL.subQueryBuild(mMaster.x.sql.idFull, mMaster.sql.filterGlobal);
		mMaster.x.sql = $.extend(true, {}, mMaster.x.sql, obj.sql);

		obj = mSQL.subQueryBuild(mMaster.y.sql.idFull, mMaster.sql.filterGlobal);
		mMaster.y.sql = $.extend(true, {}, mMaster.y.sql, obj.sql);
	}

};



mMaster.createSubQueries = function() {
	var obj = {};

	obj = mSQL.subQueryBuild(mMaster.x.sql.idFull, mMaster.sql.filterGlobal);
	mMaster.x.sql = $.extend(true, {}, mMaster.x.sql, obj.sql);

	obj = mSQL.subQueryBuild(mMaster.y.sql.idFull, mMaster.sql.filterGlobal);
	mMaster.y.sql = $.extend(true, {}, mMaster.y.sql, obj.sql);
};



mMaster.createOptionsFilters = function(obj) {
	var centralTable = mMaster.x.sql.centralTable;
	var centralDate = mMaster.x.sql.centralTableDate;
	var timeMin = mMaster.timeMin;
	var timeMax = mMaster.timeMax;
	mMaster.x.sql.filter = get(mMaster.x);
	mMaster.y.sql.filter = get(mMaster.y);
	mMaster.sql.filterDate = mSQL.createSingleFilter(centralTable, centralDate, null, timeMin, timeMax, null);

	var tap_yr = timeMin.substr(timeMin.length - 2);
	mMaster.sql.filterGlobal = 'tap_yr >= \'' + tap_yr + '\' \n';


	function get(obj) {
		var subName = obj.sql.subName;
		var idFull = obj.sql.idFull;
		var operator = null;
		var input1 = $(obj.target + " .min").val();
		var input2 = $(obj.target + " .max").val();
		var joinType = obj.sql.joinType;

		var filter = mSQL.createSingleFilter(subName, idFull, operator, input1, input2, joinType);

		return filter;
	}


};




mMaster.queryResultsHandle = function(results, type) {
	var data = {};
	
	data = formatResults(results, type);

	mChart.display(data, mMaster);


	function formatResults(results, type) {
		var rowPrev = [];
		var x, y, heatID, roundX, roundY, roundYcount, roundYstdev;
		x = y = heatID = roundX = roundY = roundYcount = roundYstdev = '';
		var data = {
			heats: [],
			averages: []
		};


		$.each(results, function( index, row ) {

			rowPrev = [];
			if (index > 0) {
				rowPrev = results[index-1];
			}

			if (type === 'datetime') {
				x = Date.parse(row[0]);
				roundX = Date.parse(row[3]);
			} else {
				x = parseFloat(row[0], 4);  //Fix Bug: Decimals showing as strings.
				roundX = parseFloat(row[3], 4);  //Fix Bug: Decimals showing as strings.
			}

			y = parseFloat(row[1], 4);  //Fix Bug: Decimals showing as strings.
			heatID = row[2];
			roundY = parseFloat(row[4], 4);  //Fix Bug: Decimals showing as strings.
			roundYcount = row[5];
			roundYstdev = parseFloat(row[6], 1);  //Fix Bug: Decimals showing as strings.

			data.heats.push( { x: x, y: y, info: heatID } );

			if ($.isNumeric(roundX)) {
				if (index === 0) {
					data.averages.push( { x: roundX, y: roundY, info1: roundYcount, info2: roundYstdev } );
				} else if ( (row[3] !== rowPrev[3])  ||  (row[4] !== rowPrev[4]) ) {
					data.averages.push( { x: roundX, y: roundY, info1: roundYcount, info2: roundYstdev } );
				}
			}

		});

		
		return data;
	}


};



