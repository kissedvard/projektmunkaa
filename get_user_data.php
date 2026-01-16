<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);

// 1. Kapcsolat felvétele (ez indítja a session-t is!)
require_once 'db_connection.php'; 

header('Content-Type: application/json; charset=utf-8');

// 2. Ellenőrzés: Van-e bejelentkezett felhasználó?
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Nincs bejelentkezve.']);
    exit;
}

$user_id = $_SESSION['user_id'];

// 3. ADATOK LEKÉRÉSE (JAVÍTOTT SQL)
// A JOIN helyett LEFT JOIN-t használunk!
$sql = "SELECT 
            r.teljes_nev, 
            r.felhasznalo AS felhasznalonev,  /* Átnevezzük, hogy a JS megtalálja */
            r.email,
            p.bemutatkozas, 
            p.profil_kep, 
            p.lakhely, 
            p.weboldal,
            p.privat_profil,    
            p.ertesitesek,
            
            -- Statisztikák (ezek jók voltak)
            (SELECT COUNT(*) FROM posts WHERE user_id = r.reg_id) as posts_count,
            (SELECT COUNT(*) FROM follows WHERE following_id = r.reg_id) as followers_count,
            (SELECT COUNT(*) FROM follows WHERE follower_id = r.reg_id) as following_count

        FROM register r
        LEFT JOIN profiles p ON r.reg_id = p.user_id   /* <--- ITT A JAVÍTÁS! */
        WHERE r.reg_id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $data = $result->fetch_assoc();
    
    // 4. HIÁNYZÓ ADATOK PÓTLÁSA (Default értékek)
    // Mivel új regisztrációnál a profil adatok NULL-ok, ezeket kezelni kell:
    
    if (empty($data['profil_kep'])) {
        $data['profil_kep'] = "fiok-ikon.png";
    }
    
    if ($data['bemutatkozas'] === null) $data['bemutatkozas'] = "";
    if ($data['lakhely'] === null) $data['lakhely'] = "";
    if ($data['weboldal'] === null) $data['weboldal'] = "";
    
    // Sikeres válasz
    echo json_encode(['success' => true, 'data' => $data]);
} else {
    // Ez csak akkor fordulhat elő, ha törölték a felhasználót a register táblából
    echo json_encode(['success' => false, 'message' => 'Felhasználó nem található.']);
}
?>