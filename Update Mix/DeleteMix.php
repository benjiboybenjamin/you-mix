<?php

require_once(dirname(__FILE__).'/../base/ExceptionHandling/GlobalExceptionHandler.php');
require_once(dirname(__FILE__).'/../base/ExceptionHandling/ErrorToException.php');
require_once(dirname(__FILE__).'/../base/XML/XMLFactory.php');
require_once(dirname(__FILE__).'/../base/MySQL/SQLMediator.php');

function error_to_exception($code, $message, $file, $line, $context) {
	if ($code != E_STRICT && $code != E_DEPRECATED) {
		throw new ErrorToException($code, $message, $file, $line, $context);
	}	
}
set_error_handler("error_to_exception");

try {
	$title = $_POST['title'];

	$sql = new SQLMediator();
	$sql->connect();
	
	deleteMixAndSongs($title, $sql);
		
	echo 'Mix deleted';
		
	$sql->disconnect();
	
}
catch (Exception $ex) {
	echo GlobalExceptionHandler::writeException($ex);
}

function deleteMixAndSongs($titleDelete, $sqlconn) {
	$titleDelete = str_replace("'", "\'", $titleDelete);
	$res = $sqlconn->complexQuery("Select", "SELECT * FROM Mixes WHERE MixName = '$titleDelete'", 'Mixes');
	$mixid = getMixId($res);
	$res = $sqlconn->complexQuery("Select", "SELECT SongId FROM MixSongs WHERE MixId = '$mixid'", 'MixSongs');
	$songids = getSongIds($res);

	$res = $sqlconn->complexQuery("Delete", "DELETE FROM Mixes WHERE MixId = '$mixid'", 'Mixes');
	foreach ($songids as $songid) {
		$res = $sqlconn->complexQuery("Delete", "DELETE FROM MixSongs WHERE MixId = '$mixid' AND SongId = '$songid'", 'MixSongs');
		$res = $sqlconn->complexQuery("Delete", "DELETE FROM Songs WHERE SongId = '$songid'", 'Songs');
		
	}
	
}

function getMixId($xmlquerydata) {
	$value = '';
	$xmlquerydata = new SimpleXMLElement($xmlquerydata);
	foreach($xmlquerydata->children() as $header) {
		foreach ($header->children() as $child) {
			if ($child->getName() == 'mixid') {
				$value = $child;
			}
		}
	}
	return $value;
}

function getSongIds($xmlquerydata) {
	$values = array();
	$xmlquerydata = new SimpleXMLElement($xmlquerydata);
	foreach($xmlquerydata->children() as $header) {
		foreach ($header->children() as $child) {
			if ($child->getName() == 'songid') {
				$values []= $child;
			}
		}
	}
	return $values;
}

?>