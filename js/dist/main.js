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




//================================================================
//===  chart.js  ==============================================
//==========================================================



mChart.display = function(data, mMaster) {
	$(function () {
		$('#m-graph').highcharts({
			chart: {
				type: 'scatter',
				animation: false,
      	zoomType: 'xy'
			},
			credits: {
        enabled: false
    	},
      exporting: {
      	enabled: false
      },
			title: {
				text: '[' + mMaster.y.title + '] vs [' + mMaster.x.title + ']'
			},
			xAxis: {
				type: mMaster.x.type,
				// dateTimeLabelFormats: { // don't display the dummy year
				// 	month: '%e. %b',
				// 	year: '%b'
				// },
				title: {
					text: mMaster.x.title + ' (' + mMaster.x.unit + ')'
				},
				labels: {
		            format: '{value:' + mMaster.x.format + '}'
			    }
			},
			yAxis: {
				title: {
					text: mMaster.y.title + ' (' + mMaster.y.unit + ')'
				},
				// min: mMaster.y.min,
				// max: mMaster.y.max,
				labels: {
		            format: '{value:' + mMaster.y.format + '}'
			    }
			},
				tooltip: {
				snap: 1,
				headerFormat: '<b>{series.name}</b><br>',
				// pointFormat:
				// 	'y: {point.y:' + mMaster.y.format + '} ' + mMaster.y.unit + '<br>' +
				// 	'x: {point.x:' + mMaster.x.format + '} ' + mMaster.x.unit + '<br>' +
				// 	'Heat: {point.info}'
				formatter: function() {
					if (mMaster.x.type === 'datetime') {
						var text = 'y: ' + Highcharts.numberFormat(this.point.y, mMaster.y.decimals, '.', ',') + ' ' + mMaster.y.unit + '<br>';
						if (this.series.name === 'Heats') {
							text += 'x: ' + Highcharts.dateFormat('%m/%d/%Y %I:%M', this.point.x) + '<br>';
							text +=	'Heat ID: ' + this.point.info;
						} else if (this.series.name.substring(0, 7) === 'Average') {
							text += 'x: ' + Highcharts.dateFormat(mMaster.x.format, this.point.x) + ' (nearest ' + mMaster.x.round + ') <br>';
							text +=	'Heat Count: ' + this.point.info1 + ' <br>';
							text +=	'Std Dev: ' + Highcharts.numberFormat(this.point.info2, mMaster.y.decimals + 1);
						}
					} else {
						var text = 'y: ' + Highcharts.numberFormat(this.point.y, mMaster.y.decimals) + ' ' + mMaster.y.unit + '<br>';
						if (this.series.name === 'Heats') {
							text += 'x: ' + Highcharts.numberFormat(this.point.x, mMaster.x.decimals) + ' ' + mMaster.x.unit + '<br>';
							text +=	'Heat ID: ' + this.point.info;
						} else if (this.series.name.substring(0, 7) === 'Average') {
							text += 'x: ' + Highcharts.numberFormat(this.point.x, mMaster.x.decimals) + ' ' + mMaster.x.unit + ' (nearest ' + mMaster.x.round + ') <br>';
							text +=	'Heat Count: ' + this.point.info1 + ' <br>';
							text +=	'Std Dev: ' + Highcharts.numberFormat(this.point.info2, mMaster.y.decimals + 1);
						}
					}


					return text;
				}
			},

			plotOptions: {
				spline: {
					marker: {
						enabled: true
					}
				},
				series: {
					turboThreshold: g.maxRows
				}
			},
			line: {
				visible: false
			},

			series: [
				{
					name: 'Heats',
					color: 'rgba(79,129,189,0.4)',
					data: data.heats,
					stickyTracking: false,
					regression: false,
					regressionSettings: {
						type: 'linear',
						color:  'rgba(0, 0, 0, 0.8)'
					}
				},
				{
					name: 'Average (nearest ' + mMaster.x.round + ')',
					color: 'rgba(192,80,77,1.0)',
					marker: {
						radius: 8,
						symbol: 'circle'
					},
					data: data.averages
				}
			]
		});
	});





		

};



//================================================================
//===  definitions.js  ========================================
//==========================================================


function toggleSulfurLock(idMain, target) {
	// Changes the element to "S" and prevents the user from changing it.

	var sulfurLockTests = ['BtlAvg', 'DsfStartLeco', 'DsfInit', 'DsfFinal', 'AimDesulf'];
	var lockSulfur = false;

	if (idMain === 'Chem') {
		test1 = $(target + ' .select1').val();
		testArray = [ test1 ];
		elem = $(target + ' .select2');
	} else if (idMain === 'ChemDiff') {
		test1 = $(target + ' .select1').val();
		test2 = $(target + ' .select2').val();
		testArray = [ test1, test2 ];
		elem = $(target + ' .select3');
	} else {
		return false;
	}

	$.each(testArray, function( index, value ) {
		if (jQuery.inArray(value, sulfurLockTests) !== -1) {
			lockSulfur = true;
		}
	});
	
	if (lockSulfur) {
		elem.val('S');
		elem.prop('disabled', true);
	} else {
		elem.prop('disabled', false);
	}

	return lockSulfur;
}




