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
					if (mMaster.x.type == 'datetime') {
						var text = 'y: ' + Highcharts.numberFormat(this.point.y, mMaster.y.decimals, '.', ',') + ' ' + mMaster.y.unit + '<br>';
						if (this.series.name == 'Heats') {
							text += 'x: ' + Highcharts.dateFormat(mMaster.x.format, this.point.x) + '<br>';
							text +=	'Heat ID: ' + this.point.info;
						} else if (this.series.name.substring(0, 7) == 'Average') {
							text += 'x: ' + Highcharts.dateFormat(mMaster.x.format, this.point.x) + ' (nearest ' + mMaster.x.round + ') <br>';
							text +=	'Heat Count: ' + this.point.info1 + ' <br>';
							text +=	'Std Dev: ' + Highcharts.numberFormat(this.point.info2, mMaster.y.decimals + 1);
						}
					} else {
						var text = 'y: ' + Highcharts.numberFormat(this.point.y, mMaster.y.decimals) + ' ' + mMaster.y.unit + '<br>';
						if (this.series.name == 'Heats') {
							text += 'x: ' + Highcharts.numberFormat(this.point.x, mMaster.x.decimals) + ' ' + mMaster.x.unit + '<br>';
							text +=	'Heat ID: ' + this.point.info;
						} else if (this.series.name.substring(0, 7) == 'Average') {
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


