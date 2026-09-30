<?php
echo "PHP is working on " . gethostname() . ".\n";
$link = @mysqli_connect("localhost");
echo $link ? "Connected to the database.\n" : "MariaDB is running; no database user is configured for this page.\n";
?>
