<?php

require_once(dirname(__FILE__).'/../ExceptionHandling/ErrorToException.php');
require_once(dirname(__FILE__).'/../ExceptionHandling/GlobalExceptionHandler.php');
require_once(dirname(__FILE__).'/../XML/XMLFactory.php');
require_once(dirname(__FILE__).'/../MySQL/SQLMediator.php');
require_once(dirname(__FILE__).'/../PHPMailer/class.phpmailer.php');
require_once(dirname(__FILE__).'/../../masterPage/config.php');
function error_to_exception($code, $message, $file, $line, $context) {
	if ($code != E_STRICT && $code != E_DEPRECATED) {
		throw new ErrorToException($code, $message, $file, $line, $context);
	}	
}

set_error_handler("error_to_exception");
try {
	$email = $_POST['email'];
	$sql = new SQLMediator();
	$sql->connect();
	
	$password = getPassword($email, $sql);
	
	$sql->disconnect();
	
}
catch (Exception $ex) {
	echo GlobalExceptionHandler::writeException($ex);
}

function getPassword($fEmail, $sqlconn) {
	$table = 'UserInfo';
	$queryType = 'Select';
	$condition = array('Email', $fEmail, 'text');
	$types = array('text');
	$columns = array('Password');
	$values = array(null);
	$args = array('column' => $columns, 'value' => $values, 'type' => $types);
	$xml = createXML($table, $args);
	$res = $sqlconn->query($xml, $queryType, $condition);
	$thepassword = getValue($res);
	
	if ($thepassword == '') {
		echo 'Account does not exist';
	}
	else {
		$mail = new PHPMailer(true); //New instance, with exceptions enabled
	
		$body             = "Password: " . $thepassword . "\r\nReturn to site: http://www.you-mix.com";
		$body             = preg_replace('/\\\\/','', $body); //Strip backslashes
	
		$mail->IsSMTP(); // telling the class to use SMTP
		//$mail->Host       = "mail.you-mix.com"; // SMTP server
		$mail->Host 		= "smtp.sendgrid.net";
		//$mail->Host       = "smtp.mail.me.com"; // SMTP server
		$mail->SMTPDebug  = 1;                     // enables SMTP debug information (for testing)
		                                           // 1 = errors and messages
		                                           // 2 = messages only                           // tell the class to use SMTP
		$mail->SMTPAuth   = true;                  // enable SMTP authentication
		$mail->Port       = 25;                    // set the SMTP server port
		//$mail->Port       = 587;                    // set the SMTP server port
		$mail->Username   = "seh264";    // SMTP server username
		//$mail->Username   = "seh264@gmail.com";     // SMTP server username
		$config = new config();
		$mail->Password   = $config->getSMTPPass();             // SMTP server password
	
		
		$mail->AddReplyTo("seh264@gmail.com.com","YouMix");
		
		$mail->From       = "admin@you-mix.com";
		$mail->FromName   = "YouMix";
	
		//$to = "seh264test1234@yahoo.com";
		$mail->AddAddress($fEmail);
	
		$mail->Subject  = "you-mix.com: Password retrieval";
	
		$mail->AltBody    = "To view the message, please use an HTML compatible email viewer!"; // optional, comment out and test
		$mail->WordWrap   = 80; // set word wrap
		
		$mail->MsgHTML($body);
	
		$mail->IsHTML(true); // send as HTML

		$mail->Send();
		
		echo 'Password has been sent.';
	}
	
}

function getValue($xmlquerydata) {
	$value = "";
	$xmlquerydata = new SimpleXMLElement($xmlquerydata);
	foreach($xmlquerydata->children() as $header) {
		foreach ($header->children() as $child) {
			if ($child->getName() == 'password') {
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