function getDefinitions(idMain, params, paramsNames) {
	'use strict';

	var obj = {
		sql: {}
	};

	
	obj.sql.centralTable = 'bop_ht';
	obj.sql.centralDB = 'USSGLW.dbo';
	obj.sql.centralTableHeat = 'ht_num';
	obj.sql.centralTableDate = 'tap_st_dt';
	obj.sql.joinKeyArray = ['ht_num', 'tap_yr'];
	

	if (params === null) {
		params = ['', '', '', '', ''];
	}
	if (paramsNames === null) {
		paramsNames = ['', '', '', '', ''];
	}




	switch (idMain) {
		case 'Chem':
			var test = params[0];
			var elem = params[1];
			obj.sql.idFull = (idMain + ' ' + test + ' ' + elem).fieldWrapAdd();
			switch (test) {
				case 'BtlAvg':
					elem = 'S';
					obj.sql.idFull = (idMain + ' ' + test + ' ' + elem).fieldWrapAdd();
					obj.sql.field	= 'dslf_avg_btl_S';
					obj.sql.table	= 'bop_ht';
					break;
				case 'DsfStartLeco':
					elem = 'S';
					obj.sql.idFull = (idMain + ' ' + test + ' ' + elem).fieldWrapAdd();
					obj.sql.field = 'S_pct';
					obj.sql.table = 'bop_ht_leco';
					obj.sql.filterLocal = '  and test_typ=\'IS\'';
					break;
				case 'DsfInit':
					elem = 'S';
					obj.sql.idFull = (idMain + ' ' + test + ' ' + elem).fieldWrapAdd();
					obj.sql.field = 'dslf_init_S';
					obj.sql.table = 'bop_ht';
					break;
				case 'DsfFinal':
					elem = 'S';
					obj.sql.idFull = (idMain + ' ' + test + ' ' + elem).fieldWrapAdd();
					obj.sql.field = 'dslf_S_after_cycle';
					obj.sql.table = 'bop_ht';
					obj.sql.filterRealistic = obj.sql.idFull + ' < 0.050';
					break;
				case 'AimDesulf':
					elem = 'S';
					obj.sql.idFull = (idMain + ' ' + test + ' ' + elem).fieldWrapAdd();
					obj.sql.field = 'dslf_calc_aim_S';
					obj.sql.table = 'bop_ht';
					break;
				case 'AimBOP':
					obj.sql.field = 'mdl_aim_pct';
					obj.sql.table = 'bop_chem_rec';
					obj.sql.db = 'Alloy_Model.dbo';
					obj.sql.filterLocal =
						'  and fac_id not like \'%S\' \n' +
						'  and fac_id not like \'%T\' \n' +
						'  and elem_cd = \'' + elem.fieldWrapDelete().toUpperCase() + '\' \n' +
						'  and mdl_run_seq_num = ( \n' +  //This line (and the following 5) makes the query take only the last model run for each heat.
						'    select max(mdl_run_seq_num) \n' +
				    '    from Alloy_Model.dbo.bop_chem_rec as f \n' +
				    '    where f.ht_num = bop_chem_rec.ht_num \n' +
				    '      and f.tap_yr = bop_chem_rec.tap_yr \n' +
  					'  )';
					break;
				case 'MinRef':
					obj.sql.field = 'min_pct';
					obj.sql.table = 'ht_ref_chem_mod';
					obj.sql.filterLocal =
						'  and elem_cd = \'' + elem.fieldWrapDelete().toUpperCase() + '\'';
					break;
				case 'MaxRef':
					obj.sql.field = 'max_pct';
					obj.sql.table = 'ht_ref_chem_mod';
					obj.sql.filterLocal =
						'  and elem_cd = \'' + elem.fieldWrapDelete().toUpperCase() + '\'';
					break;
				case 'StartBOP':
					obj.sql.field = 'mdl_start_pct';
					obj.sql.table = 'bop_chem_rec';
					obj.sql.db = 'Alloy_Model.dbo';
					obj.sql.filterLocal =
						'  and fac_id not like \'%S\' \n' +
						'  and fac_id not like \'%T\' \n' +
						'  and elem_cd = \'' + elem.fieldWrapDelete().toUpperCase() + '\' \n' +
						'  and mdl_run_seq_num = ( \n' +  //This line (and the following 5) makes the query take only the last model run for each heat.
				    '    select max(mdl_run_seq_num) \n' +
				    '    from Alloy_Model.dbo.bop_chem_rec as f \n' +
				    '    where f.ht_num = bop_chem_rec.ht_num \n' +
				    '      and f.tap_yr = bop_chem_rec.tap_yr \n' +
  					'  )';
					break;
				case 'FinalBOP':
					obj.sql.field = 'pred_final_pct';
					obj.sql.table = 'bop_chem_rec';
					obj.sql.db = 'Alloy_Model.dbo';
					obj.sql.filterLocal =
						'  and fac_id not like \'%S\' \n' +
						'  and fac_id not like \'%T\' \n' +
						'  and elem_cd = \'' + elem.fieldWrapDelete().toUpperCase() + '\' \n' +
						'  and mdl_run_seq_num = ( \n' +  //This line (and the following 5) makes the query take only the last model run for each heat.
				    '    select max(mdl_run_seq_num) \n' +
				    '    from Alloy_Model.dbo.bop_chem_rec as f \n' +
				    '    where f.ht_num = bop_chem_rec.ht_num \n' +
				    '      and f.tap_yr = bop_chem_rec.tap_yr \n' +
  					'  )';
					break;
				case 'AimAr':
					obj.sql.field = 'mdl_aim_pct';
					obj.sql.table = 'ars_chem_rec';
					obj.sql.db = 'Alloy_Model.dbo';
					obj.sql.filterLocal =
						'  and fac_id not like \'%S\' \n' +
						'  and fac_id not like \'%T\' \n' +
						'  and elem_cd = \'' + elem.fieldWrapDelete().toUpperCase() + '\' \n' +
						'  and mdl_run_seq_num = ( \n' +  //This line (and the following 5) makes the query take only the last model run for each heat.
				    '    select max(mdl_run_seq_num) \n' +
				    '    from Alloy_Model.dbo.bop_chem_rec as f \n' +
				    '    where f.ht_num = bop_chem_rec.ht_num \n' +
				    '      and f.tap_yr = bop_chem_rec.tap_yr \n' +
  					'  )';
					break;
				default:
					obj.sql.field = 'elem_pct';
					obj.sql.table = 'ms_ht_chem_samp_anal';
					obj.sql.filterLocal =
						'  and test_id like \'' + test + '\' \n' +
						'  and elem_cd = \'' + elem.fieldWrapDelete().toUpperCase() + '\' ';
					break;
			}
			obj.sql.idFull = (idMain + ' ' + test + ' ' + elem).fieldWrapAdd();
			obj.title	= idMain + ' ' + elem + ': ' + paramsNames[0];
			obj.unit = '%';
			obj.format = '.4f';
			obj.decimals = 4;
			break;
		case 'ChemDiff':
			var test1 = params[0];
			var test2	= params[1];
			var elem = params[2];
			obj.sql.idFull = (idMain + ' ' + test1 + ' ' + test2 + ' ' + elem).fieldWrapAdd();
			obj.title	= idMain + ' ' + paramsNames[2] + ': ' + paramsNames[0] + ' - ' + paramsNames[1];
			obj.unit = '%';
			obj.format = '.4f';
			obj.decimals = 4;
			obj.sql.field = ('Chem ' + test1 + ' ' + elem.toUpperCase()).fieldWrapAdd() + ' - ' + ('Chem ' + test2 + ' ' + elem.toUpperCase()).fieldWrapAdd();
			break;
		case 'SlagChem':
			var elem = params[0]
			var elemTitle = paramsNames[0]
			obj.sql.idFull = (idMain + ' ' + elem).fieldWrapAdd();
			obj.title = idMain + ' ' + elemTitle;
			obj.unit = '%';
			obj.format = '.2f';
			obj.decimals = 2;
			obj.sql.field = elem;
			obj.sql.table = 'bop_ht_slag_chem';
			break;
		case 'BOPFurnaceAdd':
			var type 	= params[0];
			obj.sql.table = 'bop_ht_chrg_mdl_data';
			switch (type) {
				case 'TotalChargeActual':
					obj.sql.field = 
						'case \n ' +
						'  when calc_dt < \'4/1/2014\' then tot_chrg_tons * 2000 \n ' +
						'  else tot_chrg_tons * 1000 \n ' +
						'end ';  //Fix for when field was in tons instead of thousands of lbs.
					obj.sql.filterLocal = '  and last_calc_flg = \'O\'';
					break;
				case 'MetalActual':
					obj.sql.field = 
						'case \n ' +
						'  when calc_dt < \'4/1/2014\' then tot_hm_chrg_tons * 2000 \n ' +
						'  else tot_hm_chrg_tons * 1000 \n ' +
						'end ';  //Fix for when field was in tons instead of thousands of lbs.
					obj.sql.filterLocal = '  and last_calc_flg = \'O\'';
					break;
				case 'ScrapActual':
					obj.sql.field = 
						'case \n ' +
						'  when calc_dt < \'4/1/2014\' then tot_scrap_chrg_tons * 2000 \n ' +
						'  else tot_scrap_chrg_tons * 1000 \n ' +
						'end ';  //Fix for when field was in tons instead of thousands of lbs.
					obj.sql.filterLocal = '  and last_calc_flg = \'O\'';
					break;
				case 'MiscActual':
					obj.sql.field = 
						'case \n ' +
						'  when calc_dt < \'4/1/2014\' then tot_misc_tons * 2000 \n ' +
						'  else tot_misc_tons * 1000 \n ' +
						'end ';  //Fix for when field was in tons instead of thousands of lbs.
					obj.sql.filterLocal = '  and last_calc_flg = \'O\'';
					break;
				case 'MetalPctActual':
					obj.sql.field = 'hm_pct';
					obj.sql.filterLocal = '  and last_calc_flg = \'O\'';
					break;
				case 'ScrapPctActual':
					obj.sql.field = 'scrap_pct';
					obj.sql.filterLocal = '  and last_calc_flg = \'O\'';
					break;
				case 'TotalChargeModel':
					obj.sql.field = 
						'case \n ' +
						'  when calc_dt < \'4/1/2014\' then tot_chrg_tons * 2000 \n ' +
						'  else tot_chrg_tons * 1000 \n ' +
						'end ';  //Fix for when field was in tons instead of thousands of lbs.
					obj.sql.filterLocal = '  and last_calc_flg = \'P\'';
					break;
				case 'MetalModel':
					obj.sql.field = 
						'case \n ' +
						'  when calc_dt < \'4/1/2014\' then tot_hm_chrg_tons * 2000 \n ' +
						'  else tot_hm_chrg_tons * 1000 \n ' +
						'end ';  //Fix for when field was in tons instead of thousands of lbs.
					obj.sql.filterLocal = '  and last_calc_flg = \'P\'';
					break;
				case 'ScrapModel':
					obj.sql.field = 
						'case \n ' +
						'  when calc_dt < \'4/1/2014\' then tot_scrap_chrg_tons * 2000 \n ' +
						'  else tot_scrap_chrg_tons * 1000 \n ' +
						'end ';  //Fix for when field was in tons instead of thousands of lbs.
					obj.sql.filterLocal = '  and last_calc_flg = \'P\'';
					break;
				case 'MiscModel':
					obj.sql.field = 
						'case \n ' +
						'  when calc_dt < \'4/1/2014\' then tot_misc_tons * 2000 \n ' +
						'  else tot_misc_tons * 1000 \n ' +
						'end ';  //Fix for when field was in tons instead of thousands of lbs.
					obj.sql.filterLocal = '  and last_calc_flg = \'P\'';
					break;
				case 'MetalPctModel':
					obj.sql.field = 'hm_pct';
					obj.sql.filterLocal = '  and last_calc_flg = \'P\'';
					break;
				case 'ScrapPctModel':
					obj.sql.field = 'scrap_pct';
					obj.sql.filterLocal = '  and last_calc_flg = \'P\'';
					break;
				default:
					break;
			}
			obj.sql.idFull = (idMain + ' ' + type).fieldWrapAdd();
			obj.title	= idMain + ': ' + paramsNames[0];
			obj.unit = 'lb';
			obj.sql.joinType = 'left outer join';
			break;
		case 'BOPLadleAdd':
			var matCode = params[0];
			obj.sql.idFull = (idMain + ' ' + matCode).fieldWrapAdd();
			obj.title	= idMain + ' ' + paramsNames[0];
			obj.unit = 'lb';
			obj.sql.field = 'act_wt';
			obj.sql.table = 'bop_ht_mat_add';
			obj.sql.filterLocal = '  and mat_cd = \'' + matCode + '\'';
			obj.sql.joinType = 'left outer join';
			break;
		case 'BOPScrap':
			var matCode = params[0];
			obj.sql.idFull = (idMain + ' ' + matCode).fieldWrapAdd();
			obj.title = idMain + ' ' + paramsNames[0];
			obj.unit = 'lb';
			obj.sql.field = 'act_wt';
			obj.sql.table = 'bop_ht_scrap_add';
			obj.sql.filterLocal = '  and scrp_cd = \'' + matCode + '\'';
			obj.sql.joinType = 'left outer join';
			break;
		case 'Temp':
			var test = params[0];
			obj.title = idMain + ' ' + paramsNames[0];
			obj.unit = '°F';
			obj.sql.idFull = (idMain + ' ' + test).fieldWrapAdd();
			switch (test) {
				case 'HMLadle':
					obj.sql.field = 'hm_ldl_act_tp';
					obj.sql.table = 'bop_ht';
					obj.sql.filterRealistic = obj.sql.idFull + ' > 2000 ';
					break;
				case 'Tap':
					obj.sql.field = 'tap_tp';
					obj.sql.table = 'bop_ht';
					obj.sql.filterRealistic = obj.sql.idFull + ' > 2800 ';
					break;
				case 'TOL':
					obj.sql.field = 'TOL_tp';
					obj.sql.table = 'bop_ht';
					obj.sql.filterRealistic = obj.sql.idFull + ' > 2800 ';
					break;
				case 'ArArrive':
					obj.sql.field = 'samp_tp';
					obj.sql.table = 'ms_heat_celox';
					obj.sql.filterLocal =
						'  and fac_id = \'A\' \n' +
						'  and samp_designation = \'ARV\' ';
					obj.sql.filterRealistic = obj.sql.idFull + ' > 2800 ';
					break;
				case 'ArLeave':
					obj.sql.field = 'samp_tp';
					obj.sql.table = 'ms_heat_celox';
					obj.sql.filterLocal =
						'  and fac_id = \'A\' \n' +
						'  and samp_designation = \'LV\' ';
					obj.sql.filterRealistic = obj.sql.idFull + ' > 2800 ';
					break;
				case 'RHArrive':
					obj.sql.field = 'samp_tp';
					obj.sql.table = 'ms_heat_celox';
					obj.sql.filterLocal =
						'  and fac_id = \'V\' \n' +
						'  and samp_designation = \'ARV\' ';
					obj.sql.filterRealistic = obj.sql.idFull + ' > 2800 ';
					break;
				case 'RHDeox':
					obj.sql.field = 'samp_tp';
					obj.sql.table = 'ms_heat_celox';
					obj.sql.filterLocal =
						'  and fac_id = \'V\' \n' +
						'  and samp_designation = \'DX\' ';
					obj.sql.filterRealistic = obj.sql.idFull + ' > 2800 ';
					break;
				case 'RHLeave':
					obj.sql.field = 'samp_tp';
					obj.sql.table = 'ms_heat_celox';
					obj.sql.filterLocal =
						'  and fac_id = \'V\' \n' +
						'  and samp_designation = \'LV\' ';
					obj.sql.filterRealistic = obj.sql.idFull + ' > 2800 ';
					break;
				case 'CT1':
					obj.sql.field = 'samp_tp';
					obj.sql.table = 'ms_heat_celox';
					obj.sql.filterLocal =
						'  and fac_id = \'C\' \n' +
						'  and samp_designation = \'CT1\' ';
					obj.sql.filterRealistic = obj.sql.idFull + ' > 2800 ';
					break;
				case 'CT2':
					obj.sql.field = 'samp_tp';
					obj.sql.table = 'ms_heat_celox';
					obj.sql.filterLocal =
						'  and fac_id = \'C\' \n' +
						'  and samp_designation = \'CT2\' ';
					obj.sql.filterRealistic = obj.sql.idFull + ' > 2800 ';
					break;
				case 'CT3':
					obj.sql.field = 'samp_tp';
					obj.sql.table = 'ms_heat_celox';
					obj.sql.filterLocal =
						'  and fac_id = \'C\' \n' +
						'  and samp_designation = \'CT3\' ';
					obj.sql.filterRealistic = obj.sql.idFull + ' > 2800 ';
					break;
				case 'AimMelter':
					obj.sql.field 	= 'melter_aim_tap_tp';
					obj.sql.table 	= 'bop_ht';
					obj.sql.filterRealistic = obj.sql.idFull + ' > 2800 ';
					break;
				case 'AimCharge':
					obj.sql.field 	= 'mdl_aim_tap_tp';
					obj.sql.table 	= 'bop_ht';
					obj.sql.filterRealistic = obj.sql.idFull + ' > 2800 ';
					break;
				default:
					break;
			}
			break;
		case 'TempDiff':
			var test1 	= params[0];
			var test2 	= params[1];
			obj.sql.idFull 	= (idMain + ' ' + test1 + ' ' + test2).fieldWrapAdd();
			obj.title		= idMain + ': ' + paramsNames[0] + ' - ' + paramsNames[1];
			obj.unit		= '°F';
			obj.sql.field 	= ('Temp ' + test1).fieldWrapAdd() + ' - ' + ('Temp ' + test2).fieldWrapAdd();
			break;
		case 'Celox':
			var test 		= params[0];
			obj.title 	= idMain + ' ' + paramsNames[0];
			obj.unit 		= 'ppm';
			obj.sql.field = 'samp_oxy';
			obj.sql.table = 'ms_heat_celox';
			obj.sql.idFull 	= (idMain + ' ' + test).fieldWrapAdd();
			switch (test) {
				case 'TapO2':
					obj.sql.field 	= 'tap_oxy';
					obj.sql.table 	= 'bop_ht';
					obj.sql.filterRealistic = obj.sql.idFull + ' between 1 and 1600 ';
					break;
				case 'BTO':
					obj.sql.filterLocal =
						'  and fac_id = \'B\' \n' +
						'  and samp_designation = \'BTO\' ';
					obj.sql.filterRealistic = obj.sql.idFull + ' > 0 ';
					break;
				case 'ArArrive':
					obj.format 	= '.1f';
					obj.decimals = 1;
					obj.sql.field 	= 'samp_oxy_dec';
					obj.sql.filterLocal =
						'  and fac_id = \'A\' \n' +
						'  and samp_designation = \'ARV\' ';
					obj.sql.filterRealistic = obj.sql.idFull + ' between 0.1 and 100 ';
					break;
				case 'ArLeave':
					obj.format 	= '.1f';
					obj.decimals = 1;
					obj.sql.field 	= 'samp_oxy_dec';
					obj.sql.filterLocal =
						'  and fac_id = \'A\' \n' +
						'  and samp_designation = \'LV\' ';
					obj.sql.filterRealistic = obj.sql.idFull + ' between 0.1 and 100 ';
					break;
				case 'RHArrive':
					obj.sql.filterLocal =
						'  and fac_id = \'V\' \n' +
						'  and samp_designation = \'ARV\' ';
					obj.sql.filterRealistic = obj.sql.idFull + ' > 0 ';
					break;
				case 'RHDeox':
					obj.sql.filterLocal =
						'  and fac_id = \'V\' \n' +
						'  and samp_designation = \'DX\' ';
					obj.sql.filterRealistic = obj.sql.idFull + ' > 0 ';
					break;
				case 'RHLeave':
					obj.sql.filterLocal =
						'  and fac_id = \'V\' \n' +
						'  and samp_designation = \'LV\' ';
					obj.sql.filterRealistic = obj.sql.idFull + ' > 0 ';
					break;
				default:
					break;
			}
			break;
		case 'TapDTS':
			obj.sql.idFull 	= (idMain).fieldWrapAdd();
			obj.title 	= 'Tap DTS';
			obj.type 		= 'datetime';
			obj.format 	= '%m/%d/%Y';
			obj.sql.field = 'tap_st_dt';
			obj.sql.table = 'bop_ht';
			break;
		case 'BOPmisc':
			var option 	= params[0];
			switch (option) {
				case 'Mg90':
					obj.sql.idFull 	= (idMain + ' ' + option).fieldWrapAdd();
					obj.title 	= 'Mg90';
					obj.unit 		= 'lbs';
					obj.sql.field 	= 'dslf_act_Mg90_wt';
					obj.sql.table 	= 'bop_ht';
					break;
				case 'Mg90Replunge':
					obj.sql.idFull 	= (idMain + ' ' + option).fieldWrapAdd();
					obj.title 	= 'Mg90 Replunge';
					obj.unit 		= 'lbs';
					obj.sql.field 	= 'dslf_act_rplng_Mg90_wt';
					obj.sql.table 	= 'bop_ht';
					break;
				case 'DsfSkimCrane':
					obj.sql.idFull 	= (idMain + ' ' + option).fieldWrapAdd();
					obj.title 	= 'Desulf Skim (Crane)';
					obj.unit 		= 'lbs';
					obj.sql.field 	= 'hm_skim_loss_wt';
					obj.sql.table 	= 'bop_ht';
					obj.sql.filterLocal = '  and hm_skim_loss_wt_typ = \'C\' ';
					break;
				case 'DsfSkimCalc':
					obj.sql.idFull 	= (idMain + ' ' + option).fieldWrapAdd();
					obj.title 	= 'Desulf Skim (Calc)';
					obj.unit 		= 'lbs';
					obj.sql.field 	= 'hm_skim_loss_wt';
					obj.sql.table 	= 'bop_ht';
					obj.sql.filterLocal = '  and hm_skim_loss_wt_typ = \'P\' ';
					break;
				case 'RecycleWt':
					obj.sql.idFull = (idMain + ' ' + option).fieldWrapAdd();
					obj.title 	= 'Recycled Steel';
					obj.unit 		= 'lbs';
					obj.sql.field 	= 'recycled_wt';
					obj.sql.table 	= 'bop_recycled_ht';
					obj.sql.joinType = 'left outer join';
					break;
				case 'TotalN2Cool':
					obj.sql.idFull = (idMain + ' ' + option).fieldWrapAdd();
					obj.title 	= 'Total N2 Cool Time';
					obj.unit 		= 'seconds';
					obj.sql.selectDistinct = true;
					obj.sql.field 	= 'sum(cool_dur_sec) over(partition by ht_num, tap_yr)';
					obj.sql.table 	= 'bop_ht_coolant';
					obj.sql.joinType = 'left outer join';
					break;
				case 'TapDur':
					obj.sql.idFull = (idMain + ' ' + option).fieldWrapAdd();
					obj.title 	= 'Tap Duration';
					obj.unit 		= 'minutes';
					obj.format 	= '.1f';
					obj.decimals 	= 1;
					obj.sql.field 	= 'tap_dur';
					obj.sql.table 	= 'bop_ht';
					break;
				default:
					break;
			}
			break;
		case 'DegasserMisc':
			var option 	= params[0];
			switch (option) {
				case 'RHSlagDepth':
					obj.sql.idFull = (idMain + ' ' + option).fieldWrapAdd();
					obj.title 	= 'RH Slag Depth';
					obj.unit 		= 'inches';
					obj.sql.field 	= 'meas_slag_dpth';
					obj.sql.table 	= 'degas_ht';
					break;
				case 'RHFreeboard':
					obj.sql.idFull = (idMain + ' ' + option).fieldWrapAdd();
					obj.title 	= 'RH Freeboard';
					obj.unit 		= 'inches';
					obj.sql.field 	= 'freeboard';
					obj.sql.table 	= 'degas_ht';
					break;
				case 'DecarbTime':
					obj.sql.idFull = (idMain + ' ' + option).fieldWrapAdd();
					obj.title 	= 'RH Decarb Time';
					obj.unit 		= 'minutes';
					obj.format 	= '.1f';
					obj.decimals 	= 1;
					obj.sql.field =
						'convert( \n' + 
						'  decimal(10, 1), \n' + 
						'  datediff( \n' + 
						'    second, \n' + 
						'    max( \n' + 
						'      case when evt_name like \'CIRC CONFIRMED%\' then evt_dt end \n' + 
						'    ) over(partition by ht_num, tap_yr, deg_ht_sufx), \n' + 
						'    max( \n' + 
						'      case when evt_name like \'DEOX START%\' then evt_dt end \n' + 
						'    ) over(partition by ht_num, tap_yr, deg_ht_sufx) \n' + 
						'  )/60.0 \n' + 
						')';
					obj.sql.table 	= 'degas_ht_event';
					obj.sql.filterLocal =
						'  and( \n' +
						'    evt_name like \'CIRC CONFIRMED%\' \n' +
						'    or evt_name like \'DEOX START%\' \n' +
						'  )';
					break;
				case 'RHFinalStir':
					obj.sql.idFull = (idMain + ' ' + option).fieldWrapAdd();
					obj.title 	= 'RH Final Stir Time';
					obj.unit 		= 'heats';
					obj.sql.field 	= 'fin_stir_time';
					obj.sql.table 	= 'degas_ht';
					break;
				case 'RHHtsOnSnorkel':
					obj.sql.idFull = (idMain + ' ' + option).fieldWrapAdd();
					obj.title 	= 'RH Heats On Snorkel';
					obj.unit 		= 'heats';
					obj.sql.field 	= 'num_hts_on';
					obj.sql.table 	= 'degas_ht_equip_usage';
					obj.sql.filterLocal = '  and degas_ht_equip_usage.equip_cd = \'UPSNKL\' ';
					break;
				case 'ChemTestCount':
					obj.sql.idFull = (idMain + ' ' + option).fieldWrapAdd();
					obj.title 	= 'RH Chem Test Count';
					obj.unit 		= 'tests';
					obj.sql.selectDistinct = true;
					obj.sql.field 	= 'count(test_id) over (partition by ht_num, tap_yr)';
					obj.sql.table 	= 'ms_ht_chem_samp_anal';
					obj.sql.filterLocal =
						'  and test_id like \'V%\' \n' +
						'  and elem_cd = \'C\'';
					break;
				case 'TreatmentCount':
					obj.sql.idFull 	= (idMain + ' ' + option).fieldWrapAdd();
					obj.title 	= 'RH Treatment Count';
					obj.unit 		= 'treatments';
					obj.sql.selectDistinct = true;
					obj.sql.field 	= 'count(deg_ht_sufx) over(partition by ht_num, tap_yr)';
					obj.sql.table 	= 'degas_ht';
					break;
				default:
					break;
			}
			break;
		case 'ArgonLadleAdd':
			var stir = params[0];
			var matCode = params[1];
			obj.sql.idFull = (idMain + ' ' + stir + ' ' + matCode).fieldWrapAdd();
			obj.unit = 'lb';
			// obj.sql.selectDistinct = true;
			obj.sql.field = 'act_wt';
			obj.sql.fromOverride =
				'select distinct \n' + 
				'  ht_num, tap_yr, stir_cnt, sum(isNull(act_wt, 0)) over(partition by ht_num, tap_yr) as act_wt \n' + 
				'from( \n' + 
				'  select distinct \n' + 
				'    ht_num, tap_yr, stir_cnt, max(stir_cnt) over(partition by ht_num, tap_yr) as stir_cnt_final \n' + 
				'  from USSGLW.dbo.argon_ht_stir \n' + 
				') sub1 \n' + 
				'left outer join( \n' + 
				'  select \n' + 
				'    ht_num as ht_num_sub2, tap_yr as tap_yr_sub2, stir_cnt as stir_cnt_sub2, mat_cd, act_wt \n' + 
				'  from USSGLW.dbo.argon_ht_mat_add \n' + 
				'  where \n' + 
				'    mat_cd = \'' + matCode + '\' \n' + 
				') sub2 \n' + 
				'  on sub1.ht_num = sub2.ht_num_sub2 \n' + 
				'    and sub1.tap_yr = sub2.tap_yr_sub2 \n' + 
				'    and sub1.stir_cnt = sub2.stir_cnt_sub2 \n';

			if (stir === 'AllStirs') {
				obj.title	= 'Argon ' + paramsNames[1];
			} else if (stir === 'After1') {
				obj.title	= 'Argon ' + paramsNames[1] + ' After Stir1';
				obj.sql.fromOverride += 'where stir_cnt > \'1\' \n';
			} else if (stir === 'Final') {
				obj.title	= 'Argon ' + paramsNames[1] + ' On Final Stir';
				obj.sql.fromOverride += 'where stir_cnt = stir_cnt_final \n';
			} else {
				obj.title	= 'Argon Stir ' + paramsNames[1] + ' On Stir' + stir;
				obj.sql.fromOverride += 'where stir_cnt = \'' + stir + '\' \n';
			}

			obj.sql.fromOverride = indentString(obj.sql.fromOverride, '  ');
			break;
		case 'ArgonStir':
			var stir = params[0];
			var option = params[1];
			obj.sql.idFull = (idMain + ' ' + stir + ' ' + option).fieldWrapAdd();
			obj.unit = 'minutes';
			obj.format 	= '.1f';
			obj.decimals 	= 1;
			obj.sql.selectDistinct = true;
			obj.sql.field = 'convert(decimal(10, 1), sum(stir_dur) over(partition by ht_num, tap_yr))';
			obj.sql.fromOverride =
				'select distinct \n' + 
				'  ht_num, tap_yr, stir_cnt, \n' + 
				'  max(stir_cnt) over(partition by ht_num, tap_yr) as stir_cnt_final, \n' +
				'  datediff(second, stir_st_dt, stir_end_dt)/60.0 as stir_dur \n' + 
				'from USSGLW.dbo.argon_ht_stir argon_ht_stir \n';
	
			if (stir === 'AllStirs') {
				obj.title	= 'Argon ' + paramsNames[1];
			} else if (stir === 'After1') {
				obj.title	= 'Argon ' + paramsNames[1] + ' After Stir1';
				obj.sql.fromOverride += 'where stir_cnt > \'1\' \n';
			} else if (stir === 'Final') {
				obj.title	= 'Argon ' + paramsNames[1] + ' On Final Stir';
				obj.sql.filterLocal = '  and stir_cnt = stir_cnt_final \n';
			} else {
				obj.title	= 'Argon Stir ' + paramsNames[1] + ' On Stir' + stir;
				obj.sql.fromOverride += 'where stir_cnt = \'' + stir + '\' \n';
			}

			obj.sql.fromOverride = indentString(obj.sql.fromOverride, '  ');

			obj.sql.filterRealistic = obj.sql.idFull + ' > 0 ';

			break;
		case 'ArgonMisc':
			var option 	= params[0];
			obj.type 		= 'linear';
			switch (option) {
				case 'TotalStir':
					obj.sql.idFull = (idMain + ' ' + option).fieldWrapAdd();
					obj.title 	= 'Argon Total Stir';
					obj.unit 		= 'minutes';
					obj.format 	= '.1f';
					obj.decimals 	= 1;
					obj.sql.field 	= 'convert(decimal(10,1), cum_stir_time)';
					obj.sql.table 	= 'argon_ht';
					break;
				case 'ChemTestCount':
					obj.sql.idFull = (idMain + ' ' + option).fieldWrapAdd();
					obj.title 	= 'Ar Chem Test Count';
					obj.unit 		= 'tests';
					obj.sql.selectDistinct = true;
					obj.sql.field 	= 'count(test_id) over (partition by ht_num, tap_yr)';
					obj.sql.table 	= 'ms_ht_chem_samp_anal';
					obj.sql.filterLocal =
						'  and test_id like \'A_L_\' \n' +
						'  and elem_cd = \'C\'';
					break;
				case 'StirCount':
					obj.sql.idFull = (idMain + ' ' + option).fieldWrapAdd();
					obj.title 	= 'Argon Stir Count';
					obj.unit 		= 'stirs';
					obj.sql.selectDistinct = true;
					obj.sql.field 	= 'max(stir_cnt) over (partition by ht_num, tap_yr)';
					obj.sql.table 	= 'argon_ht_stir';
					break;
				case 'AlLoss':
					var AlChemChange = ('ChemDiff A_L1 A_L2 Al').fieldWrapAdd();
					var AlAddedAfterStir1 = ('ArgonLadleAdd After1 ALUM').fieldWrapAdd();
					obj.sql.idFull = (idMain + ' ' + option).fieldWrapAdd();
					obj.title 	= 'Al Loss (L1 to L2 Tests)';
					obj.unit 		= 'lbs';
					obj.sql.selectDistinct = true;
					obj.sql.field = AlChemChange + ' * 5000 + ' + AlAddedAfterStir1;
					break;
				default:
					break;
			}
			break;
		case 'CCMisc':
			var option 	= params[0];
			obj.type 		= 'linear';
			switch (option) {
				case 'HeatOfCast':
					var option 	= params[0];
					obj.sql.idFull 	= (idMain + ' ' + option).fieldWrapAdd();
					obj.title 	= 'Heat Of Cast';
					obj.type 		= 'text';
					obj.sql.field 	= 'cast_ht_seq_num';
					obj.sql.table 	= 'cast_ht';
					break;
				default:
					break;
			}
			break;
		case 'ScrapYard':
			var yard = params[0];
			obj.sql.idFull = (idMain + ' ' + yard).fieldWrapAdd();
			obj.title = idMain;
			obj.type = 'text';
			obj.sql.field = 'box_1_scale';
			obj.sql.table = 'bop_ht_scrp_chrg';
			obj.sql.filterLocal = '  and box_1_scale = \'' + yard + '\'';
			obj.disableOperator = true;
			break;
		case 'BOPVessel':
			var vessel 	= params[0];
			obj.sql.idFull 	= (idMain + ' ' + vessel).fieldWrapAdd();
			obj.title 	= 'BOP Vessel';
			obj.type 		= 'text';
			obj.sql.field 	= 'null';
			obj.sql.table 	= 'bop_ht';
			obj.sql.filterLocal = '  and substring(ht_num, 1, 2) = \'' + vessel + '\' ';
			obj.disableOperator = true;
			break;
		case 'RHVessel':
			var vessel 	= params[0];
			obj.sql.idFull 	= (idMain + ' ' + vessel).fieldWrapAdd();
			obj.title 	= 'RH Vessel';
			obj.type 		= 'text';
			obj.sql.field 	= 'active_ves';
			obj.sql.table 	= 'degas_ht';
			obj.sql.filterLocal = '  and ' + obj.sql.field + ' = \'' + vessel + '\' ';
			obj.disableOperator = true;
			break;
		case 'ArStation':
			var station 	= params[0];
			obj.sql.idFull 	= (idMain + ' ' + station).fieldWrapAdd();
			obj.title 	= 'Argon Station';
			obj.type 		= 'text';
			obj.sql.field 	= 'Ar_stat_num';
			obj.sql.table 	= 'argon_ht';
			obj.sql.filterLocal = '  and ' + obj.sql.field + ' = \'' + station + '\' ';
			obj.disableOperator = true;
			break;
		case 'CasterNumber':
			var caster 	= params[0];
			obj.sql.idFull 	= (idMain + ' ' + caster).fieldWrapAdd();
			obj.title 	= 'Caster';
			obj.type 		= 'text';
			obj.sql.field 	= 'caster_num';
			obj.sql.table 	= 'cast_ht';
			obj.sql.filterLocal = '  and ' + obj.sql.field + ' = \'' + caster + '\' ';
			obj.disableOperator = true;
			break;
		case 'LadleNumber':
			obj.sql.idFull 	= (idMain + ' ' + caster).fieldWrapAdd();
			obj.title 	= 'Ladle';
			obj.type 		= 'text';
			obj.sql.field 	= 'ldl_num';
			obj.sql.table 	= 'bop_ht';
			obj.equalOperatorOnly = true;
			break;
		default:
			break;		
	}


	(obj.type === undefined) ? (obj.type = 'linear') : (null);
	(obj.unit === undefined) ? (obj.unit = '') : (null);
	(obj.format === undefined) ? (obj.format = '.f') : (null);
	(obj.decimals === undefined) ? (obj.decimals = 0) : (null);
	(obj.sql.field === undefined) ? (obj.sql.field = '') : (null);
	(obj.sql.table === undefined) ? (obj.sql.table = '') : (null);
	(obj.sql.db === undefined) ? (obj.sql.db = 'USSGLW.dbo') : (null);
	(obj.sql.filterLocal === undefined) ? (obj.sql.filterLocal = '') : (obj.sql.filterLocal += ' \n');
	(obj.sql.filterRealistic === undefined) ? (obj.sql.filterRealistic = '') : (obj.sql.filterRealistic += ' \n');
	(obj.sql.joinType === undefined) ? (obj.sql.joinType = 'inner join') : (null);
	(obj.sql.selectDistinct === undefined) ? (obj.sql.selectDistinct = false) : (null);
	(obj.sql.fromOverride === undefined) ? (obj.sql.fromOverride = false) : (null);
	(obj.disableOperator === undefined) ? (obj.disableOperator = false) : (null);
	(obj.equalOperatorOnly === undefined) ? (obj.equalOperatorOnly = false) : (null);


	return obj;
}

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
//================================================================
//===  fieldExpand.js  ========================================
//==========================================================


