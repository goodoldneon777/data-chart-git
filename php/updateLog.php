<?php
header('Content-Type: application/json');

$mMaster = json_decode($_POST["mMaster"]);
$duration = json_decode($_POST["duration"]);
$user = json_decode($_POST["user"]);
$ip = json_decode($_POST["ip"]);
$error = json_decode($_POST["error"]);
$me = json_decode($_POST["me"]);
$test = json_decode($_POST["test"]);

$x = $mMaster->x;
$y = $mMaster->y;
if ( isset($mMaster->moreFilters->eachFilter[0]) ) {
	$f1 = $mMaster->moreFilters->eachFilter[0];
} else {
	$f1 = new stdClass;
	$f1->sql = new stdClass;
	$f1->sql->idMain = '';
	$f1->sql->idFull = '';
	$f1->sql->field = '';
}
if ( isset($mMaster->moreFilters->eachFilter[1]) ) {
	$f2 = $mMaster->moreFilters->eachFilter[1];
} else {
	$f2 = new stdClass;
	$f2->sql = new stdClass;
	$f2->sql->idMain = '';
	$f2->sql->idFull = '';
	$f2->sql->field = '';
}
if ( isset($mMaster->moreFilters->eachFilter[2]) ) {
	$f3 = $mMaster->moreFilters->eachFilter[2];
} else {
	$f3 = new stdClass;
	$f3->sql = new stdClass;
	$f3->sql->idMain = '';
	$f3->sql->idFull = '';
	$f3->sql->field = '';
}


$x->sql->field = escapesOnQuotes($x->sql->field);
$y->sql->field = escapesOnQuotes($y->sql->field);
$mMaster->sql->mainQuery = escapesOnQuotes($mMaster->sql->mainQuery);

if ($f1->sql->query) {
	$f1->sql->field = escapesOnQuotes($f1->sql->field);
}
if ($f2->sql->query) {
	$f2->sql->field = escapesOnQuotes($f2->sql->field);
}
if ($f3->sql->query) {
	$f3->sql->field = escapesOnQuotes($f3->sql->field);
}



$query =
	"insert into log_usage (duration, user, ip, \n" .
	"  x_idmain, x_idfull, x_field, x_round, \n" .
	"  y_idmain, y_idfull, y_field, \n" .
	"  f1_idmain, f1_idfull, f1_field, \n" .
	"  f2_idmain, f2_idfull, f2_field, \n" .
	"  f3_idmain, f3_idfull, f3_field, \n" .
	"  date_min, query, error, me, test \n" .
	") \n" .
	"values ('" . $duration . "', '" . $user . "', '" . $ip . "', " .
	"  '" . $x->idMain . "', '" . $x->sql->idFull . "', '" . $x->sql->field . "', '" . $x->round . "', \n" .
	"  '" . $y->idMain . "', '" . $y->sql->idFull . "', '" . $y->sql->field . "', \n" .
	"  '" . $f1->idMain . "', '" . $f1->sql->idFull . "', '" . $f1->sql->field . "', \n" .
	"  '" . $f2->idMain . "', '" . $f2->sql->idFull . "', '" . $f2->sql->field . "', \n" .
	"  '" . $f3->idMain . "', '" . $f3->sql->idFull . "', '" . $f3->sql->field . "', \n" .
	"  '" . $mMaster->filter->timeMin . "', '" . $mMaster->sql->mainQuery . "', '" . $error . "', '" . $me . "', '" . $test . "' \n" .
	") \n";

$query = str_replace("''", "null", $query);

echo json_encode($query);

$db = mysqli_connect("localhost", "root", "steel87", "data_chart");


/* check connection */
if (mysqli_connect_errno()) {
    exit();
}


$result = mysqli_query($db, $query);







mysqli_close($db);



function escapesOnQuotes($str) {
	$str = str_replace("'", "\'", $str);
	$str = str_replace('"', '\"', $str);
	return $str;
}


?>