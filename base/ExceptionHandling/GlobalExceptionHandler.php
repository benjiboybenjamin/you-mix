<?php

require_once(dirname(__FILE__).'/../Logging/LogHandler.php');

class GlobalExceptionHandler {

	public function __construct() {
		
	}
	
	public static function writeException($ex) {
		$lh = new LogHandler();
		$lh->writeLog(substr($ex->getFile(), strripos($ex->getFile(), "/") + 1), "Exception", "Line " . $ex->getLine() . ": " . $ex->getMessage());
				
		$sb = "";
		$sb .= "Message: " . $ex->getMessage() . "<br/>";
		$sb .= "LineNumber: " . $ex->getLine() . "<br/>";
		$sb .= "File: " . $ex->getFile() . "<br/>";
		$sb .= "Code: " . $ex->getCode() . "<br/>";
		return $sb;
	}
		
	protected $_DebugMode;
	public function getDebugMode() {
		return $this->_DebugMode;
	}
	public function setDebugMode($value) {
		$this->_DebugMode = $value;
	}
}

?>