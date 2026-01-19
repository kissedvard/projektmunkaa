<?php
// get_all_posts.php

header('Content-Type: application/json; charset=utf-8');
require_once 'db_connection.php';

// 1. Lekérjük a posztokat, a feltöltő adataival együtt
// JOIN-oljuk a register táblát (névért) és a profiles táblát (képért)
$sql = "SELECT 
            p.id, 
            p.user_id, 
            p.image_url, 
            p.caption, 
            p.tags, 
            p.likes_count, 
            p.comments_count, 
            p.created_at,
            r.felhasznalo AS username,
            pr.profil_kep
        FROM posts p
        JOIN register r ON p.user_id = r.reg_id
        LEFT JOIN profiles pr ON p.user_id = pr.user_id
        ORDER BY p.created_at DESC"; // Legújabbak elöl

$result = $conn->query($sql);

$posts = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $posts[] = $row;
    }
}

echo json_encode(['success' => true, 'posts' => $posts]);

$conn->close();
?>