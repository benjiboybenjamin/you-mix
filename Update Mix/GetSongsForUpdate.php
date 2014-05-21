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
	$user = $_POST['user'];
	$mixTitle = $_POST['mixName'];
	$sql = new SQLMediator();
	$sql->connect();
	
	$xmlSongs = getSongs($user, $mixTitle, $sql);
	echo $xmlSongs;
	
	$sql->disconnect();
	
}
catch (Exception $ex) {
	echo GlobalExceptionHandler::writeException($ex);
}

function getSongs($songsUser, $songsMixTitle, $sqlconn) {
	$songs = array();
	$startTimes = array();
	$songsMixTitle = str_replace("'", "\'", $songsMixTitle);
	$res = $sqlconn->complexQuery("Select", "SELECT * FROM Mixes WHERE Owner = '$songsUser' AND MixName = '$songsMixTitle'", 'Mixes');
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

function getOrderNo($xmlquerydata) {
	$value = '';
	$xmlquerydata = new SimpleXMLElement($xmlquerydata);
	foreach($xmlquerydata->children() as $header) {
		foreach ($header->children() as $child) {
			if ($child->getName() == 'orderno') {
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