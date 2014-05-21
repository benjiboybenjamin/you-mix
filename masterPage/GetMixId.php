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
	$mixName = $_POST['mixname'];
	$sql = new SQLMediator();
	$sql->connect();
	
	$id = getMix($sql, $mixName);
	echo $id;
	
	$sql->disconnect();
	
}
catch (Exception $ex) {
	echo GlobalExceptionHandler::writeException($ex);
}

function getMix($sqlconn, $theMixName) {
	$table = 'Mixes';
	$queryType = 'Select';
	$condition = array('MixName', $theMixName, 'text');
	$types = array('text');
	$columns = array('MixId');
	$values = array(null);
	$args = array('column' => $columns, 'value' => $values, 'type' => $types);
	$xml = createXML($table, $args);
	$res = $sqlconn->query($xml, $queryType, $condition);
	$mixId = getValue($res);
	if ($mixId == '') {
		$mixId = 'Id not found';
	}
	return $mixId;
	
}

function getValue($xmlquerydata) {
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

function createXML($table, $args) {
	$builder = XMLFactory::Create($table);
	$builder->addDataSet($args);
	return($builder->getFinishedXML());
}

?>