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
	$sql = new SQLMediator();
	
	$status = $sql->connect();
	if ($status != null) {
		echo '<error>' . $status . '</error>';
	}
	else {
		$data = getData($sql);
		echo $data;
		$sql->disconnect();
	}
}
catch (Exception $ex) {
	echo GlobalExceptionHandler::writeException($ex);
}

function getData($sqlconn) {
	$res = $sqlconn->complexQuery("Select", "SELECT * FROM Mixes WHERE Published = 'yes'", 'Mixes');
	//return($res);
	$theData = addTimesLoaded($res, $sqlconn);
	return($theData);
}

function addTimesLoaded($theRes, $sqlconn) {
	$mixnames = array();
	$mixesLoaded = array();
	$theRes = new SimpleXMLElement($theRes);
	foreach($theRes->children() as $header) {
		foreach ($header->children() as $child) {
			if ($child->getName() == 'mixid') {
				$mixesLoaded []= getMixesLoadedCount($child, $sqlconn);
			}
			if ($child->getName() == 'mixname') {
				$mixnames []= $child;
			}
		}
	}
	$table = 'Mixes';
	$args = array('mixname' => $mixnames, 'mixesLoaded' => $mixesLoaded);
	$xml = createXML($table, $args);
	return $xml;
}

function getMixesLoadedCount($mixid, $sqlconn) {
	$res = $sqlconn->getRowCount("SELECT * FROM MixesLoaded WHERE MixId = '$mixid'");
	return($res);
}

function createXML($table, $args) {
	$builder = XMLFactory::Create($table);
	$builder->addDataSet2($args);
	return($builder->getFinishedXML());
}

?>