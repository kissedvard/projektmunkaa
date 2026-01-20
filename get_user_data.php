<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);

// 1. Kapcsolat felvétele 
require_once 'db_connection.php'; 

header('Content-Type: application/json; charset=utf-8');

// 2. Van-e bejelentkezett felhasználó?
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Nincs bejelentkezve.']);
    exit;
}

$user_id = $_SESSION['user_id'];

// 3. Adatok lekérdezése
$sql = "SELECT 
            r.teljes_nev, 
            r.felhasznalo AS felhasznalonev,  
            r.email,
            p.bemutatkozas, 
            p.profil_kep, 
            p.lakhely, 
            p.weboldal,
            p.privat_profil,    
            p.ertesitesek,
            
            -- Statisztikák 
            (SELECT COUNT(*) FROM posts WHERE user_id = r.reg_id) as posts_count,
            (SELECT COUNT(*) FROM follows WHERE following_id = r.reg_id) as followers_count,
            (SELECT COUNT(*) FROM follows WHERE follower_id = r.reg_id) as following_count

        FROM register r
        LEFT JOIN profiles p ON r.reg_id = p.user_id   
        WHERE r.reg_id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $data = $result->fetch_assoc();
    
    
    
    if (empty($data['profil_kep'])) {
        $data['profil_kep'] = "fiok-ikon.png";
    }
    
    if ($data['bemutatkozas'] === null) $data['bemutatkozas'] = "";
    if ($data['lakhely'] === null) $data['lakhely'] = "";
    if ($data['weboldal'] === null) $data['weboldal'] = "";
    
    
    echo json_encode(['success' => true, 'data' => $data]);
} else {
    
    echo json_encode(['success' => false, 'message' => 'Felhasználó nem található.']);
}
?>