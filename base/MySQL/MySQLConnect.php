<?php

error_reporting(E_ERROR | E_WARNING | E_PARSE | E_NOTICE);

set_include_path(dirname(__FILE__)."/../PEAR/php");
require_once(dirname(__FILE__).'/../PEAR/php/MDB2.php');
require_once(dirname(__FILE__).'/../XML/XMLFactory.php');
require_once(dirname(__FILE__).'/../../masterPage/config.php');


class DatabaseConnection {

	private function __construct() {

	}

	public static function establishConnection($cmd) {
		$config = new config();
		$dsn = $config->getDSN();
		
		if ($cmd = 'open') {
			return MDB2::connect($dsn);
		}
		else if ($cmd = 'close') {
			return null;
		}
	}
	
}

?>