<?php
// Fájl helye: PROJEKT_GYÖKÉR/login.php

// 1. Munkamenet indítása (NAGYON FONTOS: ez jegyzi meg, hogy be vagy lépve)
session_start();

// Beállítjuk, hogy a válasz JSON formátumú legyen
header('Content-Type: application/json; charset=utf-8');

// 2. Adatbázis kapcsolat (Docker környezeti változókból)
$servername = getenv('MYSQL_HOST') ?: "db";
$username   = getenv('MYSQL_USER') ?: "user_dev";
$password   = getenv('MYSQL_PASSWORD') ?: "secure_pass";
$dbname     = getenv('MYSQL_DATABASE') ?: "egyetemidb";

$conn = new mysqli($servername, $username, $password, $dbname);

// Hibaellenőrzés
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Adatbázis kapcsolódási hiba']);
    exit;
}
$conn->set_charset("utf8mb4");

// 3. Adatok feldolgozása (csak POST kérés esetén)
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // A HTML űrlap mezőinek nevei (name="username", name="password")
    $user_input = trim($_POST['username'] ?? '');
    $pass_input = $_POST['password'] ?? '';

    if (empty($user_input) || empty($pass_input)) {
        echo json_encode(['success' => false, 'message' => 'Kérlek töltsd ki mindkét mezőt!']);
        exit;
    }

    // 4. Felhasználó keresése (Felhasználónév VAGY Email alapján)
    // A "register" táblában keresünk
    $sql = "SELECT reg_id, teljes_nev, felhasznalo, jelszo FROM register WHERE felhasznalo = ? OR email = ?";
    
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'SQL Hiba: ' . $conn->error]);
        exit;
    }

    $stmt->bind_param("ss", $user_input, $user_input);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $row = $result->fetch_assoc();

        // 5. Jelszó ellenőrzése (Hash összehasonlítása)
        if (password_verify($pass_input, $row['jelszo'])) {
            
            // SIKER! Mentsük el a munkamenetbe az adatokat
            $_SESSION['user_id'] = $row['reg_id'];       // Ez a legfontosabb (az ID)
            $_SESSION['username'] = $row['felhasznalo']; // A neve, hogy ki tudjuk írni

            echo json_encode([
                'success' => true, 
                'message' => 'Sikeres bejelentkezés!',
                'user' => $row['teljes_nev'] // Visszaküldjük a nevet is
            ]);

        } else {
            // Hibás jelszó
            echo json_encode(['success' => false, 'message' => 'Hibás jelszó!']);
        }
    } else {
        // Nincs ilyen felhasználó
        echo json_encode(['success' => false, 'message' => 'Nincs ilyen felhasználó vagy email.']);
    }
    
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Csak POST kérés engedélyezett']);
}

$conn->close();
?>