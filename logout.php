<?php
// 1. Session indítása a közös fájlon keresztül
require_once 'db_connection.php'; 

// 2. Minden session változó törlése 
$_SESSION = array();

// 3. A munkamenet cookie törlése 
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// 4. A munkamenet végleges megsemmisítése
session_destroy();

// 5. JSON fejléc beállítása 
header('Content-Type: application/json');
echo json_encode(['success' => true]);
?>