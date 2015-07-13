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



var idFull = '';
var output = '';

// idFull = '[add]';
idFull = '[Mg90]';
// idFull = '[difference]';
output = createSubQuery(idFull);
console.log(output);





function createSubQuery(id, queryDepth) {
	if (queryDepth === undefined) { queryDepth = 1; } else { queryDepth += 1; }
	var query = '';
	var subQuery = '';
	var selectPrefix = '';
	var calcField = null;
	var obj = {};
	var subFields = [];
	var filter = '';
	var filterRealisticArray = [];
	var subName = '';

	id = id.fieldWrapDelete();
	
	obj = getDefinitions(id);
	field = obj.sql.field;

	subFields = field.fieldWrapToArray();
	if (subFields.length > 0) { calcField = true; } else { calcField = false; }

	if ( (queryDepth === 1)  &&  (calcField === false) ) {
		subName = obj.sql.table;
		selectPrefix = createSelectPrefix(obj.sql.joinKeyArray, subName);
		query = 'select ' + selectPrefix + ', ' + obj.sql.field + ' as ' + id.fieldWrapAdd() + ' \n' +
						'from ' + obj.sql.table + ' \n';

			if (obj.sql.filterRealistic) {
				query += 'where ' + obj.sql.filterRealistic;
			}
	} else if (calcField === true) {
		subName = 'sub1';
		selectPrefix = createSelectPrefix(obj.sql.joinKeyArray, subName);
		query = 'select ' + selectPrefix + ', ' + obj.sql.field + ' as ' + id.fieldWrapAdd() + ' \n' +
						'from( \n';

		$.each(subFields, function( index, value ) {
			subName = 'sub' + (index + 1);
			obj = getDefinitions( value.fieldWrapDelete() );
			subQuery = createSubQuery(value, queryDepth);
			subQuery = indent(subQuery, '  ');

			if (index === 0) {
				obj.sql.joinType = '';
				obj.sql.joinOn = '';
			} else {
				obj.sql.joinType += '( \n';
				obj.sql.joinOn = createJoinOn(obj.sql.joinKeyArray, 'sub1', subName);
			}


			filterRealisticArray.push(obj.sql.filterRealistic);


			query +=
				obj.sql.joinType +
				subQuery +
				') ' + subName + ' \n' +
				obj.sql.joinOn;
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
		subName = 'sub1x';
		selectPrefix = createSelectPrefix(obj.sql.joinKeyArray, obj.sql.table);
		query = 
			'select ' + selectPrefix + ', ' + obj.sql.field + ' as ' + id.fieldWrapAdd() + ' \n' +
			'from ' + obj.sql.table + ' \n';
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


function getDefinitions(idMain, params, paramsNames) {
	'use strict';

	var obj = {
		sql: {}
	};

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
					obj.sql.db = 'USSGLW.dbo';
					break;
				case 'DsfStartLeco':
					elem = 'S';
					obj.sql.idFull = (idMain + ' ' + test + ' ' + elem).fieldWrapAdd();
					obj.sql.field = 'S_pct';
					obj.sql.table = 'bop_ht_leco';
					obj.sql.db = 'USSGLW.dbo';
					obj.sql.filterLocal = '  and ' + obj.sql.table + ".test_typ='IS' \n";
					break;
				case 'DsfInit':
					elem = 'S';
					obj.sql.idFull = (idMain + ' ' + test + ' ' + elem).fieldWrapAdd();
					obj.sql.field = 'dslf_init_S';
					obj.sql.table = 'bop_ht';
					obj.sql.db = 'USSGLW.dbo';
					break;
				case 'DsfFinal':
					elem = 'S';
					obj.sql.idFull = (idMain + ' ' + test + ' ' + elem).fieldWrapAdd();
					obj.sql.field = 'dslf_S_after_cycle';
					obj.sql.table = 'bop_ht';
					obj.sql.db = 'USSGLW.dbo';
					obj.sql.filterRealistic = obj.sql.idFull + ' < 0.050 \n';
					break;
				case 'AimDesulf':
					elem = 'S';
					obj.sql.idFull = (idMain + ' ' + test + ' ' + elem).fieldWrapAdd();
					obj.sql.field = 'dslf_calc_aim_S';
					obj.sql.table = 'bop_ht';
					obj.sql.db = 'USSGLW.dbo';
					break;
				case 'AimBOP':
					obj.sql.field = 'mdl_aim_pct';
					obj.sql.table = 'bop_chem_rec';
					obj.sql.db = 'Alloy_Model.dbo';
					obj.sql.filterLocal =
						"  and " + obj.sql.table + ".fac_id not like '%S' \n" +
						"  and " + obj.sql.table + ".fac_id not like '%T' \n" +
						"  and " + obj.sql.table + ".elem_cd = '" + elem.fieldWrapDelete().toUpperCase() + "' \n" +
						"  and mdl_run_seq_num = ( \n" +  //This line (and the following 5) makes the query take only the last model run for each heat.
						"    select max(mdl_run_seq_num) \n" +
				    "    from Alloy_Model.dbo.bop_chem_rec as f \n" +
				    "    where f.ht_num = bop_chem_rec.ht_num \n" +
				    "      and f.tap_yr = bop_chem_rec.tap_yr \n" +
  					"  ) \n";
					break;
				case 'MinRef':
					obj.sql.field = 'min_pct';
					obj.sql.table = 'ht_ref_chem_mod';
					obj.sql.db = 'USSGLW.dbo';
					obj.sql.filterLocal =
						"  and " + obj.sql.table + ".elem_cd = '" + elem.fieldWrapDelete().toUpperCase() + "' \n";
					break;
				case 'MaxRef':
					obj.sql.field = 'max_pct';
					obj.sql.table = 'ht_ref_chem_mod';
					obj.sql.db = 'USSGLW.dbo';
					obj.sql.filterLocal =
						"  and " + obj.sql.table + ".elem_cd = '" + elem.fieldWrapDelete().toUpperCase() + "' \n";
					break;
				case 'StartBOP':
					obj.sql.field = 'mdl_start_pct';
					obj.sql.table = 'bop_chem_rec';
					obj.sql.db = 'Alloy_Model.dbo';
					obj.sql.filterLocal =
						"  and " + obj.sql.table + ".fac_id not like '%S' \n" +
						"  and " + obj.sql.table + ".fac_id not like '%T' \n" +
						"  and " + obj.sql.table + ".elem_cd = '" + elem.fieldWrapDelete().toUpperCase() + "' \n" +
						"  and mdl_run_seq_num = ( \n" +  //This line (and the following 5) makes the query take only the last model run for each heat.
				    "    select max(mdl_run_seq_num) \n" +
				    "    from Alloy_Model.dbo.bop_chem_rec as f \n" +
				    "    where f.ht_num = bop_chem_rec.ht_num \n" +
				    "      and f.tap_yr = bop_chem_rec.tap_yr \n" +
  					"  ) \n";
					break;
				case 'FinalBOP':
					obj.sql.field = 'pred_final_pct';
					obj.sql.table = 'bop_chem_rec';
					obj.sql.db = 'Alloy_Model.dbo';
					obj.sql.filterLocal =
						"  and " + obj.sql.table + ".fac_id not like '%S' \n" +
						"  and " + obj.sql.table + ".fac_id not like '%T' \n" +
						"  and " + obj.sql.table + ".elem_cd = '" + elem.fieldWrapDelete().toUpperCase() + "' \n" +
						"  and mdl_run_seq_num = ( \n" +  //This line (and the following 5) makes the query take only the last model run for each heat.
				    "    select max(mdl_run_seq_num) \n" +
				    "    from Alloy_Model.dbo.bop_chem_rec as f \n" +
				    "    where f.ht_num = bop_chem_rec.ht_num \n" +
				    "      and f.tap_yr = bop_chem_rec.tap_yr \n" +
  					"  ) \n";
					break;
				case 'AimAr':
					obj.sql.field = 'mdl_aim_pct';
					obj.sql.table = 'ars_chem_rec';
					obj.sql.db = 'Alloy_Model.dbo';
					obj.sql.filterLocal =
						"  and " + obj.sql.table + ".fac_id not like '%S' \n" +
						"  and " + obj.sql.table + ".fac_id not like '%T' \n" +
						"  and " + obj.sql.table + ".elem_cd = '" + elem.fieldWrapDelete().toUpperCase() + "' \n" +
						"  and mdl_run_seq_num = ( \n" +  //This line (and the following 5) makes the query take only the last model run for each heat.
				    "    select max(mdl_run_seq_num) \n" +
				    "    from Alloy_Model.dbo.ars_chem_rec as f \n" +
				    "    where f.ht_num = ars_chem_rec.ht_num \n" +
				    "      and f.tap_yr = ars_chem_rec.tap_yr \n" +
  					"  ) \n";
					break;
				default:
					obj.sql.field = 'elem_pct';
					obj.sql.table = 'ms_ht_chem_samp_anal';
					obj.sql.db = 'USSGLW.dbo';
					obj.sql.filterLocal =
						"  and " + obj.sql.table + ".test_id like '" + test + "' \n" +
						"  and " + obj.sql.table + ".elem_cd = '" + elem.fieldWrapDelete().toUpperCase() + "' \n";
					break;
			}
			obj.sql.idFull = (idMain + ' ' + test + ' ' + elem).fieldWrapAdd();
			obj.title	= idMain + ' ' + elem + ': ' + paramsNames[0];
			obj.type = 'linear';
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
			obj.type = 'linear';
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
			obj.type = 'linear';
			obj.unit = '%';
			obj.format = '.2f';
			obj.decimals = 2;
			obj.sql.field = elem;
			obj.sql.table = 'bop_ht_slag_chem';
			obj.sql.db = 'USSGLW.dbo';
			break;
		case 'FurnaceAdd':
			var type 	= params[0];
			switch (type) {
				case 'TotalChargeActual':
					obj.sql.field = 'tot_chrg_tons';
					obj.sql.field = 
						'case \n ' +
						"  when calc_dt < '4/1/2014' then " + obj.sql.field + " * 2000 \n " +
						'  else ' + obj.sql.field + ' * 1000 \n ' +
						'end ';  //Fix for when field was in tons instead of thousands of lbs.
					obj.sql.table = 'bop_ht_chrg_mdl_data';
					obj.sql.filterLocal = " 	and " + obj.sql.table + ".last_calc_flg = 'O' \n";
					break;
				case 'MetalActual':
					obj.sql.field = 'tot_hm_chrg_tons';
					obj.sql.field = 
						'case \n ' +
						"  when calc_dt < '4/1/2014' then " + obj.sql.field + " * 2000 \n " +
						'  else ' + obj.sql.field + ' * 1000 \n ' +
						'end ';  //Fix for when field was in tons instead of thousands of lbs.
					obj.sql.table = 'bop_ht_chrg_mdl_data';
					obj.sql.table = 'bop_ht_chrg_mdl_data';
					obj.sql.filterLocal = " 	and " + obj.sql.table + ".last_calc_flg = 'O' \n";
					break;
				case 'ScrapActual':
					obj.sql.field = 'tot_scrap_chrg_tons';
					obj.sql.field = 
						'case \n ' +
						"  when calc_dt < '4/1/2014' then " + obj.sql.field + " * 2000 \n " +
						'  else ' + obj.sql.field + ' * 1000 \n ' +
						'end ';  //Fix for when field was in tons instead of thousands of lbs.
					obj.sql.table = 'bop_ht_chrg_mdl_data';
					obj.sql.table = 'bop_ht_chrg_mdl_data';
					obj.sql.filterLocal = " 	and " + obj.sql.table + ".last_calc_flg = 'O' \n";
					break;
				case 'MiscActual':
					obj.sql.field = 'tot_misc_tons';
					obj.sql.field = 
						'case \n ' +
						"  when calc_dt < '4/1/2014' then " + obj.sql.field + " * 2000 \n " +
						'  else ' + obj.sql.field + ' * 1000 \n ' +
						'end ';  //Fix for when field was in tons instead of thousands of lbs.
					obj.sql.table = 'bop_ht_chrg_mdl_data';
					obj.sql.table = 'bop_ht_chrg_mdl_data';
					obj.sql.filterLocal = " 	and " + obj.sql.table + ".last_calc_flg = 'O' \n";
					break;
				case 'MetalPctActual':
					obj.sql.field = 'hm_pct';
					obj.sql.table = 'bop_ht_chrg_mdl_data';
					obj.sql.filterLocal = " 	and " + obj.sql.table + ".last_calc_flg = 'O' \n";
					break;
				case 'ScrapPctActual':
					obj.sql.field = 'scrap_pct';
					obj.sql.table = 'bop_ht_chrg_mdl_data';
					obj.sql.filterLocal = " 	and " + obj.sql.table + ".last_calc_flg = 'O' \n";
					break;
				case 'TotalChargeModel':
					obj.sql.field = 'tot_chrg_tons';
					obj.sql.field = 
						'case \n ' +
						"  when calc_dt < '4/1/2014' then " + obj.sql.field + " * 2000 \n " +
						'  else ' + obj.sql.field + ' * 1000 \n ' +
						'end ';  //Fix for when field was in tons instead of thousands of lbs.
					obj.sql.table = 'bop_ht_chrg_mdl_data';
					obj.sql.table = 'bop_ht_chrg_mdl_data';
					obj.sql.filterLocal = " 	and " + obj.sql.table + ".last_calc_flg = 'P' \n";
					break;
				case 'MetalModel':
					obj.sql.field = 'tot_hm_chrg_tons';
					obj.sql.field = 
						'case \n ' +
						"  when calc_dt < '4/1/2014' then " + obj.sql.field + " * 2000 \n " +
						'  else ' + obj.sql.field + ' * 1000 \n ' +
						'end ';  //Fix for when field was in tons instead of thousands of lbs.
					obj.sql.table = 'bop_ht_chrg_mdl_data';
					obj.sql.table = 'bop_ht_chrg_mdl_data';
					obj.sql.filterLocal = " 	and " + obj.sql.table + ".last_calc_flg = 'P' \n";
					break;
				case 'ScrapModel':
					obj.sql.field = 'tot_scrap_chrg_tons';
					obj.sql.field = 
						'case \n ' +
						"  when calc_dt < '4/1/2014' then " + obj.sql.field + " * 2000 \n " +
						'  else ' + obj.sql.field + ' * 1000 \n ' +
						'end ';  //Fix for when field was in tons instead of thousands of lbs.
					obj.sql.table = 'bop_ht_chrg_mdl_data';
					obj.sql.table = 'bop_ht_chrg_mdl_data';
					obj.sql.filterLocal = " 	and " + obj.sql.table + ".last_calc_flg = 'P' \n";
					break;
				case 'MiscModel':
					obj.sql.field = 'tot_misc_tons';
					obj.sql.field = 
						'case \n ' +
						"  when calc_dt < '4/1/2014' then " + obj.sql.field + " * 2000 \n " +
						'  else ' + obj.sql.field + ' * 1000 \n ' +
						'end ';  //Fix for when field was in tons instead of thousands of lbs.
					obj.sql.table = 'bop_ht_chrg_mdl_data';
					obj.sql.table = 'bop_ht_chrg_mdl_data';
					obj.sql.filterLocal = " 	and " + obj.sql.table + ".last_calc_flg = 'P' \n";
					break;
				case 'MetalPctModel':
					obj.sql.field = 'hm_pct';
					obj.sql.table = 'bop_ht_chrg_mdl_data';
					obj.sql.filterLocal = " 	and " + obj.sql.table + ".last_calc_flg = 'P' \n";
					break;
				case 'ScrapPctModel':
					obj.sql.field = 'scrap_pct';
					obj.sql.table = 'bop_ht_chrg_mdl_data';
					obj.sql.filterLocal = " 	and " + obj.sql.table + ".last_calc_flg = 'P' \n";
					break;
				default:
					break;
			}
			obj.sql.idFull = (idMain + ' ' + type).fieldWrapAdd();
			obj.title	= idMain + ': ' + paramsNames[0];
			obj.type = 'linear';
			obj.unit = 'lb';
			obj.format = '.f';
			obj.decimals = 0;
			obj.sql.db = 'USSGLW.dbo';
			obj.sql.joinType = 'left outer join';
			break;
		case 'LadleAdd':
			var matCode = params[0];
			obj.sql.idFull = (idMain + ' ' + matCode).fieldWrapAdd();
			obj.title	= idMain + ' ' + paramsNames[0];
			obj.type = 'linear';
			obj.unit = 'lb';
			obj.format = '.f';
			obj.decimals = 0;
			obj.sql.field = 'act_wt';
			obj.sql.table = 'bop_ht_mat_add';
			obj.sql.db = 'USSGLW.dbo';
			obj.sql.filterLocal =
				" 	and " + obj.sql.table + ".mat_cd = '" + matCode + "' \n";
			obj.sql.joinType = 'left outer join';
			break;
		case 'Scrap':
			var matCode = params[0];
			obj.sql.idFull = (idMain + ' ' + matCode).fieldWrapAdd();
			obj.title = idMain + ' ' + paramsNames[0];
			obj.type = 'linear';
			obj.unit = 'lb';
			obj.format = '.f';
			obj.decimals = 0;
			obj.sql.field = 'act_wt';
			obj.sql.table = 'bop_ht_scrap_add';
			obj.sql.db = 'USSGLW.dbo';
			obj.sql.filterLocal = "  and " + obj.sql.table + ".scrp_cd = '" + matCode + "' \n";
			obj.sql.joinType = 'left outer join';
			break;
		case 'ScrapYard':
			var yard = params[0];
			obj.sql.idFull = (idMain + ' ' + yard).fieldWrapAdd();
			obj.title = idMain;
			obj.type = 'text';
			obj.unit = '';
			obj.format = '.f';
			obj.decimals = 0;
			obj.sql.field = 'box_1_scale';
			obj.sql.table = 'bop_ht_scrp_chrg';
			obj.sql.db = 'USSGLW.dbo';
			obj.sql.filterLocal = "  and " + obj.sql.table + ".box_1_scale = '" + yard + "' \n";
			obj.disableOperator = true;
			break;
		case 'Temp':
			var test = params[0];
			obj.title = idMain + ' ' + paramsNames[0];
			obj.type = 'linear';
			obj.unit = '°F';
			obj.format = '.f';
			obj.decimals = 0;
			obj.sql.idFull = (idMain + ' ' + test).fieldWrapAdd();
			switch (test) {
				case 'HMLadle':
					obj.sql.field = 'hm_ldl_act_tp';
					obj.sql.table = 'bop_ht';
					obj.sql.db = 'USSGLW.dbo';
					obj.sql.filterRealistic = obj.sql.idFull + " > 2000 \n";
					break;
				case 'Tap':
					obj.sql.field = 'tap_tp';
					obj.sql.table = 'bop_ht';
					obj.sql.db = 'USSGLW.dbo';
					obj.sql.filterRealistic = obj.sql.idFull + " > 2800 \n";
					break;
				case 'TOL':
					obj.sql.field = 'TOL_tp';
					obj.sql.table = 'bop_ht';
					obj.sql.db = 'USSGLW.dbo';
					obj.sql.filterRealistic = obj.sql.idFull + " > 2800 \n";
					break;
				case 'ArArrive':
					obj.sql.field = 'samp_tp';
					obj.sql.table = 'ms_heat_celox';
					obj.sql.db = 'USSGLW.dbo';
					obj.sql.filterLocal =
						"  and " + obj.sql.table + ".fac_id = 'A' \n" +
						"  and " + obj.sql.table + ".samp_designation = 'ARV' \n";
					obj.sql.filterRealistic = obj.sql.idFull + " > 2800 \n";
					break;
				case 'ArLeave':
					obj.sql.field = 'samp_tp';
					obj.sql.table = 'ms_heat_celox';
					obj.sql.db = 'USSGLW.dbo';
					obj.sql.filterLocal =
						"  and " + obj.sql.table + ".fac_id = 'A' \n" +
						"  and " + obj.sql.table + ".samp_designation = 'LV' \n";
					obj.sql.filterRealistic = obj.sql.idFull + " > 2800 \n";
					break;
				case 'RHArrive':
					obj.sql.field = 'samp_tp';
					obj.sql.table = 'ms_heat_celox';
					obj.sql.db = 'USSGLW.dbo';
					obj.sql.filterLocal =
						"  and " + obj.sql.table + ".fac_id = 'V' \n" +
						"  and " + obj.sql.table + ".samp_designation = 'ARV' \n";
					obj.sql.filterRealistic = obj.sql.idFull + " > 2800 \n";
					break;
				case 'RHDeox':
					obj.sql.field = 'samp_tp';
					obj.sql.table = 'ms_heat_celox';
					obj.sql.db 			= 'USSGLW.dbo';
					obj.sql.filterLocal =
						"  and " + obj.sql.table + ".fac_id = 'V' \n" +
						"  and " + obj.sql.table + ".samp_designation = 'DX' \n";
					obj.sql.filterRealistic = obj.sql.idFull + " > 2800 \n";
					break;
				case 'RHLeave':
					obj.sql.field 	= 'samp_tp';
					obj.sql.table 	= 'ms_heat_celox';
					obj.sql.db 			= 'USSGLW.dbo';
					obj.sql.filterLocal =
						"  and " + obj.sql.table + ".fac_id = 'V' \n" +
						"  and " + obj.sql.table + ".samp_designation = 'LV' \n";
					obj.sql.filterRealistic = obj.sql.idFull + " > 2800 \n";
					break;
				case 'CT1':
					obj.sql.field 	= 'samp_tp';
					obj.sql.table 	= 'ms_heat_celox';
					obj.sql.db 			= 'USSGLW.dbo';
					obj.sql.filterLocal =
						"  and " + obj.sql.table + ".fac_id = 'C' \n" +
						"  and " + obj.sql.table + ".samp_designation = 'CT1' \n";
					obj.sql.filterRealistic = obj.sql.idFull + " > 2800 \n";
					break;
				case 'CT2':
					obj.sql.field 	= 'samp_tp';
					obj.sql.table 	= 'ms_heat_celox';
					obj.sql.db 			= 'USSGLW.dbo';
					obj.sql.filterLocal =
						"  and " + obj.sql.table + ".fac_id = 'C' \n" +
						"  and " + obj.sql.table + ".samp_designation = 'CT2' \n";
					obj.sql.filterRealistic = obj.sql.idFull + " > 2800 \n";
					break;
				case 'CT3':
					obj.sql.field 	= 'samp_tp';
					obj.sql.table 	= 'ms_heat_celox';
					obj.sql.db 			= 'USSGLW.dbo';
					obj.sql.filterLocal =
						"  and " + obj.sql.table + ".fac_id = 'C' \n" +
						"  and " + obj.sql.table + ".samp_designation = 'CT3' \n";
					obj.sql.filterRealistic = obj.sql.idFull + " > 2800 \n";
					break;
				case 'AimMelter':
					obj.sql.field 	= 'melter_aim_tap_tp';
					obj.sql.table 	= 'bop_ht';
					obj.sql.db 			= 'USSGLW.dbo';
					obj.sql.filterRealistic = obj.sql.idFull + " > 2800 \n";
					break;
				case 'AimCharge':
					obj.sql.field 	= 'mdl_aim_tap_tp';
					obj.sql.table 	= 'bop_ht';
					obj.sql.db 			= 'USSGLW.dbo';
					obj.sql.filterRealistic = obj.sql.idFull + " > 2800 \n";
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
			obj.type 		= 'linear';
			obj.unit		= '°F';
			obj.format 	= '.f';
			obj.decimals = 0;
			obj.sql.field 	= ('Temp ' + test1).fieldWrapAdd() + ' - ' + ('Temp ' + test2).fieldWrapAdd();
			break;
		case 'Celox':
			var test 		= params[0];
			obj.title 	= idMain + ' ' + paramsNames[0];
			obj.type 		= 'linear';
			obj.unit 		= 'ppm';
			obj.format 	= '.f';
			obj.decimals 	= 0;
			obj.sql.idFull 	= (idMain + ' ' + test).fieldWrapAdd();
			switch (test) {
				case 'TapO2':
					obj.sql.field 	= 'tap_oxy';
					obj.sql.table 	= 'bop_ht';
					obj.sql.db 			= 'USSGLW.dbo';
					obj.sql.filterRealistic = obj.sql.idFull + " > 0 \n";
					break;
				case 'BTO':
					obj.sql.field 	= 'samp_oxy';
					obj.sql.table 	= 'ms_heat_celox';
					obj.sql.db 			= 'USSGLW.dbo';
					obj.sql.filterLocal =
						"  and " + obj.sql.table + ".fac_id = 'B' \n" +
						"  and " + obj.sql.table + ".samp_designation = 'BTO' \n";
					obj.sql.filterRealistic = obj.sql.idFull + " > 0 \n";
					break;
				case 'ArArrive':
					obj.sql.field 	= 'samp_oxy';
					obj.sql.table 	= 'ms_heat_celox';
					obj.sql.db 			= 'USSGLW.dbo';
					obj.sql.filterLocal =
						"  and " + obj.sql.table + ".fac_id = 'A' \n" +
						"  and " + obj.sql.table + ".samp_designation = 'ARV' \n";
					obj.sql.filterRealistic = obj.sql.idFull + " > 0 \n";
					break;
				case 'ArLeave':
					obj.sql.field 	= 'samp_oxy';
					obj.sql.table 	= 'ms_heat_celox';
					obj.sql.db 			= 'USSGLW.dbo';
					obj.sql.filterLocal =
						"  and " + obj.sql.table + ".fac_id = 'A' \n" +
						"  and " + obj.sql.table + ".samp_designation = 'LV' \n";
					obj.sql.filterRealistic = obj.sql.idFull + " > 0 \n";
					break;
				case 'RHArrive':
					obj.sql.field 	= 'samp_oxy';
					obj.sql.table 	= 'ms_heat_celox';
					obj.sql.db 			= 'USSGLW.dbo';
					obj.sql.filterLocal =
						"  and " + obj.sql.table + ".fac_id = 'V' \n" +
						"  and " + obj.sql.table + ".samp_designation = 'ARV' \n";
					obj.sql.filterRealistic = obj.sql.idFull + " > 0 \n";
					break;
				case 'RHDeox':
					obj.sql.field 	= 'samp_oxy';
					obj.sql.table 	= 'ms_heat_celox';
					obj.sql.db 			= 'USSGLW.dbo';
					obj.sql.filterLocal =
						"  and " + obj.sql.table + ".fac_id = 'V' \n" +
						"  and " + obj.sql.table + ".samp_designation = 'DX' \n";
					obj.sql.filterRealistic = obj.sql.idFull + " > 0 \n";
					break;
				case 'RHLeave':
					obj.sql.field 	= 'samp_oxy';
					obj.sql.table 	= 'ms_heat_celox';
					obj.sql.db 			= 'USSGLW.dbo';
					obj.sql.filterLocal =
						"  and " + obj.sql.table + ".fac_id = 'V' \n" +
						"  and " + obj.sql.table + ".samp_designation = 'LV' \n";
					obj.sql.filterRealistic = obj.sql.idFull + " > 0 \n";
					break;
				default:
					break;
			}
			break;
		case 'ChargeDTS':
			obj.sql.idFull 	= (idMain).fieldWrapAdd();
			obj.title 	= idMain;
			obj.type 		= 'datetime';
			obj.unit 		= '';
			obj.format 	= '%m/%d/%Y';
			obj.sql.field = 'chrg_dt';
			obj.sql.table = 'bop_ht';
			obj.sql.db 		= 'USSGLW.dbo';
			break;
		case 'Mg90':
			obj.sql.idFull 	= (idMain).fieldWrapAdd();
			obj.title 	= idMain;
			obj.type 		= 'linear';
			obj.unit 		= 'lbs';
			obj.format 	= '.f';
			obj.decimals 	= 0;
			obj.sql.field 	= 'dslf_act_Mg90_wt';
			obj.sql.table 	= 'bop_ht';
			obj.sql.db 		= 'USSGLW.dbo';
			obj.sql.filterRealistic = obj.sql.idFull + " > 100 \n";
			break;
		case 'Mg90Replunge':
			obj.sql.idFull 	= (idMain).fieldWrapAdd();
			obj.title 	= idMain;
			obj.type 		= 'linear';
			obj.unit 		= 'lbs';
			obj.format 	= '.f';
			obj.decimals 	= 0;
			obj.sql.field 	= 'dslf_act_rplng_Mg90_wt';
			obj.sql.table 	= 'bop_ht';
			obj.sql.db 		= 'USSGLW.dbo';
			break;
		case 'DsfSkimWt':
			obj.sql.idFull 	= (idMain).fieldWrapAdd();
			obj.title 	= idMain;
			obj.type 		= 'linear';
			obj.unit 		= 'lbs';
			obj.format 	= '.f';
			obj.decimals 	= 0;
			obj.sql.field 	= 'hm_skim_loss_wt';
			obj.sql.table 	= 'bop_ht';
			obj.sql.db 		= 'USSGLW.dbo';
			break;
		case 'RecycleWt':
			obj.sql.idFull = (idMain).fieldWrapAdd();
			obj.title 	= 'Recycled Steel';
			obj.type 		= 'linear';
			obj.unit 		= 'lbs';
			obj.format 	= '.f';
			obj.decimals 	= 0;
			obj.sql.field 	= 'recycled_wt';
			obj.sql.table 	= 'bop_recycled_ht';
			obj.sql.db 		= 'USSGLW.dbo';
			obj.sql.joinType = 'left outer join';
			break;
		case 'TapDur':
			obj.sql.idFull = (idMain).fieldWrapAdd();
			obj.title 	= 'Tap Duration';
			obj.type 		= 'linear';
			obj.unit 		= 'minutes';
			obj.format 	= '.1f';
			obj.decimals 	= 1;
			obj.sql.field 	= 'tap_dur';
			obj.sql.table 	= 'bop_ht';
			obj.sql.db 		= 'USSGLW.dbo';
			break;
		case 'Vessel':
			var vessel 	= params[0];
			obj.sql.idFull 	= (idMain + ' ' + vessel).fieldWrapAdd();
			obj.title 	= idMain;
			obj.type 		= 'text';
			obj.unit 		= '';
			obj.format 	= '.f';
			obj.decimals 	= 0;
			obj.sql.field 	= 'null';
			obj.sql.table 	= 'bop_ht';
			obj.sql.db 		= 'USSGLW.dbo';
			obj.sql.filterLocal = "  and substring(ht_num, 1, 2) = '" + vessel + "' \n";
			obj.disableOperator = true;
			break;
		case 'Degasser':
			var option 	= params[0];
			switch (option) {
				case 'RHSlagDepth':
					obj.sql.idFull = (idMain + ' ' + option).fieldWrapAdd();
					obj.title 	= 'RH Freeboard';
					obj.type 		= 'linear';
					obj.unit 		= 'inches';
					obj.format 	= '.f';
					obj.decimals 	= 0;
					obj.sql.field 	= 'meas_slag_dpth';
					obj.sql.table 	= 'degas_ht';
					obj.sql.db 		= 'USSGLW.dbo';
					break;
				case 'RHFreeboard':
					obj.sql.idFull = (idMain + ' ' + option).fieldWrapAdd();
					obj.title 	= 'RH Freeboard';
					obj.type 		= 'linear';
					obj.unit 		= 'inches';
					obj.format 	= '.f';
					obj.decimals 	= 0;
					obj.sql.field 	= 'freeboard';
					obj.sql.table 	= 'degas_ht';
					obj.sql.db 		= 'USSGLW.dbo';
					break;
				case 'RHFinalStir':
					obj.sql.idFull = (idMain + ' ' + option).fieldWrapAdd();
					obj.title 	= 'RH Final Stir Time';
					obj.type 		= 'linear';
					obj.unit 		= 'heats';
					obj.format 	= '.f';
					obj.decimals 	= 0;
					obj.sql.field 	= 'fin_stir_time';
					obj.sql.table 	= 'degas_ht';
					obj.sql.db 		= 'USSGLW.dbo';
					break;
				case 'RHHtsOnSnorkel':
					obj.sql.idFull = (idMain + ' ' + option).fieldWrapAdd();
					obj.title 	= 'RH Heats On Snorkel';
					obj.type 		= 'linear';
					obj.unit 		= 'heats';
					obj.format 	= '.f';
					obj.decimals 	= 0;
					obj.sql.field 	= 'num_hts_on';
					obj.sql.table 	= 'degas_ht_equip_usage';
					obj.sql.db 		= 'USSGLW.dbo';
					obj.sql.filterLocal = "  and degas_ht_equip_usage.equip_cd = 'UPSNKL' \n";
					break;
				default:
					break;
			}
			break;
		default:
			break;		
	}

	(obj.sql.field === undefined) ? (obj.sql.field = '') : (null);
	(obj.sql.table=== undefined) ? (obj.sql.table = '') : (null);
	(obj.sql.db === undefined) ? (obj.sql.db = '') : (null);
	(obj.sql.filterLocal === undefined) ? (obj.sql.filterLocal = '') : (null);
	(obj.sql.filterRealistic === undefined) ? (obj.sql.filterRealistic = '') : (null);
	(obj.sql.joinType === undefined) ? (obj.sql.joinType = 'inner join') : (null);
	(obj.disableOperator === undefined) ? (obj.disableOperator = false) : (null);

	return obj;
}