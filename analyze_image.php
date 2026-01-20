<?php
header('Content-Type: application/json; charset=utf-8');


file_put_contents('debug_log.txt', "Gemini elemzés indítása...\n", FILE_APPEND);


$data = json_decode(file_get_contents('php://input'), true);
file_put_contents('debug_log.txt', "Bejövő adat: " . json_encode($data) . "\n", FILE_APPEND);

$imageUrl = $data['imageUrl'] ?? '';
if (empty($imageUrl)) {
    echo json_encode(['success' => false, 'message' => 'Nincs kép URL megadva.']);
    exit;
}


$apiKey = 'AIzaSyBs_a9HKchnFbO-pvzWLPmM8loP3FQ1rU0';


$apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=' . $apiKey;
// ---------------------------------------------------------
$imageContent = @file_get_contents($imageUrl);

if ($imageContent === false) {
    file_put_contents('debug_log.txt', "Hiba: Nem sikerült letölteni a képet: $imageUrl\n", FILE_APPEND);
    echo json_encode(['success' => false, 'message' => 'Nem sikerült letölteni a képet.']);
    exit;
}


$finfo = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->buffer($imageContent);

// Base64 kódolás
$base64Image = base64_encode($imageContent);


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


$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestData));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);


if ($curlError) {
    file_put_contents('debug_log.txt', "cURL Hiba: $curlError\n", FILE_APPEND);
    echo json_encode(['success' => false, 'message' => 'Hiba a Gemini API hívásakor.']);
    exit;
}

if ($httpCode !== 200) {
    
    file_put_contents('debug_log.txt', "HTTP Hiba ($httpCode): $response\n", FILE_APPEND);
    
    
    $errJson = json_decode($response, true);
    $googleError = $errJson['error']['message'] ?? 'Ismeretlen hiba';
    $status = $errJson['error']['status'] ?? 'UNKNOWN';

    
    echo json_encode([
        'success' => false, 
        'message' => "API Hiba ($status): $googleError"
    ]);
    exit;
}


$responseData = json_decode($response, true);


if (isset($responseData['candidates'][0]['content']['parts'][0]['text'])) {
    $description = $responseData['candidates'][0]['content']['parts'][0]['text'];
    
    
    $description = trim(preg_replace('/\s+/', ' ', $description));

    file_put_contents('debug_log.txt', "Sikeres elemzés: $description\n", FILE_APPEND);
    echo json_encode(['success' => true, 'description' => $description]);
} else {
    file_put_contents('debug_log.txt', "Üres vagy hibás válasz struktúra: $response\n", FILE_APPEND);
    echo json_encode(['success' => false, 'message' => 'Nem sikerült értelmezni a képet.']);
}
?>