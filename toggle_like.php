<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'db_connection.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Nincs bejelentkezve']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$post_id = $input['post_id'] ?? null;
$user_id = $_SESSION['user_id'];

if (!$post_id) {
    echo json_encode(['success' => false, 'message' => 'Hiányzó Post ID']);
    exit;
}

// 1. Megnézzük, like-olta-e már
$checkSql = "SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?";
$stmt = $conn->prepare($checkSql);
$stmt->bind_param("ii", $post_id, $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // MÁR LIKE-olta -> UNLIKE (Törlés)
    $stmt->close();
    $delSql = "DELETE FROM post_likes WHERE post_id = ? AND user_id = ?";
    $delStmt = $conn->prepare($delSql);
    $delStmt->bind_param("ii", $post_id, $user_id);
    $delStmt->execute();
    $action = 'unliked';
} else {
    // MÉG NEM LIKE-olta -> LIKE (Beszúrás)
    $stmt->close();
    $insSql = "INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)";
    $insStmt = $conn->prepare($insSql);
    $insStmt->bind_param("ii", $post_id, $user_id);
    $insStmt->execute();
    $action = 'liked';
}

// 2. Visszaküldjük az új számlálót (a trigger már frissítette a posts táblát)
$countSql = "SELECT likes_count FROM posts WHERE id = ?";
$cntStmt = $conn->prepare($countSql);
$cntStmt->bind_param("i", $post_id);
$cntStmt->execute();
$cntResult = $cntStmt->get_result()->fetch_assoc();

echo json_encode([
    'success' => true, 
    'action' => $action, 
    'new_count' => $cntResult['likes_count']
]);

$conn->close();
?>