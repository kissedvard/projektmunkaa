<?php
// --- 1. CACHE KILLER  ---
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
header('Content-Type: application/json');

// --- 2. HIBÁK ELKAPÁSA ---
ob_start(); 
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Config betöltése
if (file_exists('db_connection.php')) {
    require_once 'db_connection.php';
} elseif (file_exists('../db_connection.php')) {
    require_once '../db_connection.php';
} else {
    ob_end_clean();
    die(json_encode(['success' => false, 'message' => 'Config fájl hiányzik!']));
}

session_start();

$response = array('success' => false, 'message' => 'Ismeretlen hiba');
$debug_log = array();

$response['server_time'] = date("Y-m-d H:i:s");

function addLog($msg) {
    global $debug_log;
    $debug_log[] = $msg;
}

try {
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('Nincs bejelentkezve');
    }

    $reg_id = $_SESSION['user_id'];
    
    // --- 3. ÚTVONAL BEÁLLÍTÁS ---
    $baseDir = $_SERVER['DOCUMENT_ROOT']; 
    
    
    $uploadDir = $baseDir . '/uploads/';

    addLog("Keresés helye (Base): " . $baseDir);
    addLog("Feltöltési mappa (Uploads): " . $uploadDir);

    // Mappa ellenőrzés
    if (!is_dir($uploadDir)) {
        if (mkdir($uploadDir, 0777, true)) {
             chmod($uploadDir, 0777); 
             addLog("Uploads mappa létrehozva.");
        } else {
             addLog("HIBA: Nem sikerült létrehozni az uploads mappát.");
        }
    }

    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        
        // Adatok
        $fullname = $_POST['fullName'] ?? '';
        $username = $_POST['username'] ?? '';
        $email = $_POST['email'] ?? '';
        $bio = $_POST['bio'] ?? '';
        $website = $_POST['website'] ?? '';
        $location = $_POST['location'] ?? '';
        $privateProfile = isset($_POST['privateProfile']) ? 1 : 0;
        $emailNotifications = isset($_POST['emailNotifications']) ? 1 : 0;
        
        // Kép műveletek
        $deleteRequest = (isset($_POST['delete_picture']) && $_POST['delete_picture'] == '1');
        $defaultIcon = 'fiok-ikon.png'; // Ennek kell lennie az images mappában
        $newFileName = null;

        // --- A) ÚJ KÉP FELTÖLTÉSE ---
        if (isset($_FILES['profileImage']) && $_FILES['profileImage']['error'] === 0) {
            $file = $_FILES['profileImage'];
            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            
            if (in_array($ext, $allowed)) {
                $newFileName = "profile_" . $reg_id . "_" . time() . "." . $ext;
                $targetPath = $uploadDir . $newFileName;
                
                if (move_uploaded_file($file['tmp_name'], $targetPath)) {
                    chmod($targetPath, 0644); 
                    addLog("Új kép sikeresen mentve: " . $newFileName);
                } else {
                    addLog("HIBA: move_uploaded_file sikertelen. Jogosultság?");
                    $newFileName = null;
                }
            }
        }

        // --- B) RÉGI KÉP TÖRLÉSE ---
        if ($newFileName || $deleteRequest) {
            addLog("--- Törlési folyamat indítása ---");
            
            $stmt = $conn->prepare("SELECT profil_kep FROM profiles WHERE user_id = ?");
            $stmt->bind_param("i", $reg_id);
            $stmt->execute();
            $res = $stmt->get_result();
            
            if ($row = $res->fetch_assoc()) {
                $oldImage = trim($row['profil_kep']);
                addLog("Adatbázisban lévő régi kép: [" . $oldImage . "]");
                
                $protected = ['fiok-ikon.png', 'default_avatar.jpg', 'default.png', '', null];
                
                if (!in_array($oldImage, $protected)) {
                    
                    $fileToDelete = $uploadDir . $oldImage;
                    addLog("Ezt a fájlt keressük törlésre: " . $fileToDelete);

                    if (file_exists($fileToDelete)) {
                        addLog("Fájl megvan. Törlés...");
                        if (@unlink($fileToDelete)) {
                            addLog("SIKER: Fájl törölve.");
                        } else {
                            addLog("HIBA: unlink() nem sikerült. (Zárolva vagy nincs jog?)");
                        }
                    } else {
                        addLog("INFO: A fájl fizikailag nincs a mappában (már törölték?).");
                    }
                } else {
                    addLog("INFO: A régi kép védett (pl. fiok-ikon.png), nem töröljük.");
                }
            }
            $stmt->close();
        }

        // --- C) ADATBÁZIS UPDATE ---
        $check = $conn->prepare("SELECT user_id FROM profiles WHERE user_id = ?");
        $check->bind_param("i", $reg_id);
        $check->execute();
        $exists = $check->get_result()->num_rows > 0;
        $check->close();

        $finalImage = null;

        if ($exists) {
            // Update
            if ($newFileName) {
                $sql = "UPDATE profiles SET bemutatkozas=?, weboldal=?, lakhely=?, profil_kep=?, privat_profil=?, ertesitesek=? WHERE user_id=?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("ssssiii", $bio, $website, $location, $newFileName, $privateProfile, $emailNotifications, $reg_id);
                $finalImage = $newFileName;
            } elseif ($deleteRequest) {
                $sql = "UPDATE profiles SET bemutatkozas=?, weboldal=?, lakhely=?, profil_kep=?, privat_profil=?, ertesitesek=? WHERE user_id=?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("ssssiii", $bio, $website, $location, $defaultIcon, $privateProfile, $emailNotifications, $reg_id);
                $finalImage = $defaultIcon;
            } else {
                $sql = "UPDATE profiles SET bemutatkozas=?, weboldal=?, lakhely=?, privat_profil=?, ertesitesek=? WHERE user_id=?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("sssiii", $bio, $website, $location, $privateProfile, $emailNotifications, $reg_id);
            }
        } else {
            // Insert
            $finalImage = ($newFileName) ? $newFileName : $defaultIcon;
            $sql = "INSERT INTO profiles (user_id, bemutatkozas, weboldal, lakhely, profil_kep, privat_profil, ertesitesek) VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("issssii", $reg_id, $bio, $website, $location, $finalImage, $privateProfile, $emailNotifications);
        }
        
        if ($stmt->execute()) {
            // Register update
            $sql_reg = "UPDATE register SET teljes_nev=?, felhasznalo=?, email=? WHERE reg_id=?";
            $u_stmt = $conn->prepare($sql_reg);
            $u_stmt->bind_param("sssi", $fullname, $username, $email, $reg_id);
            
            if ($u_stmt->execute()) {
                $response['success'] = true;
                $response['message'] = "Sikeres mentés!";
                if ($finalImage) {
                    $response['new_profile_image'] = $finalImage;
                }
            } else {
                throw new Exception("Hiba a register tábla frissítésekor: " . $u_stmt->error);
            }
        } else {
            throw new Exception("Hiba a profiles tábla frissítésekor: " . $stmt->error);
        }
    }

} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = $e->getMessage();
    addLog("KIVÉTEL: " . $e->getMessage());
}

$response['debug_log'] = $debug_log;
ob_end_clean(); 
echo json_encode($response);
exit;
?>