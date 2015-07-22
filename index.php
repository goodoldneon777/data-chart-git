<!DOCTYPE HTML>
<html>

<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<title>Data Chart</title>

<!--[if lte IE 8]>
    <script type="text/javascript">
        window.location = "/upgrade-message.php";
    </script>
<![endif]-->


<script type="text/javascript" src="js/plugins/jquery-2.1.3.min.js"></script>


<link rel="stylesheet" type="text/css" href="css/style.css">
</head>



<body>

<table id="l-wrapper">
	<tr>
		<td id="l-sidebar">
			<?php require 'php/options.php'; ?>
		</td>

		<td id="l-main">
			<div id="m-graph"></div>
			<?php require 'php/moreFilters.php'; ?>
		</td>
	</tr>
</table>



<script src="js/plugins/highcharts/highcharts.js"></script>
<script src="js/plugins/highcharts/modules/exporting.js"></script>
<script src="js/plugins/moment.min.js"></script>
<script src="js/plugins/highcharts-regression.js"></script>

<script src="../../server.js"></script>
<script src="js/dist/main.min.js"></script>


<!-- <script src="pages/dataChart/dataChart.js"></script> -->




</body>



</html>
