<?php 


//echo set_include_path("." . ($UserDir = dirname($_SERVER['DOCUMENT_ROOT'])) . PATH_SEPARATOR . get_include_path()); 
phpinfo();

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
}

?>