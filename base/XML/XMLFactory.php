<?php

require_once(dirname(__FILE__).'/XMLBuilder.php');

class XMLFactory {
	
	public static function Create($table) {
		return new XMLBuilder($table);
	}
	
}

?>