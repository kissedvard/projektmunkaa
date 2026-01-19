<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'db_connection.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Nincs bejelentkezve']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$post_id = $input['post_id'] ?? null;
$comment_text = trim($input['comment_text'] ?? '');
$user_id = $_SESSION['user_id'];

if (!$post_id || empty($comment_text)) {
    echo json_encode(['success' => false, 'message' => 'Hiányzó adatok']);
    exit;
}

// Komment beszúrása
$sql = "INSERT INTO post_comments (post_id, user_id, comment_text) VALUES (?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iis", $post_id, $user_id, $comment_text);

if ($stmt->execute()) {
    // Visszaküldjük a sikert és a felhasználó nevét (hogy a JS azonnal ki tudja rajzolni)
    // Ehhez lekérjük a user nevét a sessionből vagy DB-ből. 
    // Egyszerűbb, ha a sessionben benne van, de itt lekérjük biztosra:
    $userSql = "SELECT felhasznalo FROM register WHERE reg_id = ?";
    $uStmt = $conn->prepare($userSql);
    $uStmt->bind_param("i", $user_id);
    $uStmt->execute();
    $userRes = $uStmt->get_result()->fetch_assoc();
    
    echo json_encode([
        'success' => true,
        'username' => $userRes['felhasznalo']
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Hiba történt']);
}

$conn->close();
?>