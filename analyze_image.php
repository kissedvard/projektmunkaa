<?php
header('Content-Type: application/json; charset=utf-8');

// Log the start of the script to confirm execution
file_put_contents('debug_log.txt', "Script started\n", FILE_APPEND);

// Get the POST data
$data = json_decode(file_get_contents('php://input'), true);
file_put_contents('debug_log.txt', "Request Data: " . json_encode($data) . "\n", FILE_APPEND);

// Accept `imageUrl` from the request payload
$imageUrl = $data['imageUrl'] ?? '';
if (empty($imageUrl)) {
    file_put_contents('debug_log.txt', "No image URL provided\n", FILE_APPEND);
    echo json_encode(['success' => false, 'message' => 'No image URL provided.']);
    exit;
}

// Google Vision API integration
$apiKey = ''; // Replace with your Google Vision API key
$apiUrl = 'https://vision.googleapis.com/v1/images:annotate?key=' . $apiKey;

// Download the image from the provided URL
$tempImagePath = sys_get_temp_dir() . '/' . uniqid('image_', true) . '.jpg';
$imageContent = file_get_contents($imageUrl);
if ($imageContent === false) {
    file_put_contents('debug_log.txt', "Failed to download image\n", FILE_APPEND);
    echo json_encode(['success' => false, 'message' => 'Failed to download image.']);
    exit;
}
file_put_contents($tempImagePath, $imageContent);

// Base64-encode the image
$base64Image = base64_encode(file_get_contents($tempImagePath));
unlink($tempImagePath);

// Prepare the API request payload
$requestData = [
    'requests' => [
        [
            'image' => [
                'content' => $base64Image
            ],
            'features' => [
                [
                    'type' => 'LABEL_DETECTION',
                    'maxResults' => 10
                ]
            ]
        ]
    ]
];

// Use cURL for the API call
$ch = curl_init($apiUrl);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestData));

$response = curl_exec($ch);

if (curl_errno($ch)) {
    $error = curl_error($ch);
    file_put_contents('debug_log.txt', "cURL Error: $error\n", FILE_APPEND);
    echo json_encode(['success' => false, 'message' => 'Failed to connect to Google Vision API.']);
    curl_close($ch);
    exit;
}

$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    file_put_contents('debug_log.txt', "HTTP Error: $httpCode, Response: $response\n", FILE_APPEND);
    echo json_encode(['success' => false, 'message' => 'Google Vision API returned an error.']);
    exit;
}

$responseData = json_decode($response, true);

// Parse and return the response
if (isset($responseData['responses'][0]['labelAnnotations'])) {
    $labels = array_map(function($label) {
        return $label['description'];
    }, $responseData['responses'][0]['labelAnnotations']);

    echo json_encode(['success' => true, 'description' => implode(', ', $labels)]);
} else {
    file_put_contents('debug_log.txt', "Invalid API Response: $response\n", FILE_APPEND);
    echo json_encode(['success' => false, 'message' => 'Google Vision API returned no labels.']);
}
?>