function fieldExpandCreate(id, target) {
	'use strict';
	var html = '';


	$(target + ' .fieldExpand span').hide();
	$(target + ' .fieldExpand select').hide();


	var chemTestArr = [
		['BLAD', 'BLAD'],
		['ILAD', 'ILAD'],
		['BtlAvg', 'HM Bottle Average'],
		['DsfStartLeco', 'Desulf Initial (Leco)'],
		['DsfInit', 'Desulf Initial'],
		['DsfFinal', 'Desulf Final'],
		['B_F1', 'TD'],
		['B_L1', 'TOL'],
		['A_L1', 'Ar 1st'],
		['A_L2', 'Ar 2nd'],
		['V_L1', 'RH 1st'],
		['V_L2', 'RH 2nd'],
		['L_L1', 'LMF 1st'],
		['L_L2', 'LMF 2nd'],
		['C_M1', 'CC M1'],
		['C_M2', 'CC M2'],
		['C_M3', 'CC M3'],
		['MinRef', 'Min (Final Ref)'],
		['MaxRef', 'Max (Final Ref)'],
		['AimDesulf', 'Aim (Desulf)'],
		['AimBOP', 'Aim (BOP)'],
		['StartBOP', 'Pre-Alloy Pred (BOP)'],
		['FinalBOP', 'TOL Pred (BOP)'],
		['AimAr', 'Aim (Argon)']
	];

	var chemElemArr = [
		'C', 'Mn', 'P', 'S', 'Si', 'Cu', 'Ni', 'Cr', 'Mo', 'Sn',
		'Al', 'V', 'Cb', 'Ti', 'B', 'N', 'Ca', 'As', 'Sb', 'ExTi'
	];
	var chemSlagArr = [
		['FeO_pct', 'FeO'],
		['Vratio', 'Vratio'],
		['CaO_pct', 'CaO'],
		['SiO2_pct', 'SiO2'],
		['MgO_pct', 'MgO'],
		['MnO_pct', 'MnO'],
		['P2O5_pct', 'P2O5'],
		['S_pct', 'S'],
		['Al2O3_pct', 'Al2O3'],
		['TiO2_pct', 'TiO2']
	];

	var temperatureArr = [
		['HMLadle', 'HM Ladle'],
		['Tap', 'Tap'],
		['TOL', 'TOL'],
		['ArArrive', 'Ar Arrive'],
		['ArLeave', 'Ar Leave'],
		['RHArrive', 'RH Arrive'],
		['RHDeox', 'RH Deox'],
		['RHLeave', 'RH Leave'],
		['CT1', 'CC Tundish 1'],
		['CT2', 'CC Tundish 2'],
		['CT3', 'CC Tundish 3'],
		['AimMelter', 'Aim Melter'],
		['AimCharge', 'Aim Charge Model']
	];

	var celoxArr = [
		['TapO2', 'BOP Tap O2'],
		['BTO', 'BOP BTO'],
		['ArArrive', 'Ar Arrive'],
		['ArLeave', 'Ar Leave'],
		['RHArrive', 'RH Arrive'],
		['RHDeox', 'RH Deox'],
		['RHLeave', 'RH Leave']
	];

	var BOPfurnaceAddArr = [
		['TotalChargeActual', 'Total Charge'],
		['MetalActual', 'Metal Charge'],
		['ScrapActual', 'Scrap Charge'],
		['MiscActual', 'Misc Charge'],
		['MetalPctActual', 'Metal Percent'],
		['ScrapPctActual', 'Scrap Percent'],
		['TotalChargeModel', 'Total Charge (Model)'],
		['MetalModel', 'Metal Charge (Model)'],
		['ScrapModel', 'Scrap Charge (Model)'],
		['MiscModel', 'Misc Charge (Model)'],
		['MetalPctModel', 'Metal Percent (Model)'],
		['ScrapPctModel', 'Scrap Percent (Model)']
	];

	var BOPladleAddArr = [
		['05', 'Reg FeMn'],
		['12', 'MC FeMn'],
		['13', 'Al Notch Bar'],
		['55', 'Al Cones'],
		['81', 'Coke'],
		['CS', 'Coke Super Sack'],
		['15', '75% FeSi'],
		['62', 'FeB'],
		['26', 'FeCb'],
		['95', 'FeTi'],
		['24', 'FeP'],
		['43', 'Slag Cond 70%'],
		['97', 'Ladle Desulf']
	];

	var BOPscrapArr = [
		['FAB', '1 Bundles'],
		['FAF', 'Home'],
		['FAS', 'Pit + BF Iron'],
		['FBE', 'Cut Slabs'],
		['FFR', 'Frag'],
		['FHS', 'P&S'],
		['FOH', '1.5 Bundles'],
		['FRB', 'HMS Demo + Bello Briqs'],
		['FST', 'Side Trim'],
		['FTC', 'Tin Can'],
		['FTU', 'Tundish']
	];

	var BOPmiscArr = [
		['Mg90', 'Desulf Mg90'],
		['Mg90Replunge', 'Desulf Mg90 (Replunge)'],
		['DsfSkimCrane', 'Desulf Skim (Crane)'],
		['DsfSkimCalc', 'Desulf Skim (Calc)'],
		['RecycleWt', 'Recycled Steel Weight'],
		['TotalN2Cool', 'Total N2 Cool Time'],
		['TapDur', 'Tap Duration']
	];

	var degasserMiscArr = [
		['RHSlagDepth', 'Slag Depth'],
		['RHFreeboard', 'Freeboard'],
		['DecarbTime', 'Decarb Time'],
		['RHFinalStir', 'Final Stir Time'],
		['RHHtsOnSnorkel', 'Heats on Snorkel'],
		['ChemTestCount', 'Chem Test Count'],
		['TreatmentCount', 'Treatment Count']
	];

	var argonLadleAddArr = [
		['ALUM', 'Aluminum'],
		['SCRAP', 'Scrap'],
		['CWIRE', 'Carbon Wire'],
		['COAL', 'Coal'],
		['MC-MN', 'Manganese (MC)'],
		['COLUM', 'Columbium'],
		['FE-CR', 'Chromium'],
		['CALSI', 'CalSil'],
		['FSILI', 'Silicon'],
		['BIMAC', 'BIMAC'],
		['BORON', 'Boron'],
		['FE-TI', 'Titanium'],
		['VANAD', 'Vanadium'],
		['PHOS', 'Phosphorus'],
		['PYRIT', 'Pyrite'],
		['SULFU', 'Sulfur']
	];

	var argonStirCountArr = [
		['AllStirs', 'Total All Stirs'],
		['After1', 'Total After Stir 1'],
		['Final', 'Final Stir'],
		['1', 'Stir 1'],
		['2', 'Stir 2'],
		['3', 'Stir 3'],
		['4', 'Stir 4'],
		['5', 'Stir 5'],
		['6', 'Stir 6'],
		['7', 'Stir 7'],
		['8', 'Stir 8']
	];

	var argonStirArr = [
		['Duration', 'Duration']
	];


	var argonMiscArr = [
		['TotalStir', 'Total Stir'],
		['ChemTestCount', 'Chem Test Count'],
		['StirCount', 'Stir Count'],
		['AlLoss', 'Alum Loss (L1 to L2)']
	];

	var CCMiscArr = [
		['HeatOfCast', 'Heat of Cast']
	];

	var scrapYardArr = [
		['E', 'East'],
		['W', 'West']
	];

	var BOPVesselArr = ['25', '26'];

	var RHVesselArr = ['1', '2'];

	var ArStationArr = ['1', '2'];

	var CasterNumberArr = ['1', '2'];


	function selectCreate(target, arr) {
		var e = $(target);
		var text = null;

		e.empty();

		$.each(arr, function(row, value) {
			if ( $.isArray(value) ) {
				id = value[0];
				text = value[1];
			} else {
				id = text = value;
			}

			e.append($("<option></option>").attr("value", id).text(text));
		});

		e.show();

		return true;
	}


	switch (id) {
		case 'Chem':
			selectCreate(target + ' .select1', chemTestArr);
			selectCreate(target + ' .select2', chemElemArr);
			break;
		case 'ChemDiff':
			$(target + ' .message').html('&nbsp;(top minus bottom)');
			$(target + ' .message').show();
			selectCreate(target + ' .select1', chemTestArr);
			selectCreate(target + ' .select2', chemTestArr);
			selectCreate(target + ' .select3', chemElemArr);
			break;
		case 'SlagChem':
			selectCreate(target + ' .select1', chemSlagArr);
			break;
		case 'Temp':
			selectCreate(target + ' .select1', temperatureArr);
			break;
		case 'TempDiff':
			$(target + ' .message').html('&nbsp;(top minus bottom)');
			$(target + ' .message').show();
			selectCreate(target + ' .select1', temperatureArr);
			selectCreate(target + ' .select2', temperatureArr);
			break;
		case 'Celox':
			selectCreate(target + ' .select1', celoxArr);
			break;
		case 'BOPFurnaceAdd':
			selectCreate(target + ' .select1', BOPfurnaceAddArr);
			break;
		case 'BOPLadleAdd':
			selectCreate(target + ' .select1', BOPladleAddArr);
			break;
		case 'BOPScrap':
			selectCreate(target + ' .select1', BOPscrapArr);
			break;
		case 'BOPmisc':
			selectCreate(target + ' .select1', BOPmiscArr);
			break;
		case 'DegasserMisc':
			selectCreate(target + ' .select1', degasserMiscArr);
			break;
		case 'ArgonLadleAdd':
			selectCreate(target + ' .select1', argonStirCountArr);
			selectCreate(target + ' .select2', argonLadleAddArr);
			break;
		case 'ArgonStir':
			selectCreate(target + ' .select1', argonStirCountArr);
			selectCreate(target + ' .select2', argonStirArr);
			break;
		case 'ArgonMisc':
			selectCreate(target + ' .select1', argonMiscArr);
			break;
		case 'CCMisc':
			selectCreate(target + ' .select1', CCMiscArr);
			break;
		case 'ScrapYard':
			selectCreate(target + ' .select1', scrapYardArr);
			break;
		case 'BOPVessel':
			selectCreate(target + ' .select1', BOPVesselArr);
			break;
		case 'RHVessel':
			selectCreate(target + ' .select1', RHVesselArr);
			break;
		case 'ArStation':
			selectCreate(target + ' .select1', ArStationArr);
			break;
		case 'CasterNumber':
			selectCreate(target + ' .select1', CasterNumberArr);
			break;
		default:
			break;
	}

	return html;
}
//================================================================
//===  global.js  =============================================
//==========================================================


