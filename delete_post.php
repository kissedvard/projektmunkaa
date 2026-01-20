<?php

header('Content-Type: application/json; charset=utf-8');
require_once 'db_connection.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Nincs bejelentkezve!']);
    exit;
}

// 1. JSON input fogadása 
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['post_id'])) {
    echo json_encode(['success' => false, 'message' => 'Hiányzó Post ID']);
    exit;
}

$post_id = $data['post_id'];
$user_id = $_SESSION['user_id'];


$stmt = $conn->prepare("SELECT image_url FROM posts WHERE id = ? AND user_id = ?");
$stmt->bind_param("ii", $post_id, $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'A poszt nem található, vagy nincs jogod törölni.']);
    exit;
}

$post = $result->fetch_assoc();
$image_url = $post['image_url'];

// 2. Törlés az adatbázisból
$delStmt = $conn->prepare("DELETE FROM posts WHERE id = ?");
$delStmt->bind_param("i", $post_id);

if ($delStmt->execute()) {
    // 3. Ha sikeres az DB törlés, töröljük a fájlt is a szerverről
    $filePath = 'uploads/' . $image_url;
    if (file_exists($filePath)) {
        unlink($filePath);
    }
    
    echo json_encode(['success' => true, 'message' => 'Poszt sikeresen törölve!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Adatbázis hiba törlés közben.']);
}

$stmt->close();
$delStmt->close();
$conn->close();
?>