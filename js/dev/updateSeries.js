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