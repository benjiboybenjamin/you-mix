<?php

require_once(dirname(__FILE__).'/../ExceptionHandling/ErrorToException.php');
require_once(dirname(__FILE__).'/../ExceptionHandling/GlobalExceptionHandler.php');
require_once(dirname(__FILE__).'/../Logging/LogHandler.php');
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

$email = $_POST['email'];
$password = $_POST['password'];
$password2 = $_POST['password2'];

try {
	$sql = new SQLMediator();
	$sql->connect();
	
	$userExists = checkIfUserExists($email, $sql);
	if ($userExists) {
		echo 'An account with that email already exits.';
	}
	else {
		$activationKey = uniqid();
		
		$table = 'TempUser';
		$queryType = 'Insert';
		$condition = null;
		$types = array('text', 'text', 'text');
		$columns = array('Email', 'Password', 'ActivateKey');
		$values = array($email, $password, $activationKey);
		$args = array('column' => $columns, 'value' => $values, 'type' => $types);
		$xml = createXML($table, $args);	
		$res = $sql->query($xml, $queryType, $condition);
		
		$mail = new PHPMailer(true); //New instance, with exceptions enabled
	
		$body             = "To activate your account you must open the following link: http://www.you-mix.com/Activate.php?key=" . $activationKey;
		$body             = preg_replace('/\\\\/','', $body); //Strip backslashes
	
		$mail->IsSMTP(); // telling the class to use SMTP
		//$mail->Host       = "mail.you-mix.com"; // SMTP server
		$mail->Host 		= "smtp.sendgrid.net";
		$mail->SMTPDebug  = 1;                     // enables SMTP debug information (for testing)
		                                           // 1 = errors and messages
		                                           // 2 = messages only                           // tell the class to use SMTP
		$mail->SMTPAuth   = true;                  // enable SMTP authentication
		$mail->Port       = 25;                    // set the SMTP server port
		//$mail->Username   = "admin@you-mix.com";     // SMTP server username
		$mail->Username   = "seh264";
		$config = new config();
		$mail->Password   = $config->getSMTPPass();            // SMTP server password
	
		
		$mail->AddReplyTo("seh264@gmail.com.com","YouMix");
		
		$mail->From       = "admin@you-mix.com";
		$mail->FromName   = "YouMix";
	
		//$to = "seh264test1234@yahoo.com";
		$mail->AddAddress($email);
	
		$mail->Subject  = "you-mix.com: Account activation";
	
		$mail->AltBody    = "To view the message, please use an HTML compatible email viewer!"; // optional, comment out and test
		$mail->WordWrap   = 80; // set word wrap
		
		$mail->MsgHTML($body);
	
		$mail->IsHTML(true); // send as HTML

		$mail->Send();
		
		echo 'Message has been sent.';
	}
	
	$sql->disconnect();

} catch (phpmailerException $e) {
	echo $e->errorMessage();
}
catch (Exception $ex) {
	echo GlobalExceptionHandler::writeException($ex);
}

function checkIfUserExists($emailCheck, $sqlconn) {
	$table = 'UserInfo';
	$queryType = 'Select';
	$condition = array('Email', $emailCheck, 'text');
	$types = array('text');
	$columns = array('Email');
	$values = array(null);
	$args = array('column' => $columns, 'value' => $values, 'type' => $types);
	$xml = createXML($table, $args);
	$res = $sqlconn->query($xml, $queryType, $condition);
	$checkValues = getValues($res);
	if ($checkValues . "" == strtolower($emailCheck) . "") {
		return true;
	}
	else {
		return false;
	}
}

function getValues($xmlquerydata) {
	$value = '';
	$xmlquerydata = new SimpleXMLElement($xmlquerydata);
	foreach($xmlquerydata->children() as $header) {
		foreach ($header->children() as $child) {
			if ($child->getName() == 'email') {
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