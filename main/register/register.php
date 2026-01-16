<?php

// Hibakijelzés bekapcsolása fejlesztéshez
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

// 1. ADATBÁZIS KAPCSOLAT
$servername = getenv('MYSQL_HOST') ?: "db";
$username   = getenv('MYSQL_USER') ?: "user_dev";
$password   = getenv('MYSQL_PASSWORD') ?: "secure_pass";
$dbname     = getenv('MYSQL_DATABASE') ?: "egyetemidb";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'DB Kapcsolódási hiba: ' . $conn->connect_error]);
    exit;
}
$conn->set_charset("utf8mb4");

// Segédfüggvény a válaszhoz
function sendErrorResponse($message) {
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}

// 2. ADATOK FOGADÁSA
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    
    
    $teljes_nev = trim($_POST['fullName'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $felhasznalo = trim($_POST['username'] ?? '');
    $jelszo = $_POST['password'] ?? '';
    $terms = isset($_POST['terms']) ? 1 : 0; // Checkbox kezelése

    // Alapvető ellenőrzések
    if (empty($teljes_nev) || empty($email) || empty($felhasznalo) || empty($jelszo)) {
        sendErrorResponse("Minden mezőt kötelező kitölteni!");
    }

    // Jelszó titkosítása
    $hashed_password = password_hash($jelszo, PASSWORD_DEFAULT);

    // 3. MENTÉS A 'REGISTER' TÁBLÁBA
    $sql = "INSERT INTO register (teljes_nev, email, felhasznalo, jelszo, terms) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        // Ha itt hiba van, akkor futtasd a docker resetet!
        sendErrorResponse("SQL Hiba (User prepare): " . $conn->error);
    }

    $stmt->bind_param("ssssi", $teljes_nev, $email, $felhasznalo, $hashed_password, $terms);

    if ($stmt->execute()) {
        
        
        $new_user_id = $conn->insert_id; // Az új felhasználó ID-ja

        // Itt hozzuk létre a profilt az alapértelmezett képpel
        $profile_sql = "INSERT INTO profiles (user_id, profil_kep) VALUES (?, 'default_avatar.jpg')";
        $profile_stmt = $conn->prepare($profile_sql);

        if ($profile_stmt) {
            $profile_stmt->bind_param("i", $new_user_id);
            if (!$profile_stmt->execute()) {
                error_log("Profil létrehozási hiba: " . $profile_stmt->error);
            }
            $profile_stmt->close();
        }
        
        
        
        echo json_encode(['success' => true, 'message' => 'Sikeres regisztráció!']);

    } else {
        
        sendErrorResponse("Hiba a mentésnél (pl. foglalt email): " . $stmt->error);
    }

    $stmt->close();
} else {
    sendErrorResponse("Csak POST kérés engedélyezett");
}

$conn->close();
?>