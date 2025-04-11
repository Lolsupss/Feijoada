<?php
// Gera key única ao acessar (para usar via encurtador)
$db = new SQLite3("database.sqlite");
$key = bin2hex(random_bytes(8));
$db->exec("INSERT INTO keys (key) VALUES ('$key')");
echo "SUA KEY: $key";
?>