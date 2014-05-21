<?php

require_once(dirname(__FILE__).'/MySQLConnect.php');
require_once(dirname(__FILE__).'/../XML/XMLFactory.php');

class SQLMediator{

	private $_conn = null;

	public function __construct() {
		
	}
	
	public function connect() {
		static $_conn = null;
		if ($_conn == null) {
			$this->_conn = DatabaseConnection::establishConnection('open');
			return $this->checkError($this->_conn);
		}
	}
	
	public function disconnect() {
		$this->_conn = DatabaseConnection::establishConnection('close');
	}
	
	
	//$xmlquerydata consits of the table name which is the root, the headers which is the first child and the columns value and types which are its children.
	//$querytype = Udate, Select, Insert or Delete
	//$condition is array that consists of the column, value and type 
	public function query($xmlquerydata, $queryType, $condition) {
		
		$xmlquerydata = new SimpleXMLElement($xmlquerydata);
		$table_name = $xmlquerydata->getName();
		foreach($xmlquerydata->children() as $header) {
			foreach ($header->children() as $child) {
				if ($child->getName() == 'column') {
					$columns []= $child;
				}
				else if ($child->getName() == 'value') {
					$values []= $child;
				}
				else if ($child->getName() == 'type') {
					$types [] = $child . "";
				}
			}
		}
		
		$this->_conn->loadModule('Extended');
		if ($queryType == 'Insert') {
			$field_values = $this->constructFieldValues($columns, $values);
			$res = $this->_conn->extended->autoExecute($table_name, $field_values, MDB2_AUTOQUERY_INSERT, null, $types);
		}
		else if ($queryType == 'Update') {
			$field_values = $this->constructFieldValues($columns, $values);
			$res = $this->_conn->extended->autoExecute($table_name, $field_values, MDB2_AUTOQUERY_UPDATE,  $condition[0] . '= '.$this->_conn->quote($condition[1], $condition[2]), $types);
		}
		else if ($queryType == 'Select') {
			$result_types = $this->constructResultTypes($columns, $types);
			$res = $this->_conn->extended->autoExecute($table_name, null, MDB2_AUTOQUERY_SELECT,  $condition[0] . '= '.$this->_conn->quote($condition[1], $condition[2]), null, true, $result_types);
			$res = $this->createXML($res, $table_name);
		}
		else if ($queryType == 'Delete') {
			$res = $this->_conn->extended->autoExecute($table_name, null, MDB2_AUTOQUERY_DELETE,  $condition[0] . '= '.$this->_conn->quote($condition[1], $condition[2]));
		}

        return($res);
	}
	
	public function complexQuery($qtype, $query, $table_name) {
		$res = $this->_conn->query($query);
		if ($qtype == 'Select') {
			$res = $this->createXML($res, $table_name);
			return($res);
		}
	}
	
	public function getRowCount($query) {
		$res = $this->_conn->query($query);
		return($res->numRows());
	}
	
	public function multiInsert($alldata, $allcolumns, $table_name) {
		$r = 0;
		$insertStatement = 'INSERT INTO ' . $table_name . ' (';
		foreach ($allcolumns as $column) {
			$r = $r + 1;
			$insertStatement .= $column;
			if ($r < count($allcolumns)) {
				$insertStatement .= ', ';
			}
		}
		$insertStatement .= ') VALUES (';
		for ($x=0;$x<$r;$x++) {
			$insertStatement .= '?';
			if ($x < $r-1) {
				$insertStatement .= ', ';
			}
		}
		$insertStatement .= ')';
		
		$this->_conn->loadModule('Extended', null, false);
		$sth = $this->_conn->prepare($insertStatement);
		$this->_conn->extended->executeMultiple($sth, $alldata);
	}

	public function constructFieldValues($columns, $values) {
		for ($x=0; $x<count($columns); $x++) {
			$column = $columns[$x] . "";
			$field_values[$column] = $values[$x];
		}
		return($field_values);
	}
	
	public function constructResultTypes($columns, $types) {
		for ($x=0; $x<count($columns); $x++) {
			$column = $columns[$x] . "";
			$result_types[$column] = $types[$x];
		}
		return($result_types);
	}
	
	private function createXML($data, $tablename) {
		$builder = XMLFactory::Create($tablename);
		$somestuff = "";
		while($row = $data->fetchRow(MDB2_FETCHMODE_ASSOC)) {
			$builder->addLineData($row);
		}
		return($builder->getFinishedXML());
	}
	
	private function checkError($sqlconn) {
		try {
			if (MDB2::isError($sqlconn)) {
	        	throw new Exception("Unable to connect: " . $sqlconn->getMessage());
			}
			else {
				return null;
			}
		}
		catch (Exception $ex) {
			return $ex->getMessage();
		}
	}

}

?>