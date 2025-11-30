<?php
// 1. ADATBÁZIS PARAMÉTEREK BEOLVASÁSA
// A host neve a docker-compose.yml-ben a 'db' szolgáltatás neve, 
// a többi paraméter pedig az 'environment' részben lett beállítva.

$servername = "db";
$username = "user_dev";
$password = "secure_pass";
$dbname = "egyetemidb";

// 2. KAPCSOLAT LÉTREHOZÁSA
// A @ jel elnyomja a hibaüzeneteket, ha a kapcsolat meghiúsul (éles környezetben nem ajánlott).
$conn = @new mysqli($servername, $username, $password, $dbname);

// 3. KAPCSOLAT ELLENŐRZÉSE
if ($conn->connect_error) {
    // Ha a kapcsolat sikertelen:
    $db_status = "❌ **Hiba:** Sikertelen adatbázis csatlakozás!";
    $error_details = "Részletek: " . $conn->connect_error;
    $db_color = "red";
} else {
    // Ha a kapcsolat sikeres:
    $db_status = "✅ **Siker!** Sikeresen csatlakoztál a MySQL adatbázishoz.";
    $error_details = "Kapcsolat állapota: Működik (Host: {$servername})";
    $db_color = "green";
    
    // Állítsuk be a karakterkódolást UTF-8-ra
    $conn->set_charset("utf8mb4");
}

// ---------------------------------------------
// 4. EREDMÉNY KIÍRÁSA (HTML formázással)
// ---------------------------------------------
?>
<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="UTF-8">
    <title>Docker PHP-MySQL Kapcsolat Teszt</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px; }
        h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; }
        .status { padding: 10px; border-radius: 4px; font-weight: bold; margin-top: 15px; }
        .red { background-color: #fdd; border: 1px solid #f66; color: #a00; }
        .green { background-color: #dfd; border: 1px solid #6c6; color: #080; }
        .details { margin-top: 10px; font-size: 0.9em; color: #555; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🐳 Docker-Compose Teszt</h1>
        
        <h2>Adatbázis Csatlakozás Ellenőrzése</h2>
        
        <div class="status <?php echo $db_color; ?>">
            <?php echo $db_status; ?>
        </div>
        
        <div class="details">
            <?php echo $error_details; ?>
        </div>
        
        <?php if (!isset($conn->connect_error)): ?>
            <hr>
            <h3>Példa Lekérdezés (Felhasználók száma)</h3>
            <?php
            // Feltételezve, hogy létezik egy 'users' tábla az SQL fájljaidban
            $result = $conn->query("SELECT COUNT(*) AS user_count FROM users");
            
            if ($result) {
                $row = $result->fetch_assoc();
                echo "<p>Jelenleg **{$row['user_count']}** felhasználó van az adatbázisban.</p>";
            } else {
                echo "<p style='color:orange;'>⚠️ **Figyelem:** A 'users' tábla nem található, vagy hiba történt a lekérdezés során.</p>";
            }
            
            // Kapcsolat bezárása
            $conn->close();
            ?>
        <?php endif; ?>

    </div>
</body>
</html>