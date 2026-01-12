<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

// Ellenőrzés
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Nincs bejelentkezve']);
    exit;
}

// DB Kapcsolat
$servername = getenv('MYSQL_HOST') ?: "db";
$username   = getenv('MYSQL_USER') ?: "user_dev";
$password   = getenv('MYSQL_PASSWORD') ?: "secure_pass";
$dbname     = getenv('MYSQL_DATABASE') ?: "egyetemidb";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'DB Hiba']);
    exit;
}
$conn->set_charset("utf8mb4");

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