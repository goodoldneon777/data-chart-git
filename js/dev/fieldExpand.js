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
		['B_V1', 'TD'],
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
		'Al', 'V', 'Cb', 'Ti', 'B', 'N', 'Ca', 'As', 'Sb'
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

	var furnaceAddArr = [
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

	var ladleAddArr = [
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

	var scrapArr = [
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

	var scrapYardArr = [
		['E', 'East'],
		['W', 'West']
	];

	var vesselArr = ['25', '26'];

	var BOPmiscArr = [
		['Mg90', 'Desulf Mg90'],
		['Mg90Replunge', 'Desulf Mg90 (Replunge)'],
		['DsfSkimWt', 'Desulf Skim Weight'],
		['RecycleWt', 'Recycled Steel Weight'],
		['TapDur', 'Tap Duration']
	];

	var degasserMiscArr = [
		['RHSlagDepth', 'Slag Depth'],
		['RHFreeboard', 'Freeboard'],
		['RHFinalStir', 'Final Stir Time'],
		['RHHtsOnSnorkel', 'Heats on Snorkel']
	];



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
		case 'FurnaceAdd':
			selectCreate(target + ' .select1', furnaceAddArr);
			break;
		case 'LadleAdd':
			selectCreate(target + ' .select1', ladleAddArr);
			break;
		case 'Scrap':
			selectCreate(target + ' .select1', scrapArr);
			break;
		case 'ScrapYard':
			selectCreate(target + ' .select1', scrapYardArr);
			break;
		case 'Vessel':
			selectCreate(target + ' .select1', vesselArr);
			break;
		case 'BOPmisc':
			selectCreate(target + ' .select1', BOPmiscArr);
			break;
		case 'DegasserMisc':
			selectCreate(target + ' .select1', degasserMiscArr);
			break;
		default:
			break;
	}

	return html;
}