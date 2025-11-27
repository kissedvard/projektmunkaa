<?php
// test.php - Adatbázis kapcsolat teszt
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "dilo";

echo "<h2>Adatbázis kapcsolat teszt</h2>";

// 1. Alap kapcsolat teszt
$conn = new mysqli($servername, $username, $password);
if ($conn->connect_error) {
    die("❌ MySQL kapcsolat sikertelen: " . $conn->connect_error);
}
echo "✅ MySQL szerver elérhető<br>";

// 2. Adatbázis létezés ellenőrzése
if (!$conn->select_db($dbname)) {
    echo "❌ Adatbázis ('$dbname') nem létezik<br>";
    
    // Próbáljuk létrehozni
    $sql = "CREATE DATABASE IF NOT EXISTS $dbname CHARACTER SET utf8 COLLATE utf8_hungarian_ci";
    if ($conn->query($sql) === TRUE) {
        echo "✅ Adatbázis létrehozva<br>";
        $conn->select_db($dbname);
    } else {
        die("❌ Adatbázis létrehozási hiba: " . $conn->error);
    }
} else {
    echo "✅ Adatbázis ('$dbname') elérhető<br>";
}

// 3. Tábla létezés ellenőrzése
$table_check = $conn->query("SHOW TABLES LIKE 'register'");
if ($table_check->num_rows == 0) {
    echo "❌ 'register' tábla nem létezik<br>";
    
    // Tábla létrehozása
    $table_sql = "CREATE TABLE register (
        reg_id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        teljes_nev VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        felhasznalo VARCHAR(50) NOT NULL UNIQUE,
        jelszo VARCHAR(255) NOT NULL,
        terms TINYINT(1) NOT NULL DEFAULT 0,
        letrehozva_datum TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci";
    
    if ($conn->query($table_sql) === TRUE) {
        echo "✅ 'register' tábla létrehozva<br>";
    } else {
        die("❌ Tábla létrehozási hiba: " . $conn->error);
    }
} else {
    echo "✅ 'register' tábla létezik<br>";
}

// 4. Teszt adat beszúrása
$test_name = "Teszt Felhasználó";
$test_email = "test@example.com";
$test_username = "testuser";
$test_password = password_hash("test123", PASSWORD_DEFAULT);

$insert_sql = "INSERT INTO register (teljes_nev, email, felhasznalo, jelszo, terms) VALUES (?, ?, ?, ?, 1)";
$stmt = $conn->prepare($insert_sql);

if ($stmt) {
    $stmt->bind_param("ssss", $test_name, $test_email, $test_username, $test_password);
    
    if ($stmt->execute()) {
        echo "✅ Teszt adat beszúrása sikeres<br>";
    } else {
        echo "❌ Teszt adat beszúrási hiba: " . $stmt->error . "<br>";
    }
    $stmt->close();
} else {
    echo "❌ Prepare hiba: " . $conn->error . "<br>";
}

$conn->close();
echo "<h3>✅ Teszt befejezve</h3>";
?>