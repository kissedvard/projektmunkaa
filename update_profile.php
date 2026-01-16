<?php

header('Content-Type: application/json; charset=utf-8');


mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

require_once 'db_connection.php'; 

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Nem vagy bejelentkezve!']);
    exit();
}

$reg_id = $_SESSION['user_id'];

try {
    // 1. Adatok fogadása
    $fullName = $_POST['fullName'] ?? '';
    $username = $_POST['username'] ?? '';
    $email = $_POST['email'] ?? '';
    $bio = $_POST['bio'] ?? '';
    $website = $_POST['website'] ?? '';
    $location = $_POST['location'] ?? '';

    // 2. Képfeltöltés
    $newFileName = null; 
    
    if (isset($_FILES['profileImage']) && $_FILES['profileImage']['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['profileImage']['tmp_name'];
        $fileName = $_FILES['profileImage']['name'];
        $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        $allowedExtensions = ['jpg', 'gif', 'png', 'jpeg', 'webp'];

        if (in_array($fileExtension, $allowedExtensions)) {
            $newFileName = 'profile_' . $reg_id . '_' . time() . '.' . $fileExtension;
            $uploadDir = './uploads/';
            
            if (!file_exists($uploadDir)) mkdir($uploadDir, 0777, true);

            if (!move_uploaded_file($fileTmpPath, $uploadDir . $newFileName)) {
                throw new Exception("Hiba a kép mozgatásakor.");
            }
        }
    }

    
    $conn->begin_transaction();

    $stmt1 = $conn->prepare("UPDATE register SET teljes_nev = ?, felhasznalo = ?, email = ? WHERE reg_id = ?");
    
    
    $stmt1->bind_param("sssi", $fullName, $username, $email, $reg_id);
    $stmt1->execute();
    $stmt1->close();

    
    $checkStmt = $conn->prepare("SELECT profile_id FROM profiles WHERE user_id = ?");
    $checkStmt->bind_param("i", $reg_id);
    $checkStmt->execute();
    $checkStmt->store_result(); // Fontos a num_rows-hoz!
    $exists = $checkStmt->num_rows > 0;
    $checkStmt->close();

    if ($exists) {
        if ($newFileName) {
            // Ha van új kép, azt is frissítjük
            $sql = "UPDATE profiles SET bemutatkozas = ?, weboldal = ?, lakhely = ?, profil_kep = ? WHERE user_id = ?";
            $stmt2 = $conn->prepare($sql);
            // "ssssi" -> 4 string (bio, web, lakhely, kép), 1 int (id)
            $stmt2->bind_param("ssssi", $bio, $website, $location, $newFileName, $reg_id);
        } else {
            // Ha nincs új kép, nem bántjuk a régit
            $sql = "UPDATE profiles SET bemutatkozas = ?, weboldal = ?, lakhely = ? WHERE user_id = ?";
            $stmt2 = $conn->prepare($sql);
            // "sssi" -> 3 string, 1 int
            $stmt2->bind_param("sssi", $bio, $website, $location, $reg_id);
        }
    } else {
        if ($newFileName) {
            $sql = "INSERT INTO profiles (user_id, bemutatkozas, weboldal, lakhely, profil_kep) VALUES (?, ?, ?, ?, ?)";
            $stmt2 = $conn->prepare($sql);
            $stmt2->bind_param("issss", $reg_id, $bio, $website, $location, $newFileName);
        } else {
            $sql = "INSERT INTO profiles (user_id, bemutatkozas, weboldal, lakhely) VALUES (?, ?, ?, ?)";
            $stmt2 = $conn->prepare($sql);
            $stmt2->bind_param("isss", $reg_id, $bio, $website, $location);
        }
    }

    $stmt2->execute();
    $stmt2->close();

    // --- TRANZAKCIÓ VÉGLEGESÍTÉSE ---
    $conn->commit();

    // Session frissítése
    $_SESSION['username'] = $fullName;

    echo json_encode(['success' => true, 'message' => 'Sikeres mentés!', 'new_fullname' => $fullName]);

} catch (Exception $e) {
    // Hiba esetén visszavonás
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => 'Hiba: ' . $e->getMessage()]);
}
?>