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


	return obj;
}
