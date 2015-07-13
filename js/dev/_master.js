//================================================================
//===  _master.js  ============================================
//=========================================================

foo();
function foo() {

}


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

var mMoreFilters = {};

var mChart = {};




$(document).ready( function() {
	mOptions.init();
	mMoreFilters.init();
});



mMaster.submitHandle = function() {
	g.error = false;

	// Validate modules
	mOptions.validate();
	mMoreFilters.validate();
	if (g.error === true) {
		return false;
	}

	// Prepare modules
	mMaster.prepareModuleOptions();
	mMaster.prepareModuleMoreFilters();

	// mMaster.createMainQuery();
	mMaster.sql.mainQuery = mSQL.mainQueryBuild(mMaster);
	console.log(mMaster.sql.mainQuery);
	console.log(mMaster);

	// mSQL.runQuery(mMaster.sql.mainQuery);
	
	// console.log(mMaster.y.sql.filterRealistic);
	// console.log(mMaster.y.sql.filterRealisticArray);
	// console.log(mMaster.y.sql.query);
	// console.log(mMaster.sql.mainQuery);
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

			var filter = mSQL.createSingleFilter(subName, idFull, operator, input1, input2, joinType);

			return filter;
		}
	}

	function createSubQueries() {
		var obj = {};

		$.each(mMoreFilters.eachFilter, function( index, value ) {
			obj = mSQL.subQueryBuild(value.sql.idFull, mMaster.sql.filterGlobal);
			mMoreFilters.eachFilter[index].sql.query = obj.sql.query;
		});

		// obj = mSQL.subQueryBuild(mMaster.x.sql.idFull, mMaster.sql.filterGlobal);
		// mMaster.x.sql = $.extend(true, {}, mMaster.x.sql, obj.sql);
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


		if (mMaster.tapGrade !== '') {
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








