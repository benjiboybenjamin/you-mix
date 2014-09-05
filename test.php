<?php 


//echo set_include_path("." . ($UserDir = dirname($_SERVER['DOCUMENT_ROOT'])) . PATH_SEPARATOR . get_include_path()); 
/*phpinfo();

echo "<br/>";
echo "<br/>";
echo "<br/>";
echo get_include_path();

echo "<br/>";
echo getcwd();


$dir = '../';
$dirs = scandir($dir);
echo '<br/>';
echo $dirs;
for ($x=0; $x<count($dirs); $x++) {
    echo $x . ': ' . $dirs[$x] . "<br/>";
}*/

/*echo getenv("VCAP_SERVICES");
echo '<br/>';
echo json_decode(getenv('VCAP_SERVICES'))->{'mysql-5.1'}[0]->{'credentials'}->{'hostname'} . '<br/>';
echo json_decode(getenv('VCAP_SERVICES'))->{'mysql-5.1'}[0]->{'credentials'}->{'username'} . '<br/>';
echo json_decode(getenv('VCAP_SERVICES'))->{'mysql-5.1'}[0]->{'credentials'}->{'password'} . '<br/>';

$afHost = json_decode(getenv('VCAP_SERVICES'))->{'mysql-5.1'}[0]->{'credentials'}->{'hostname'};
$afDB = json_decode(getenv('VCAP_SERVICES'))->{'mysql-5.1'}[0]->{'credentials'}->{'name'};
$afUser = json_decode(getenv('VCAP_SERVICES'))->{'mysql-5.1'}[0]->{'credentials'}->{'username'};
$afPass = json_decode(getenv('VCAP_SERVICES'))->{'mysql-5.1'}[0]->{'credentials'}->{'password'};
echo 'mysql://' . $afUser . ':' . $afPass . '@' . $afHost . '/' . $afDB;*/

?>