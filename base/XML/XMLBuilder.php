<?

class XMLBuilder {
	
	private $_doc;
	private $_root;
	private $_header = 0;
	
	public function __construct($tableid) {
		$this->_doc = new DomDocument('1.0');
		
		$this->_root = $this->_doc->createElement($tableid);
		$this->_root = $this->_doc->appendChild($this->_root);
	}
	
	public function addLineData($rowData) {
		$header = 'header';
		$occ = $this->_doc->createElement($header);
		$occ = $this->_root->appendchild($occ);
		$this->_header++;
		foreach ($rowData as $fieldname => $fieldvalue) {
			$child = $this->_doc->createElement($fieldname);
			$child = $occ->appendChild($child);
			$value = $this->_doc->createTextNode($fieldvalue);
			$value = $child->appendChild($value);
		}
	}
	
	public function addDataSet($tableData) {
		$dataHeaders = array_keys($tableData);
		$dataArrayValues = array_values($tableData);
		$totalHeaders = count($dataHeaders);
		$totalValuesInArrays = count($dataArrayValues[0]);
		for($z=0; $z<$totalValuesInArrays; $z++) {
			$header = 'header' . $z;
			$occ = $this->_doc->createElement($header);
			$occ = $this->_root->appendchild($occ);
			for ($y=0; $y<$totalHeaders; $y++) {
				$child = $this->_doc->createElement($dataHeaders[$y]);
				$child = $occ->appendchild($child);
				$value = $this->_doc->createTextNode($dataArrayValues[$y][$z]);
				$value = $child->appendChild($value);				
			}
		}
	}
	
	public function addDataSet2($tableData) {
		$dataHeaders = array_keys($tableData);
		$dataArrayValues = array_values($tableData);
		$totalHeaders = count($dataHeaders);
		$totalValuesInArrays = count($dataArrayValues[0]);
		for($z=0; $z<$totalValuesInArrays; $z++) {
			$header = 'header';
			$occ = $this->_doc->createElement($header);
			$occ = $this->_root->appendchild($occ);
			for ($y=0; $y<$totalHeaders; $y++) {
				$child = $this->_doc->createElement($dataHeaders[$y]);
				$child = $occ->appendchild($child);
				$value = $this->_doc->createTextNode($dataArrayValues[$y][$z]);
				$value = $child->appendChild($value);				
			}
		}
	}
	
	public function getFinishedXML() {
		return $this->_doc->saveXML();
	}
}

?>