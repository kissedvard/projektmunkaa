<?php
// register.php - JAVÍTOTT VERZIÓ

// Adatbázis kapcsolat - JAVÍTVA
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "dilo";

// Hibakezelés bekapcsolása
error_reporting(E_ALL);
ini_set('display_errors', 0); // Éles környezetben 0 legyen

// Kapcsolat létrehozása
$conn = new mysqli($servername, $username, $password);

// Kapcsolat ellenőrzése
if ($conn->connect_error) {
    sendErrorResponse("Adatbázis kapcsolati hiba: " . $conn->connect_error);
}

// Adatbázis létrehozása/kiválasztása - ÚJ
if (!$conn->select_db($dbname)) {
    $createDbSql = "CREATE DATABASE IF NOT EXISTS $dbname CHARACTER SET utf8 COLLATE utf8_hungarian_ci";
    if ($conn->query($createDbSql) === TRUE) {
        $conn->select_db($dbname);
        createTables($conn); // Táblák létrehozása
    } else {
        sendErrorResponse("Adatbázis létrehozási hiba: " . $conn->error);
    }
}

// Tábla létrehozása függvény
function createTables($conn) {
    $tableSql = "CREATE TABLE IF NOT EXISTS register (
        reg_id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        teljes_nev VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        felhasznalo VARCHAR(50) NOT NULL UNIQUE,
        jelszo VARCHAR(255) NOT NULL,
        terms TINYINT(1) NOT NULL DEFAULT 0,
        letrehozva_datum TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX email_index (email),
        INDEX felhasznalo_index (felhasznalo)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci";
    
    if (!$conn->query($tableSql)) {
        sendErrorResponse("Tábla létrehozási hiba: " . $conn->error);
    }
}

// Hiba válasz küldése
function sendErrorResponse($message) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => $message
    ]);
    exit;
}

// Adatok fogadása a POST kérésből
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Adatok ellenőrzése
    if (!isset($_POST['fullName']) || !isset($_POST['email']) || !isset($_POST['username']) || !isset($_POST['password'])) {
        sendErrorResponse("Hiányzó kötelező mezők.");
    }
    
    // Adatok tisztítása és validálása
    $teljes_nev = trim($_POST['fullName']);
    $email = trim($_POST['email']);
    $felhasznalo = trim($_POST['username']);
    $jelszo = $_POST['password'];
    $terms = isset($_POST['terms']) ? 1 : 0;
    
    // Hibaüzenetek tömbje
    $errors = [];
    
    // Validációk
    if (empty($teljes_nev) || strlen($teljes_nev) < 2) {
        $errors[] = "A teljes név megadása kötelező (minimum 2 karakter).";
    }
    
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Érvényes e-mail cím megadása kötelező.";
    }
    
    if (empty($felhasznalo) || strlen($felhasznalo) < 3) {
        $errors[] = "A felhasználónév minimum 3 karakter hosszú kell legyen.";
    }
    
    if (empty($jelszo) || strlen($jelszo) < 6) {
        $errors[] = "A jelszónak minimum 6 karakter hosszúnak kell lennie.";
    }
    
    if (!$terms) {
        $errors[] = "El kell fogadnia a felhasználási feltételeket.";
    }
    
    // Ha nincsenek hibák, akkor mentjük az adatokat
    if (empty($errors)) {
        // Ellenőrizzük, hogy létezik-e már a felhasználó vagy email
        $checkSql = "SELECT reg_id FROM register WHERE email = ? OR felhasznalo = ?";
        $checkStmt = $conn->prepare($checkSql);
        
        if ($checkStmt) {
            $checkStmt->bind_param("ss", $email, $felhasznalo);
            $checkStmt->execute();
            $checkStmt->store_result();
            
            if ($checkStmt->num_rows > 0) {
                $errors[] = "Ez az e-mail cím vagy felhasználónév már foglalt.";
            }
            $checkStmt->close();
        }
    }
    
    if (empty($errors)) {
        // Jelszó hash-elése
        $hashed_password = password_hash($jelszo, PASSWORD_DEFAULT);
        
        // SQL lekérdezés előkészítése
        $sql = "INSERT INTO register (teljes_nev, email, felhasznalo, jelszo, terms) VALUES (?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        
        if ($stmt) {
            $stmt->bind_param("ssssi", $teljes_nev, $email, $felhasznalo, $hashed_password, $terms);
            
            if ($stmt->execute()) {
                // Sikeres regisztráció
                $response = [
                    'success' => true,
                    'message' => 'Sikeres regisztráció! Most már bejelentkezhet.'
                ];
            } else {
                $response = [
                    'success' => false,
                    'message' => 'Hiba történt a regisztráció során: ' . $conn->error
                ];
            }
            
            $stmt->close();
        } else {
            $response = [
                'success' => false,
                'message' => 'Hiba történt az adatbázis kapcsolatban.'
            ];
        }
    } else {
        // Validációs hibák
        $response = [
            'success' => false,
            'message' => implode('<br>', $errors)
        ];
    }
    
    // JSON válasz küldése
    header('Content-Type: application/json');
    echo json_encode($response);
    
    // Kapcsolat bezárása
    $conn->close();
    exit;
}
?>