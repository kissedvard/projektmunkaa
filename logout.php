<?php
session_start();
// Minden session változó törlése
$_SESSION = array();

// A session megsemmisítése
session_destroy();

// Válasz küldése a JavaScriptnek
echo json_encode(['success' => true]);
?>