var g = {};


// g.OS = 'windows';


g.maxRows = 20000;


g.error = false;


g.errorFunc = function(msg) {
	'use strict';
	g.error = true;
	alert(msg);
};
//================================================================
//===  moreFilters.js  ========================================
//==========================================================


mMoreFilters.init = function() {
	'use strict';
	$('#m-moreFilters .fieldExpand span').hide();
	$('#m-moreFilters .fieldExpand select').hide();
	$('#m-moreFilters .operator').hide();
	$('#m-moreFilters .range').children().hide();

	mMoreFilters.eachFilter = [];



	watch();


	function watch() {
		$('#m-moreFilters select').change( function() {
			mMoreFilters.update( $(this) );
		});
	}

};



mMoreFilters.update = function(changedElem) {
	'use strict';
	var changedElemClass = changedElem.attr('class');
	var target = '#m-moreFilters #' + $(changedElem).closest('div').attr('id');
	var selection = $(target + ' .' + changedElemClass).val();
	var idMain = '';
	var disableOperator = false;
	var equalOperatorOnly = false;

	if ($(changedElem).closest('div').attr('class') === 'fieldExpand') {
		target = '#m-moreFilters #' + changedElem.parent().parent().attr('id') + ' .fieldExpand';
		selection = $(target + ' .' + changedElemClass).val();
		idMain = $('#m-moreFilters #' + changedElem.parent().parent().attr('id') + ' .field').val();
		changedElemClass = 'fieldExpand';
	}

	switch ( changedElemClass ) {
		case 'field':
			idMain = selection;
			disableOperator = getDefinitions(idMain, null, null).disableOperator;
			equalOperatorOnly = getDefinitions(idMain, null, null).equalOperatorOnly;
			$(target + ' .fieldExpand select').prop('disabled', false);

			if ( (selection === 'N/A')  ||  (disableOperator) ) {
				$(target + ' .operator').hide();
				$(target + ' .range').children().hide();
			} else if (equalOperatorOnly) {
				$(target + ' .operator').show();
				$(target + ' .operator').val('=');
				$(target + ' .range .input1').show();
				$(target + ' .range .and').hide();
				$(target + ' .range .input2').hide();
			} else {
				$(target + ' .operator').show();
				$(target + ' .range .input1').show();
			}
			fieldExpandCreate(idMain, target);
			break;
		case 'operator':
			if (selection === 'between'  ||  selection === 'notBetween') {
				$(target + " .range").children().show();
			} else {
				$(target + ' .range .input1').show();
				$(target + ' .range .and').hide();
				$(target + ' .range .input2').hide();
			}
			break;
		case 'fieldExpand':
			toggleSulfurLock(idMain, target);
			break;
		default:
			break;
	}


	return true;
};



