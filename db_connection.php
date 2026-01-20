<?php

if (session_status() == PHP_SESSION_NONE) {
    session_set_cookie_params(0, '/'); 
    session_start();
}


$servername = getenv('MYSQL_HOST') ?: "db";
$username   = getenv('MYSQL_USER') ?: "user_dev";
$password   = getenv('MYSQL_PASSWORD') ?: "secure_pass";
$dbname     = getenv('MYSQL_DATABASE') ?: "egyetemidb";

// Kapcsolat létrehozása
$conn = new mysqli($servername, $username, $password, $dbname);

// Kapcsolat ellenőrzése
if ($conn->connect_error) {
    // JSON választ adunk hiba esetén is, hogy a JS kezelni tudja
    die(json_encode([
        'success' => false, 
        'message' => 'Adatbázis kapcsolódási hiba: ' . $conn->connect_error
    ]));
}

$conn->set_charset("utf8mb4");

function sendErrorResponse($message) {
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}
?>