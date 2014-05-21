<?php

require_once(dirname(__FILE__).'/../Logging/LogHandler.php');

class ErrorToException extends Exception{
	
	protected $_DebugMode = true;
	public function getDebugMode() {
		return $this->_DebugMode;
	}
	public function setDebugMode( $value ) {
        $this->_DebugMode = $value;
    }
	
	protected $_Context = null;
	public function getContext(){
		return $this->__Context;
	}
	public function setContext( $value ) {
        $this->_Context = $value;
    }

    public function __construct( $code, $message, $file, $line, $context ) {
        parent::__construct( $message, $code );

        $this->file = $file;
        $this->line = $line;
        $this->setContext( $context );
    }

}

?>