mMoreFilters.validate = function() {
	'use strict';
	var activeFiltersArray = $('#m-moreFilters').find('input:visible');

	$.each(activeFiltersArray, function( index, value ) {
		var inputContent = $(value).val();
		if (inputContent === '') {
			var msg =
				'ERROR: Missing input.\n\n' +
				'There\'s an empty input box in the \'More Filters\' section.';
			g.errorFunc(msg);
			return false;
		} else if ( !$.isNumeric(inputContent) ) {
			var msg =
				'ERROR: Invalid number.\n\n' +
				'You entered: \'' + inputContent + '\'\n' +
				'Correct format: numeric.';
			g.errorFunc(msg);
			return false;
		}
	});

	return true;
};



mMoreFilters.getFromDOM = function() {
	var obj = {};
	mMoreFilters.eachFilter = [];  // Reinitialize
	mMoreFilters.filtersAvailable = $('#m-moreFilters .item').length;
	mMoreFilters.filtersUsed = 0;  // Initialize

	for (var i = 1; i <= mMoreFilters.filtersAvailable; i++) {
		obj.target = '#m-moreFilters #filter' + i;
		obj.sql = {
			subName: 'filter' + i
		};

		if ( $(obj.target + ' .field').val() !== 'N/A' ) {
			mMoreFilters.eachFilter.push( get(obj) );
			mMoreFilters.filtersUsed += 1;
		}
	}


	return true;


	function get(obj) {
		var target = obj.target;
		var selectsArray = [];

		obj.idMain = $(target + ' .field option:selected').val();
		obj.operator = $(target + ' .operator').val();

		obj.paramsVal = [];
		obj.paramsText = [];
		selectsArray = $(target + " .fieldExpand").find("select");
		$.each(selectsArray, function( index, value ) {
			var selectClass = $(value).attr("class");
			var val = $(target + " .fieldExpand ." + selectClass + " option:selected").val();
			var text = $(target + " .fieldExpand ." + selectClass + " option:selected").text();
			obj.paramsVal.push(val);
			obj.paramsText.push(text);
		});

		obj = $.extend(true, {}, obj, getDefinitions(obj.idMain, obj.paramsVal, obj.paramsText));

		return obj;
	}

};




