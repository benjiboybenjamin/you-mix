<?php
	error_reporting(E_ERROR | E_WARNING | E_PARSE | E_NOTICE);
	session_start();
	require_once("jCryption-1.1.php");
	require_once(dirname(__FILE__).'/../../masterPage/config.php');
	
	$keyLength = 32;
	$jCryption = new jCryption();
	if(isset($_GET["generateKeypair"])) {
		$keys = $jCryption->generateKeypair($keyLength);
		$_SESSION["e"] = array("int" => $keys["e"], "hex" => $jCryption->dec2string($keys["e"],16));
		$_SESSION["d"] = array("int" => $keys["d"], "hex" => $jCryption->dec2string($keys["d"],16));
		$_SESSION["n"] = array("int" => $keys["n"], "hex" => $jCryption->dec2string($keys["n"],16));

		echo '{"e":"'.$_SESSION["e"]["hex"].'","n":"'.$_SESSION["n"]["hex"].'","maxdigits":"'.intval($keyLength*2/16+3).'"}';
	} else {
		$user = strtolower($_POST['user']);
		$password = $_POST['password'];
		
		//saving connection to variable
		$config = new config();
		$con = mysql_connect($config->getUserManagerDomain(), 'seh264', $config->getUserManagerPass());

		//checking to see if connection exists
		if(!$con)
		{
		    die('Could not connect:' . mysql_error());	
		}
		
		//connect to database
		mysql_select_db("youmixdb", $con);
		
		//querying the table and setting it to a variable
		$result = mysql_query("SELECT * FROM UserInfo WHERE Email = '$user'");

		if ($result) 
		{
			$row = mysql_fetch_array($result);	
		}
		if (($row['Email'] == $user) && ($row['Email'] != '')) 
		{
			
			$jCryption = new jCryption();
			$var = $jCryption->decrypt($password, $_SESSION["d"]["int"], $_SESSION["n"]["int"]);
			if ($row['Password'] == $var)
			{
				//$sessionid = uniqid();
				//$UserId = $row['UserId'];
				//$clientIp = $_SERVER['REMOTE_ADDR'];
				//mysql_query("DELETE FROM Session WHERE UserId='$UserId' AND ClientIp='$clientIp'");
				//mysql_query("INSERT INTO Session (UserId, ClientIp, SessionKey) VALUES ('$UserId', '$clientIp', '$sessionid')");
				echo 'Logged in!';
				//create session here
			}
			else 
			{
				echo "User found but password incorrect.";
			}
		}
		else 
		{
			echo "User not found.";
		}
		//echo "encrypted: " . $password . "   decrypted: " . $var;
	}
?>