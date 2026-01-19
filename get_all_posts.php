<?php
// get_all_posts.php - Bővített verzió

header('Content-Type: application/json; charset=utf-8');
require_once 'db_connection.php';

$current_user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 0;

// SQL LEKÉRDEZÉS
// 1. Lekérjük a posztot és a user adatait.
// 2. Egy al-lekérdezéssel (EXISTS) megnézzük, hogy a jelenlegi user like-olta-e.
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
            pr.profil_kep,
            -- Ez adja vissza, hogy like-oltam-e (1 vagy 0)
            (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id AND user_id = ?) as is_liked
        FROM posts p
        JOIN register r ON p.user_id = r.reg_id
        LEFT JOIN profiles pr ON p.user_id = pr.user_id
        ORDER BY p.created_at DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $current_user_id); // Bekötjük a user ID-t a like ellenőrzéshez
$stmt->execute();
$result = $stmt->get_result();

$posts = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        // Minden poszthoz lekérjük a legutóbbi 2 kommentet is, hogy legyen mit mutatni
        $postId = $row['id'];
        $commSql = "SELECT c.comment_text, r.felhasznalo 
                    FROM post_comments c 
                    JOIN register r ON c.user_id = r.reg_id 
                    WHERE c.post_id = ? 
                    ORDER BY c.created_at ASC 
                    LIMIT 3"; // Az utolsó 3 komment
        
        $cStmt = $conn->prepare($commSql);
        $cStmt->bind_param("i", $postId);
        $cStmt->execute();
        $cRes = $cStmt->get_result();
        
        $comments = [];
        while($cRow = $cRes->fetch_assoc()) {
            $comments[] = $cRow;
        }
        $row['latest_comments'] = $comments;
        
        $posts[] = $row;
    }
}

echo json_encode(['success' => true, 'posts' => $posts]);
$conn->close();
?>