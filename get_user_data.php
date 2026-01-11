<?php


session_start();
header('Content-Type: application/json; charset=utf-8');


if (!isset($_SESSION['user_id'])) {
    // Ha nincs munkamenet (nincs ID), akkor hiba
    echo json_encode(['success' => false, 'message' => 'Nincs bejelentkezve']);
    exit;
}

$current_user_id = $_SESSION['user_id'];


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


$sql = "SELECT 
            r.teljes_nev, 
            r.felhasznalo, 
            r.email,
            p.bemutatkozas, 
            p.profil_kep, 
            p.lakhely, 
            p.weboldal,
            
            -- Posztok számlálása
            (SELECT COUNT(*) FROM posts WHERE user_id = r.reg_id) as posts_count,
            
            -- Követők számlálása (ahol ÉN vagyok a 'following_id')
            (SELECT COUNT(*) FROM follows WHERE following_id = r.reg_id) as followers_count,
            
            -- Követések számlálása (ahol ÉN vagyok a 'follower_id')
            (SELECT COUNT(*) FROM follows WHERE follower_id = r.reg_id) as following_count

        FROM register r
        JOIN profiles p ON r.reg_id = p.user_id
        WHERE r.reg_id = ?";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'SQL Hiba: ' . $conn->error]);
    exit;
}

$stmt->bind_param("i", $current_user_id);
$stmt->execute();
$result = $stmt->get_result();


if ($row = $result->fetch_assoc()) {
    // Siker: visszaküldjük az összes adatot JSON-ben
    echo json_encode(['success' => true, 'data' => $row]);
} else {
    // Furcsa hiba (pl. törölték a user-t közben)
    echo json_encode(['success' => false, 'message' => 'Profil adat nem található']);
}

$stmt->close();
$conn->close();
?>