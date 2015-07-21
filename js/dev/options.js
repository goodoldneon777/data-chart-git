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