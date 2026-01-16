<?php

header('Content-Type: application/json; charset=utf-8');
require_once 'db_connection.php';


if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Nincs bejelentkezve!']);
    exit;
}


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Ellenőrizzük, hogy jött-e fájl
    if (!isset($_FILES['fileInput']) || $_FILES['fileInput']['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['success' => false, 'message' => 'Nem választottál ki képet, vagy hiba történt!']);
        exit;
    }

    $file = $_FILES['fileInput'];
    $caption = $_POST['imageCaption'] ?? '';
    $userId = $_SESSION['user_id'];

    // Biztonsági ellenőrzések (Kép típus)
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($file['type'], $allowedTypes)) {
        echo json_encode(['success' => false, 'message' => 'Csak JPG, PNG, GIF és WEBP képek engedélyezettek!']);
        exit;
    }

    // Fájl mentése az 'uploads' mappába
    $uploadDir = 'uploads/';
    
    // Ha nincs uploads mappa, próbáljuk létrehozni (bár jobb kézzel létrehozni előtte)
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // Egyedi fájlnév generálása (hogy ne írják felül egymást)
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $newFileName = uniqid('post_', true) . '.' . $extension;
    $targetPath = $uploadDir . $newFileName;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        
        // SIKERES MOZGATÁS -> Mentés adatbázisba
        $stmt = $conn->prepare("INSERT INTO posts (user_id, image_url, caption) VALUES (?, ?, ?)");
        
        // Csak a fájlnevet mentjük el ($newFileName), a mappát a JS teszi hozzá
        $stmt->bind_param("iss", $userId, $newFileName, $caption);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Sikeres feltöltés!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'SQL Hiba: ' . $stmt->error]);
        }
        $stmt->close();

    } else {
        echo json_encode(['success' => false, 'message' => 'Nem sikerült a képet a szerverre másolni. Jogosultság?']);
    }

} else {
    echo json_encode(['success' => false, 'message' => 'Csak POST kérés mehet.']);
}

$conn->close();
?>