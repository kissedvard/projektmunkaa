<?php

header('Content-Type: application/json; charset=utf-8');
require_once 'db_connection.php';

// Ellenőrzés
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Nincs bejelentkezve']);
    exit;
}


$user_id = $_SESSION['user_id'];

// Lekérdezzük a felhasználó posztjait, a legújabbal kezdve (ORDER BY DESC)
$sql = "SELECT id, image_url, caption, likes_count, comments_count, created_at 
        FROM posts 
        WHERE user_id = ? 
        ORDER BY created_at DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$posts = [];
while ($row = $result->fetch_assoc()) {
    $posts[] = $row;
}

echo json_encode([
    'success' => true,
    'posts' => $posts
]);

$stmt->close();
$conn->close();
?>