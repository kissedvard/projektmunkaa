<?php
header('Content-Type: application/json; charset=utf-8');

// Logolás indítása
file_put_contents('debug_log.txt', "Gemini elemzés indítása...\n", FILE_APPEND);

// POST adatok fogadása
$data = json_decode(file_get_contents('php://input'), true);
file_put_contents('debug_log.txt', "Bejövő adat: " . json_encode($data) . "\n", FILE_APPEND);

$imageUrl = $data['imageUrl'] ?? '';
if (empty($imageUrl)) {
    echo json_encode(['success' => false, 'message' => 'Nincs kép URL megadva.']);
    exit;
}

// ---------------------------------------------------------
// 1. BEÁLLÍTÁSOK
// ---------------------------------------------------------
// IDE MÁSOLD BE A GEMINI API KULCSODAT (Google AI Studio-ból)
$apiKey = 'AIzaSyBs_a9HKchnFbO-pvzWLPmM8loP3FQ1rU0';

// A Gemini 1.5 Flash modellt használjuk (gyors és hatékony képekhez)
$apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=' . $apiKey;
// ---------------------------------------------------------
$imageContent = @file_get_contents($imageUrl);

if ($imageContent === false) {
    file_put_contents('debug_log.txt', "Hiba: Nem sikerült letölteni a képet: $imageUrl\n", FILE_APPEND);
    echo json_encode(['success' => false, 'message' => 'Nem sikerült letölteni a képet.']);
    exit;
}

// MIME típus meghatározása (fontos a Gemininek)
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->buffer($imageContent);

// Base64 kódolás
$base64Image = base64_encode($imageContent);

// ---------------------------------------------------------
// 3. KÉRÉS ÖSSZEÁLLÍTÁSA (Gemini struktúra)
// ---------------------------------------------------------
// Itt adjuk meg a promptot (utasítást) az AI-nak.
// Mivel magyarul szeretnéd a választ, magyarul utasítjuk.
$promptText = "Elemzed ezt a képet, és írj róla egy rövid, érdekes, közösségi médiába illő leírást magyarul (max 2 mondat). Ne használj hashtageket, csak szöveget.";

$requestData = [
    'contents' => [
        [
            'parts' => [
                ['text' => $promptText],
                [
                    'inline_data' => [
                        'mime_type' => $mimeType,
                        'data' => $base64Image
                    ]
                ]
            ]
        ]
    ]
];

// ---------------------------------------------------------
// 4. API HÍVÁS (cURL)
// ---------------------------------------------------------
$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestData));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

// Hibakezelés
if ($curlError) {
    file_put_contents('debug_log.txt', "cURL Hiba: $curlError\n", FILE_APPEND);
    echo json_encode(['success' => false, 'message' => 'Hiba a Gemini API hívásakor.']);
    exit;
}

if ($httpCode !== 200) {
    // Részletes hiba naplózása
    file_put_contents('debug_log.txt', "HTTP Hiba ($httpCode): $response\n", FILE_APPEND);
    
    // Megpróbáljuk kinyerni a Google pontos hibaüzenetét
    $errJson = json_decode($response, true);
    $googleError = $errJson['error']['message'] ?? 'Ismeretlen hiba';
    $status = $errJson['error']['status'] ?? 'UNKNOWN';

    // Ezt küldjük vissza a böngészőnek, hogy lásd a képernyőn
    echo json_encode([
        'success' => false, 
        'message' => "API Hiba ($status): $googleError"
    ]);
    exit;
}

// ---------------------------------------------------------
// 5. VÁLASZ FELDOLGOZÁSA
// ---------------------------------------------------------
$responseData = json_decode($response, true);

// A Gemini válaszának kinyerése a JSON-ból
if (isset($responseData['candidates'][0]['content']['parts'][0]['text'])) {
    $description = $responseData['candidates'][0]['content']['parts'][0]['text'];
    
    // Sortörések és felesleges szóközök takarítása
    $description = trim(preg_replace('/\s+/', ' ', $description));

    file_put_contents('debug_log.txt', "Sikeres elemzés: $description\n", FILE_APPEND);
    echo json_encode(['success' => true, 'description' => $description]);
} else {
    file_put_contents('debug_log.txt', "Üres vagy hibás válasz struktúra: $response\n", FILE_APPEND);
    echo json_encode(['success' => false, 'message' => 'Nem sikerült értelmezni a képet.']);
}
?>