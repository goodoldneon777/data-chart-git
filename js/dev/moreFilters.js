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



