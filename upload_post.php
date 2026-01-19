<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'db_connection.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Nincs bejelentkezve!']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['success' => false, 'message' => 'Nem választottál ki képet!']);
        exit;
    }

    $file = $_FILES['file'];
    $caption = $_POST['imageCaption'] ?? '';
    $tags = $_POST['imageTags'] ?? ''; // ITT VESSZÜK ÁT A TAGEKET
    $userId = $_SESSION['user_id'];

    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($file['type'], $allowedTypes)) {
        echo json_encode(['success' => false, 'message' => 'Csak képfájlok engedélyezettek!']);
        exit;
    }

    $uploadDir = 'uploads/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $newFileName = uniqid('post_', true) . '.' . $extension;
    $targetPath = $uploadDir . $newFileName;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        // SQL BŐVÍTÉS: most már a tags mezőt is írjuk
        $stmt = $conn->prepare("INSERT INTO posts (user_id, image_url, caption, tags) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("isss", $userId, $newFileName, $caption, $tags);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Sikeres feltöltés!']);
        } else {
            unlink($targetPath); 
            echo json_encode(['success' => false, 'message' => 'Adatbázis hiba.']);
        }
        $stmt->close();
    } else {
        echo json_encode(['success' => false, 'message' => 'Fájlmozgatási hiba.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Csak POST kérés mehet.']);
}
$conn->close();
?>