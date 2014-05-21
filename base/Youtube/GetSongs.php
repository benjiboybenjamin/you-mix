<?php

require_once(dirname(__FILE__).'/../ExceptionHandling/GlobalExceptionHandler.php');
require_once(dirname(__FILE__).'/../ExceptionHandling/ErrorToException.php');
require_once(dirname(__FILE__).'/../XML/XMLFactory.php');
require_once(dirname(__FILE__).'/../MySQL/SQLMediator.php');

function error_to_exception($code, $message, $file, $line, $context) {
	if ($code != E_STRICT && $code != E_DEPRECATED) {
		throw new ErrorToException($code, $message, $file, $line, $context);
	}	
}
set_error_handler("error_to_exception");

try {
	$mixTitle = $_POST['mixTitle'];
	$sql = new SQLMediator();
	$sql->connect();
	
	addToMixesLoadedTable($mixTitle, $sql);
	$xmlSongs = getSongs($mixTitle, $sql);
	echo $xmlSongs;
	
	
	$sql->disconnect();
	
}
catch (Exception $ex) {
	echo GlobalExceptionHandler::writeException($ex);
}

function addToMixesLoadedTable($loadedMixesTitle, $sqlconn) {
	$ip = $_SERVER['REMOTE_ADDR'];
	$loadedMixesTitle = str_replace("'", "\'", $loadedMixesTitle);
	$res = $sqlconn->complexQuery("Select", "SELECT * FROM Mixes WHERE MixName = '$loadedMixesTitle'", 'Mixes');
	$mixid = getMixId($res);
	
	$now = getdate(date("U"));
	$datetime = new DateTime();
	$datetime->setDate($now['year'], $now['mon'], $now['mday']);
	$datetime->setTime($now['hours'] , $now['minutes']-5 , $now['seconds']);
	$thetimestamp = $datetime->format('Y/m/d H:i:s');
	$res = $sqlconn->complexQuery("Select", "SELECT * FROM MixesLoaded WHERE IpAddress = '$ip' AND DateTime > '$thetimestamp' AND MixId = '$mixid'", 'MixesLoaded');
	$mixid2 = getMixId($res);
	
	if ($mixid2 == '') {
		$table = 'MixesLoaded';
		$queryType = 'Insert';
		$condition = null;
		$types = array('text', 'integer');
		$columns = array('IpAddress', 'MixId');
		$values = array($ip, $mixid);
		$args = array('column' => $columns, 'value' => $values, 'type' => $types);
		$xml2 = createXML($table, $args);
		$res = $sqlconn->query($xml2, $queryType, $condition);
	}
}

function getSongs($songsMixTitle, $sqlconn) {
	$songs = array();
	$startTimes = array();
	$songsMixTitle = str_replace("'", "\'", $songsMixTitle);
	$res = $sqlconn->complexQuery("Select", "SELECT * FROM Mixes WHERE MixName = '$songsMixTitle'", 'Mixes');
	$mixid = getMixId($res);
	$res = $sqlconn->complexQuery("Select", "SELECT SongId FROM MixSongs WHERE MixId = '$mixid' ORDER BY SongId", 'MixSongs');
	$songids = getSongIds($res);
	foreach ($songids as $songid) {
		$res = $sqlconn->complexQuery("Select", "SELECT * FROM Songs WHERE SongId = '$songid'", 'Songs');
		$songs []= getSong($res);
		$startTimes []= getStartTime($res);
	}
	
	$args = array('VideoId' => $songs, 'StartTime' => $startTimes);
	$xml = createXML('Songs', $args);
	
	return($xml);
	
	
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

function getSong($xmlquerydata) {
	$value = '';
	$xmlquerydata = new SimpleXMLElement($xmlquerydata);
	foreach($xmlquerydata->children() as $header) {
		foreach ($header->children() as $child) {
			if ($child->getName() == 'videoid') {
				$value = $child;
			}
		}
	}
	return $value;
}

function getStartTime($xmlquerydata) {
	$value = '';
	$xmlquerydata = new SimpleXMLElement($xmlquerydata);
	foreach($xmlquerydata->children() as $header) {
		foreach ($header->children() as $child) {
			if ($child->getName() == 'starttime') {
				$value = $child;
			}
		}
	}
	return $value;
}

function createXML($table, $args) {
	$builder = XMLFactory::Create($table);
	$builder->addDataSet2($args);
	return($builder->getFinishedXML());
}

?>