//================================================================
//===  options.js  ============================================
//=========================================================


mOptions.init = function() {
	'use strict';
	mOptions.toggleSubmitBtn('disable', 'Loading...');

	mOptions.x = {
		target: '#options-x',
		sql: {
			subName: 'subX'
		}
	};

	mOptions.y = {
		target: '#options-y',
		sql: {
			subName: 'subY'
		}
	};


	var date30DaysAgo = moment().subtract(30, 'days').format('M/D/YY');
	$('#options-filter .dataRange .min').val(date30DaysAgo);


	watch();

	$('#m-options #options-x .field').change();
	$('#m-options #options-y .field').change();

	mOptions.toggleSubmitBtn('enable');


	function watch() {
		$("#m-options select").change( function() {
			mOptions.update( $(this) );
		});

		$("#generate").click( function() {
			mOptions.toggleSubmitBtn('disable', 'Loading...');

			mMaster.submitHandle();

		});

	}

	return true;
};



mOptions.update = function(changedElem) {
	'use strict';
	var changedElemClass = changedElem.attr('class');
	var target = '#m-options #' + $(changedElem).closest('div').attr('id');
	var selection = $(target + ' .' + changedElemClass).val();
	var idMain = selection;
	var type = getDefinitions(idMain, null, null).type;


	// If the field isn't a number, hide the data range options.
	if (type != 'linear') {
		$(target + ' .min').val('');
		$(target + ' .max').val('');
		$(target + ' .dataRange').hide();
	} else {
		$(target + ' .dataRange').show();
	}

	if ($(changedElem).closest('div').attr('class') === 'fieldExpand') {
		target = '#m-options #' + changedElem.parent().parent().attr('id') + ' .fieldExpand';
		selection = $(target + ' .' + changedElemClass).val();
		idMain = $('#m-options #' + changedElem.parent().parent().attr('id') + ' .field').val();
		changedElemClass = 'fieldExpand';
	}

	switch ( changedElemClass ) {
		case 'field':
			idMain = selection;
			$(target + ' .fieldExpand select').prop('disabled', false);

			if (type != 'linear') {
				$(target + ' .min').val('');
				$(target + ' .max').val('');
				$(target + ' .dataRange').hide();
			} else {
				$(target + ' .dataRange').show();
			}

			fieldExpandCreate(idMain, target);
			break;
		case 'fieldExpand':
			toggleSulfurLock(idMain, target);
			break;
		default:
			break;
	}



	return true;
};



