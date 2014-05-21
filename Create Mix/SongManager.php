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

$title = $_POST['title'];
$email = $_POST['email'];
$xml = $_POST['xml'];
$publish = $_POST['publish'];
$now = getdate(date("U"));
$datetime = new DateTime();
$datetime->setDate($now['year'], $now['mon'], $now['mday']); 
$datetime->setTime($now['hours'] + 3 , $now['minutes'] , $now['seconds']); 

try {
	$sql = new SQLMediator();
	$sql->connect();
	
	$mixNameValue = checkMixName($sql, $title);
	if ($mixNameValue == '') {
		addSongs($sql, $xml, $datetime->format('Y/m/d H:i:s'));
		createMix($sql, $title, $email, $publish);
		syncMixAndSongs($sql, $title, $email, $datetime->format('Y/m/d H:i:s'));
	}
	else {
		echo 'Mix name already exists';
	}
	
	$sql->disconnect();
}
catch (Exception $ex) {
	echo GlobalExceptionHandler::writeException($ex);
}

function checkMixName($sqlconn, $titleMix) {
	$table = 'Mixes';
	$queryType = 'Select';
	$condition = array('MixName', $titleMix, 'text');
	$types = array('text', 'text');
	$columns = array('MixId');
	$values = array(null);
	$args = array('column' => $columns, 'value' => $values, 'type' => $types);
	$xml = createXML($table, $args);
	$res = $sqlconn->query($xml, $queryType, $condition);
	$mixName = getMixId($res);
	return $mixName;
}

function addSongs($sqlconn, $xmlsongs, $datetimeSongs) {
	$xmlsongs = new SimpleXMLElement($xmlsongs);
	$song = null;
	$somedata = null;
	foreach($xmlsongs->children() as $header) {
		foreach ($header->children() as $child) {
			if ($child->getName() == 'song') {
				$song = $child;
			}
			else if ($child->getName() == 'mtime') {
				$mtime = $child;
			}
			else if ($child->getName() == 'stime') {
				$stime = $child;
			}
		}
		$timeInSeconds = ($mtime * 60) + $stime;
		$somedata []= array($song, $timeInSeconds, $datetimeSongs);
	}
	
	/*
	$table = 'Songs';
	$queryType = 'Insert';
	$condition = null;
	$types = array('text', 'integer', 'timestamp');
	$columns = array('VideoId', 'StartTime', 'TimeAdded');
	
	if ($songs != null) {
		for ($x=count($songs)-1;$x>=0;$x--) {
			$timeInSeconds = ($mtimes[$x] * 60) + $stimes[$x];
			$values = array($songs[$x], $timeInSeconds, $datetimeSongs);
			$args = array('column' => $columns, 'value' => $values, 'type' => $types);
			$xml2 = createXML($table, $args);
			$res = 0;
			$res = $sqlconn->query($xml2, $queryType, $condition);
			while ($res == 0) {}
		}
	}*/
	
	$table = 'Songs';
	$columns = array('VideoId', 'StartTime', 'TimeAdded');
	if ($somedata != null) {
	$sqlconn->multiInsert($somedata, $columns, $table);		
	}
}

function createMix($sqlconn, $titleMix, $emailMix, $publishMix) {
	if ($publishMix == 'dontPublish') {
		$pvalue = 'no';
	}
	else if ($publishMix == 'publish') {
		$pvalue = 'yes';
	}
	$table = 'Mixes';
	$queryType = 'Insert';
	$condition = null;
	$types = array('text', 'text', 'text');
	$columns = array('MixName', 'Owner', 'Published');
	$values = array($titleMix, $emailMix, $pvalue);
	$args = array('column' => $columns, 'value' => $values, 'type' => $types);
	$xml2 = createXML($table, $args);
	$res = $sqlconn->query($xml2, $queryType, $condition);
}

function syncMixAndSongs($sqlconn, $titleSync, $emailSync, $datetimeSync) {
	$titleSync = str_replace("'", "\'", $titleSync);
	$res = $sqlconn->complexQuery("Select", "SELECT * FROM Mixes WHERE Owner = '$emailSync' AND MixName = '$titleSync'", 'Mixes');
	$mixid = getMixId($res);
	$res = $sqlconn->complexQuery("Select", "SELECT * FROM Songs WHERE TimeAdded = '$datetimeSync'", 'Songs');
	$songids = getSongIds($res);
	
	$table = 'MixSongs';
	$queryType = 'Insert';
	$condition = null;
	$types = array('integer', 'integer');
	$columns = array('MixId', 'SongId');
	for ($x=0; $x<count($songids); $x++) {
		$values = array($mixid, $songids[$x]);
		$args = array('column' => $columns, 'value' => $values, 'type' => $types);
		$xml2 = createXML($table, $args);
		$res = $sqlconn->query($xml2, $queryType, $condition);
	}
	
	echo "Mix created!<br/>";
	echo "Go to the <a href='' class='linkbutton' id='myMixesLinkFromCreate'>My Mixes</a> page to play your mix.";
	
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

function createXML($table, $args) {
	$builder = XMLFactory::Create($table);
	$builder->addDataSet($args);
	return($builder->getFinishedXML());
}

?>