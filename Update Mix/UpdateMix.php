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
	$email = $_POST['email'];
	$xml = $_POST['xml'];
	$publish = $_POST['publish'];
	$now = getdate(date("U"));
	$datetime = new DateTime();
	$datetime->setDate($now['year'], $now['mon'], $now['mday']); 
	$datetime->setTime($now['hours'] + 3 , $now['minutes'] , $now['seconds']);
	
	$sql = new SQLMediator();
	$sql->connect();
	
	clearSongs($title, $email, $sql);
	addSongs($sql, $xml, $datetime->format('Y/m/d H:i:s'));
	syncMixAndSongs($sql, $title, $email, $datetime->format('Y/m/d H:i:s'));
	setPublish($title, $email, $publish, $sql);
	
	echo 'Mix updated!';
		
	$sql->disconnect();
	
}
catch (Exception $ex) {
	echo GlobalExceptionHandler::writeException($ex);
}

function clearSongs($titleClear, $emailClear, $sqlconn) {
	$titleClear = str_replace("'", "\'", $titleClear);
	$res = $sqlconn->complexQuery("Select", "SELECT * FROM Mixes WHERE Owner = '$emailClear' AND MixName = '$titleClear'", 'Mixes');
	$mixid = getMixId($res);
	$res = $sqlconn->complexQuery("Select", "SELECT SongId FROM MixSongs WHERE MixId = '$mixid'", 'MixSongs');
	$songids = getSongIds($res);

	foreach ($songids as $songid) {
		$res = $sqlconn->complexQuery("Delete", "DELETE FROM MixSongs WHERE MixId = '$mixid' AND SongId = '$songid'", 'MixSongs');
		$res = $sqlconn->complexQuery("Delete", "DELETE FROM Songs WHERE SongId = '$songid'", 'Songs');
		
	}
}

function addSongs($sqlconn, $xmlsongs, $datetimeSongs) {
	$xmlsongs = new SimpleXMLElement($xmlsongs);
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
	
	$table = 'Songs';
	$columns = array('VideoId', 'StartTime', 'TimeAdded');
	if ($somedata != null) {
		$sqlconn->multiInsert($somedata, $columns, $table);
	}
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
	
}

function setPublish($titlePublish, $emailPublish, $publishValue, $sqlconn) {
	$titlePublish = str_replace("'", "\'", $titlePublish);
	if ($publishValue == 'publish') {
		$res = $sqlconn->complexQuery("Update", "UPDATE Mixes SET Published='yes' WHERE Owner = '$emailPublish' AND MixName = '$titlePublish'", 'Mixes');
	}
	else if ($publishValue == 'dontPublish') {
		$res = $sqlconn->complexQuery("Update", "UPDATE Mixes SET Published='no' WHERE Owner = '$emailPublish' AND MixName = '$titlePublish'", 'Mixes');
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

function createXML($table, $args) {
	$builder = XMLFactory::Create($table);
	$builder->addDataSet($args);
	return($builder->getFinishedXML());
}

?>