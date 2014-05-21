<?php

require_once('base/ExceptionHandling/GlobalExceptionHandler.php');
require_once('base/ExceptionHandling/ErrorToException.php');
require_once('base/XML/XMLFactory.php');
require_once('base/MySQL/SQLMediator.php');

function error_to_exception($code, $message, $file, $line, $context) {
	if ($code != E_STRICT && $code != E_DEPRECATED) {
		throw new ErrorToException($code, $message, $file, $line, $context);
	}	
}
set_error_handler("error_to_exception");

try {
	echo "<html>
			<head>
				<title>Video Factory</title>
				<link rel='shortcut icon' href='favicon.png' type='img/x-icon'/>
				<link rel='stylesheet' type='text/css' href='masterPage/main.css'/>
			</head>
			<body>
				<div id='activatePage' class='container'>
					<div class='col-xs-12 activateContainer'>
					<p id='activateTitle' class='col-xs-'12>Video Factory</p>
				";
	$key = $_GET['key'];
	$sqlconn = new SQLMediator();
	$sqlconn->connect();
	$values = getValuesFromTempTable($key, $sqlconn);
	if (count($values) == 0) {
		echo 'Key not found<br/>';
		echo "<a class='activateLink' href='/'>Return to site</a>";		
	}
	else {
		$userExists = checkIfUserExists($values['Email'], $sqlconn);
		if ($userExists) {
			echo 'User already has an active account<br/>';
			echo "<a class='activateLink' href='/'>Return to site</a>";	
		} else {
			addToUserInfoTable($values, $sqlconn);
			deleteValuesFromTempTable($values['Email'], $sqlconn);
			echo 'Account is now active!<br/>';
			echo "<a class='activateLink' href='/'>Return to site</a>";	
		}
		
	}
	$sqlconn->disconnect();
	echo "		</div>
				</div>
			</body>
		</html>";
	
	
	
}
catch (Exception $ex) {
	echo GlobalExceptionHandler::writeException($ex);
}

function getValuesFromTempTable($thekey, $sql) {//Returnes the following array('Email' => value, 'Password' => value, 'ActivateKey' => value)
	$table = 'TempUser';
	$queryType = 'Select';
	$condition = array('activatekey', $thekey, 'text');
	$types = array('text', 'text', 'text');
	$columns = array('Email', 'Password', 'ActivateKey');
	$values = array(null, null, null);
	$args = array('column' => $columns, 'value' => $values, 'type' => $types);
	$xml = createXML($table, $args);
	$res = $sql->query($xml, $queryType, $condition);
	return(getValues($res));
}

function checkIfUserExists($emailCheck, $sql) {
	$table = 'UserInfo';
	$queryType = 'Select';
	$condition = array('Email', $emailCheck, 'text');
	$types = array('text');
	$columns = array('Email');
	$values = array(null);
	$args = array('column' => $columns, 'value' => $values, 'type' => $types);
	$xml = createXML($table, $args);
	$res = $sql->query($xml, $queryType, $condition);
	$checkValues = getValues($res);
	if (count($checkValues) > 0) {
		return true;
	}
	else {
		return false;
	}
}

function addToUserInfoTable($thevalues, $sql) {
	$table = 'UserInfo';
	$queryType = 'Insert';
	$condition = array(null, null, null);
	$types = array('text', 'text');
	$columns = array('Email', 'Password');
	$somevalues = array($thevalues['Email'], $thevalues['Password']);
	$args = array('column' => $columns, 'value' => $somevalues, 'type' => $types);
	$xml = createXML($table, $args);
	$res = $sql->query($xml, $queryType, $condition);
}

function deleteValuesFromTempTable($emailDelete, $sql) {
	$table = 'TempUser';
	$queryType = 'Delete';
	$condition = array('Email', $emailDelete, 'text');
	$types = array('text');
	$columns = array('Email');
	$somevalues = array(null);
	$args = array('column' => $columns, 'value' => $somevalues, 'type' => $types);
	$xml = createXML($table, $args);
	$res = $sql->query($xml, $queryType, $condition);
}

function getValues($xmlquerydata) {
	$values = array();
	$xmlquerydata = new SimpleXMLElement($xmlquerydata);
	foreach($xmlquerydata->children() as $header) {
		foreach ($header->children() as $child) {
			if ($child->getName() == 'email') {
				$values['Email'] = $child;
			}
			if ($child->getName() == 'password') {
				$values['Password'] = $child;
			}
			if ($child->getName() == 'activatekey') {
				$values['ActivateKey'] = $child;
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