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