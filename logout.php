<?php
// 1. Session indítása a közös fájlon keresztül (így biztonságos)
require_once 'db_connection.php'; 

// 2. Minden session változó törlése (szerver oldalon)
$_SESSION = array();

// 3. A MUNKAMENET SÜTI TÖRLÉSE A BÖNGÉSZŐBŐL (Ez hiányzott!)
// Ez garantálja, hogy a böngésző elfelejtse a session ID-t
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// 4. A munkamenet végleges megsemmisítése
session_destroy();

// 5. JSON fejléc beállítása (hogy a JS tudja, hogy ez adat)
header('Content-Type: application/json');
echo json_encode(['success' => true]);
?>