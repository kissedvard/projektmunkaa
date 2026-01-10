<?php


$servername = getenv('MYSQL_HOST') ?: "db"; 
$username   = getenv('MYSQL_USER') ?: "user_dev";
$password   = getenv('MYSQL_PASSWORD') ?: "secure_pass";
$dbname     = getenv('MYSQL_DATABASE') ?: "egyetemidb"; 

// Hibakezelés
error_reporting(E_ALL);
ini_set('display_errors', 0); 

// JSON fejléc beállítása rögtön az elején
header('Content-Type: application/json; charset=utf-8');

// Kapcsolat létrehozása
$conn = new mysqli($servername, $username, $password, $dbname);

// Kapcsolat ellenőrzése
if ($conn->connect_error) {
    sendErrorResponse("Adatbázis kapcsolati hiba: " . $conn->connect_error);
}

// Karakterkódolás beállítása (hogy az ékezetek jók legyenek)
$conn->set_charset("utf8mb4");


createTables($conn);

function createTables($conn) {
    // A te struktúrád alapján
    $tableSql = "CREATE TABLE IF NOT EXISTS register (
        reg_id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        teljes_nev VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL,
        felhasznalo VARCHAR(50) NOT NULL,
        jelszo VARCHAR(255) NOT NULL,
        terms TINYINT(1) NOT NULL DEFAULT 0,
        letrehozva_datum TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci";
    
    if (!$conn->query($tableSql)) {
        sendErrorResponse("Tábla létrehozási hiba: " . $conn->error);
    }
}

function sendErrorResponse($message) {
    echo json_encode([
        'success' => false,
        'message' => $message
    ]);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // JS-ből érkező adatoknál néha a $_POST üres, ha 'php://input'-ot használsz.
    // De ha a HTML formod standard, akkor a $_POST jó.
    
    
    
    $teljes_nev = trim($_POST['fullName'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $felhasznalo = trim($_POST['username'] ?? '');
    $jelszo = $_POST['password'] ?? '';
    $terms = isset($_POST['terms']) ? 1 : 0;
    
    $errors = [];
    
    // Validációk
    if (empty($teljes_nev) || mb_strlen($teljes_nev) < 2) {
        $errors[] = "A teljes név megadása kötelező (min. 2 karakter).";
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Érvényes e-mail cím megadása kötelező.";
    }
    if (empty($felhasznalo) || mb_strlen($felhasznalo) < 3) {
        $errors[] = "A felhasználónév min. 3 karakter.";
    }
    if (empty($jelszo) || strlen($jelszo) < 6) {
        $errors[] = "A jelszó min. 6 karakter.";
    }
    if (!$terms) {
        $errors[] = "El kell fogadnia a feltételeket.";
    }
    
    // Ha van hiba, küldjük vissza
    if (!empty($errors)) {
        sendErrorResponse(implode(' ', $errors));
    }

    // Duplikáció ellenőrzés
    $checkStmt = $conn->prepare("SELECT reg_id FROM register WHERE email = ? OR felhasznalo = ?");
    $checkStmt->bind_param("ss", $email, $felhasznalo);
    $checkStmt->execute();
    $checkStmt->store_result();
    
    if ($checkStmt->num_rows > 0) {
        sendErrorResponse("Ez az e-mail vagy felhasználónév már foglalt.");
    }
    $checkStmt->close();

    // Mentés
    $hashed_password = password_hash($jelszo, PASSWORD_DEFAULT);
    
    $stmt = $conn->prepare("INSERT INTO register (teljes_nev, email, felhasznalo, jelszo, terms) VALUES (?, ?, ?, ?, ?)");
    
    if ($stmt) {
        $stmt->bind_param("ssssi", $teljes_nev, $email, $felhasznalo, $hashed_password, $terms);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Sikeres regisztráció!'
            ]);
        } else {
            sendErrorResponse("SQL Hiba: " . $stmt->error);
        }
        $stmt->close();
    } else {
        sendErrorResponse("Adatbázis hiba (prepare).");
    }
    
    $conn->close();
    exit;
}
?>