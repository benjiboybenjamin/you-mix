<?php

require_once(dirname(__FILE__).'/../XML/XMLFactory.php');
require_once(dirname(__FILE__).'/../MySQL/SQLMediator.php');

date_default_timezone_set('America/Los_Angeles');

define('SQLLogging', true);
define('FileLogging', false);

class LogHandler {
	
	
	public function __construct() {
		
	}
	
	public function writeLog($file, $logname, $description) {
		if (SQLLogging) {
			$this->writeLogToSQL($file, $logname, $description);
		}
		if (FileLogging) {
			$this->writeLogToFile($file, $logname, $description);
		}
	}
	
	private function writeLogToSQL($file, $logname, $description) {
		$table = 'Logs';
		$queryType = 'Insert';
		$condition = null;
		$types = array('text', 'text', 'text', 'timestamp');
		$columns = array('Filename', 'LogName', 'Description', 'Datetime');
		$now = getdate(date("U"));
		$datetime = new DateTime();
		$datetime->setDate($now['year'], $now['mon'], $now['mday']); 
	    $datetime->setTime($now['hours'] + 3 , $now['minutes'] , $now['seconds']); 
		$values = array($file, $logname, $description, $datetime->format('Y/m/d H:i:s'));
		$args = array('column' => $columns, 'value' => $values, 'type' => $types);
		$xml = $this->createXML($table, $args);
		$sql = new SQLMediator();
		$sql->connect();
		$res = $sql->query($xml, $queryType, $condition);
		$sql->disconnect();
	}
	
	private function writeLogToFile($file, $logname, $description) {
		$now = getdate(date("U"));
		$sb = "Time: " . ($now['hours'] + 3) . ":" . $now['minutes'] . ":" . $now['seconds'] . " EST on " . $now['mon'] . "/" . $now['mday'] . "/" . $now['year'] . "\n";
		$sb .= "File Name: " . $file . "\n";
		$sb .= "Log Name: " . $logname . "\n";
		$sb .= "Description: " . $description . "\n\n";
		$f = fopen("Log.txt",'a');
		fwrite($f,$sb);	
	}
	
	private function createXML($table, $args) {
		$builder = XMLFactory::Create($table);
		$builder->addDataSet($args);
		return($builder->getFinishedXML());
	}
	

}

?>