mOptions.validate = function() {
	var idMain = '';
	var type = '';
	var round = '';
	var msg = '';
	var min = null;
	var max = null;


	//checkRequiredInputs();
	runTests('#options-x');
	runTests('#options-y');
	runTests('#options-filter');

	return true;

	
	function checkRequiredInputs() {
	
	}


	function runTests(target) {
		if (target === '#options-filter') {  // If testing the filter section.
			type = 'datetime';

			min = nullIfBlank($(target + " .min").val());

			if (!min) {
				msg =
					'ERROR: Missing minimum date.\n\n' +
					'You must enter a minimum date in the \'Time Range\' section.';
				g.errorFunc(msg);
			}
		} else {
			idMain = $(target + " .field option:selected").val();
			type = getDefinitions(idMain, null, null).type;
		}


		


		// Validate data range
		if (type === 'linear') {
			min = nullIfBlank($(target + " .min").val());
			max = nullIfBlank($(target + " .max").val());

			if ( (min)  &&  (!$.isNumeric(min)) ) {
				msg =
					'ERROR: Invalid number.\n\n' +
					'You entered: \'' + min + '\'\n' +
					'Correct format: numeric.';
				g.errorFunc(msg);
				return false;
			} else if ( (max)  &&  (!$.isNumeric(max)) ) {
				msg =
					'ERROR: Invalid number.\n\n' +
					'You entered: \'' + max + '\'\n' +
					'Correct format: numeric.';
				g.errorFunc(msg);
				return false;
			}
		} else if (type === 'datetime') {
			min = nullIfBlank($(target + " .min").val());
			max = nullIfBlank($(target + " .max").val());

			if ( (min)  &&  (!Date.parse(min)) ) {
				msg =
					'ERROR: Invalid date.\n\n' +
					'You entered: \'' + min + '\'\n' +
					'Correct format: m/d/yy. For example, 4/23/15 is properly formatted.';
				g.errorFunc(msg);
				return false;
			} else if ( (max)  &&  (!Date.parse(max)) ) {
				msg =
					'ERROR: Invalid date.\n\n' +
					'You entered: \'' + max + '\'\n' +
					'Correct format: m/d/yy. For example, 4/23/15 is properly formatted.';
				g.errorFunc(msg);
				return false;
			}
		}



		// Validate rounding input.
		round = nullIfBlank( $(target + " .round input").val() );  // Get the rounding factor.
		if ( (round)  &&  (type === 'datetime') ) {  // If there's a rounding input and it's a date.
			if ( (round != 'day')  &&  (round != 'week')  &&  (round != 'month')  &&  (round != 'year') ){
				msg =
					'ERROR: Invalid rounding factor.\n\n' +
					'You entered \'' + round + '\'\n' +
					'Acceptable options: day, week, month and year.';
				g.errorFunc(msg);
				return false;
			}
		} else if ( (round)  &&  (type === 'linear') ) {  // If there's a rounding input and it's a number.
			if ( !$.isNumeric(round) ) {
				msg =
					'ERROR: Invalid rounding factor.\n\n' +
					'You entered \'' + round + '\'\n' +
					'Acceptable options: numeric.';
				g.errorFunc(msg);
				return false;
			}
		}


		return true;
	}
};



mOptions.getFromDOM = function() {
	var selectsArray = [];


	mOptions.x = $.extend(true, {}, mOptions.x, get(mOptions.x));
	mOptions.y = $.extend(true, {}, mOptions.y, get(mOptions.y));

	mOptions.timeMin = nullIfBlank($('#options-filter .dataRange .min').val());
	mOptions.timeMax = nullIfBlank($('#options-filter .dataRange .max').val());
	mOptions.tapGrade = nullIfBlank($('#options-filter .tapGrade input').val());


	function get(obj) {
		var target = obj.target;
		obj.min = nullIfBlank($(target + ' .min').val());
		obj.max = nullIfBlank($(target + ' .max').val());

		if (target === '#options-x') {
			obj.round = nullIfBlank($(target + ' .round input').val());
		}

		obj.idMain = $(target + ' .field option:selected').val();

		//
		obj.paramsVal = [];
		obj.paramsText = [];
		selectsArray = $(target + ' .fieldExpand').find('select');
		$.each(selectsArray, function( index, value ) {
			var selectClass = $(value).attr("class");
			var val = $(target + ' .fieldExpand .' + selectClass + ' option:selected').val();
			var text = $(target + ' .fieldExpand .' + selectClass + ' option:selected').text();
			obj.paramsVal.push(val);
			obj.paramsText.push(text);
		});

		obj = $.extend(true, {}, obj, getDefinitions(obj.idMain, obj.paramsVal, obj.paramsText));

		return obj;
	}

	return {
		x: mOptions.x,
		y: mOptions.y,
		timeMin: mOptions.timeMin,
		timeMax: mOptions.timeMax,
		tapGrade: mOptions.tapGrade
	};
};



mOptions.toggleSubmitBtn = function(toggle, text) {
	var defaultText = 'Generate Chart';
	if (text === undefined) {
		text = defaultText;
	}
	switch (toggle) {
		case 'disable':
			$('#m-options #generate').prop('disabled', true);
			$('#m-options #generate').val(text);
			break;
		case 'enable':
			$('#m-options #generate').prop('disabled', false);
			$('#m-options #generate').val(defaultText);
			break;
		default:
			break;
	}
	return true;
};
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
			if (results.data.length > g.maxRows) {
				alert(
					'Too many results. Please narrow your search. \n\n' +
					'Results: ' + results.data.length + ' heats \n' +
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
	var fromOverride = false;
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
	fromOverride = obj.sql.fromOverride;
	if (obj.sql.selectDistinct) { select = 'select distinct'; } else { select = 'select'; }

	subFields = field.fieldWrapToArray();
	if (subFields.length > 0) { calcField = true; } else { calcField = false; }


	if (fromOverride) {
		subName = null;
		selectPrefix = mSQL.createSelectPrefix(obj.sql.joinKeyArray, subName);
		query = select + ' ' + selectPrefix + ', ' + obj.sql.field + ' as ' + idFull + ' \n' +
						'from( \n' +
						fromOverride +
						') sub \n' +
						'where ' + filterGlobal;

		if (obj.sql.filterLocal !== '') {
			query += obj.sql.filterLocal;
		}

	} else if ( (queryDepth === 1)  &&  (calcField === false) ) {
		subName = null;
		selectPrefix = mSQL.createSelectPrefix(obj.sql.joinKeyArray, subName);
		query = select + ' ' + selectPrefix + ', ' + obj.sql.field + ' as ' + idFull + ' \n' +
						'from ' + obj.sql.db + '.' + obj.sql.table + ' ' + obj.sql.table + ' \n' +
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
						'from ' + obj.sql.db + '.' + obj.sql.table + ' ' + obj.sql.table + ' \n' +
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
//================================================================
//===  updateAxes.js  ============================================
//=========================================================



mUpdateAxes.start = function() {
	'use strict';

	function watch() {
		$("#m-updateAxes #updateAxes").click( function() {
			mUpdateAxes.submitHandle();
		});
	}


	mUpdateAxes.initialize();


	watch();

	return true;
};



mUpdateAxes.initialize = function() {
	'use strict';


	mUpdateAxes.x = {
		min: null,
		max: null
	};

	mUpdateAxes.y = {
		min: null,
		max: null
	};


	return true;
};



mUpdateAxes.submitHandle = function() {
	'use strict';


	mUpdateAxes.getFromDOM();
	mUpdateAxes.updateChart();


	return true;
};



mUpdateAxes.getFromDOM = function() {
	'use strict';
	var xType = mMaster.x.type;
	var xMin = nullIfBlank($('#m-updateAxes .xAxis .min').val());
	var xMax = nullIfBlank($('#m-updateAxes .xAxis .max').val());
	var yMin = nullIfBlank($('#m-updateAxes .yAxis .min').val());
	var yMax = nullIfBlank($('#m-updateAxes .yAxis .max').val());


	if ( xType === 'datetime' ) {
		if (xMin) {
			xMin = Date.parse(xMin);
		}
		if (xMax) {
			xMax = Date.parse(xMax);
		}
	}


	mUpdateAxes.x.min = xMin;
	mUpdateAxes.x.max = xMax;

	mUpdateAxes.y.min = yMin;
	mUpdateAxes.y.max = yMax;


	return true;
};



mUpdateAxes.updateChart = function() {
	'use strict';
	var chart = $('#m-graph').highcharts();
	var xMin = mUpdateAxes.x.min;
	var xMax = mUpdateAxes.x.max;
	var yMin = mUpdateAxes.y.min;
	var yMax = mUpdateAxes.y.max;
console.log(mUpdateAxes);

	chart.xAxis[0].setExtremes(xMin, xMax);
	chart.yAxis[0].setExtremes(yMin, yMax);


	return true;
};
//================================================================
//===  updateSeries.js  ============================================
//=========================================================



mUpdateSeries.start = function() {
	'use strict';

	function watch() {
		$("#m-updateSeries #toggleVisibility").click( function() {
			mUpdateSeries.toggleVisibility();
		});
	}


	// mUpdateSeries.initialize();


	watch();

	return true;
};



mUpdateSeries.initialize = function() {
	'use strict';
	return true;
};



mUpdateSeries.submitHandle = function() {
	'use strict';
	return true;
};



mUpdateSeries.getFromDOM = function() {
	'use strict';
	return true;
};






mUpdateSeries.toggleVisibility = function() {
	'use strict';
	var chart = $('#m-graph').highcharts();
	var opacityOriginal = 0.4;
	var color = chart.series[0].color;
	var colorSplit = color.split(',');
	var rgb = colorSplit[0] + ',' + colorSplit[1] + ',' + colorSplit[2];
	var opacity = colorSplit[colorSplit.length - 1];


	if (color.substring(0, 4) !== 'rgba') {
		return false;
	}


	opacity = opacity.substring(0, opacity.length - 1);
	opacity = parseFloat(opacity, 2);


	if (opacity < 1) {
		opacity = 1;
	} else {
		opacity = opacityOriginal;
	}

	color = rgb + ',' + opacity + ')';

	chart.series[0].update({
      color: color
  });


	return true;
};
//# sourceMappingURL=main.js.map