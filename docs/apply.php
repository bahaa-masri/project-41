<?php

$uploadDir = __DIR__ . '/uploads/';
$maxFileSize = 4 * 1024 * 1024; // 4MB
$allowedExt = ['pdf','doc','docx'];
$allowedMime = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// === Configure ===
$CALL_GOOGLE = true; // set false to disable Google calls
$GOOGLE_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbzke6XSUDTevE-Ft7MBrEG29fwCQhvWAMRSbtg0VMMPbWEQBULGiohHdE7Xl3c_EVTJuQ/exec';
$GOOGLE_SECRET = getenv('GOOGLE_HOOK_SECRET') ?: 'my-super-secret-123'; 

$FILES_BASE_URL = 'http://172.16.2.68/hosriholding/public/uploads/';
// ==============================================

function show($t, $m) {
    echo "<h2>".htmlspecialchars($t)."</h2><p>".htmlspecialchars($m)."</p><p><a href='index.php'>&larr; Back</a></p>";
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    show('Invalid','Please submit the form');
}

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$position = trim($_POST['position'] ?? '');
$note = trim($_POST['cover'] ?? '');
$phone = trim($_POST['phone'] ?? '');


if ($name === '' || $email === '') { show('Missing','Name and email required'); }

if (!isset($_FILES['cv']) || $_FILES['cv']['error'] === UPLOAD_ERR_NO_FILE) {
    show('No file','Please upload your CV');
}

$file = $_FILES['cv'];
if ($file['error'] !== UPLOAD_ERR_OK) { show('Upload error','Code: '.$file['error']); }
if ($file['size'] > $maxFileSize) { show('File too large','Max 4MB'); }
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if (!in_array($ext, $allowedExt)) { show('Bad type','Only PDF/DOC/DOCX'); }

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);
if (!in_array($mime, $allowedMime)) {
    // some servers report slightly different mime types; adjust if you trust extension
    show('Bad mime','Detected: '.htmlspecialchars($mime));
}

if (!is_dir($uploadDir)) mkdir($uploadDir,0755,true);
$filename = bin2hex(random_bytes(8)) . '_' . time() . '.' . $ext;
$dest = $uploadDir . $filename;
if (!move_uploaded_file($file['tmp_name'], $dest)) show('Server error','Could not save file');
// save minimal record to CSV
$fileUrl = $FILES_BASE_URL . $filename;

$csv = __DIR__ . '/applications.csv';
$fp = fopen($csv,'a');
if ($fp) {
    fputcsv($fp,[date('c'),$name,$email,$phone,$position, $fileUrl,$filename]);
    fclose($fp);
}

// helper: POST JSON to Google Apps Script Web App (returns response string or false)
function post_json_to_google($url, $payload, &$httpInfo = null) {
    $json = json_encode($payload, JSON_UNESCAPED_UNICODE);
   if (function_exists('curl_version')) {
    $ch = curl_init($url);

  
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $json);

   
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);  
    curl_setopt($ch, CURLOPT_MAXREDIRS, 5);          
    curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1); // force HTTP/1.1

  
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json; charset=utf-8',
        'Content-Length: ' . strlen($json)
    ]);

    // timeout
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);

    $resp = curl_exec($ch);
    $err = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    curl_close($ch);

    $httpInfo = ['http_code' => $httpCode, 'curl_error' => $err];

    if ($err) return false;

    return $resp;
}
 else {
        $opts = [
            'http' => [
                'method'  => 'POST',
                'header'  => "Content-Type: application/json; charset=utf-8\r\n" .
                             "Content-Length: " . strlen($json) . "\r\n",
                'content' => $json,
                'timeout' => 10
            ]
        ];
        $context = stream_context_create($opts);
        $resp = @file_get_contents($url, false, $context);
        $httpInfo = ['http_response_header' => $http_response_header ?? null];
        return $resp;
    }
}

// call Google Web App (send metadata only)
if ($CALL_GOOGLE && !empty($GOOGLE_WEBAPP_URL)) {
    $payload = [
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'position' => $position,
         'file_path' => $fileUrl,
        'filename' => $filename,
        'original_filename' => $file['name'],
        'note' => $note,
        'timestamp' => date('c'),
        '_secret' => $GOOGLE_SECRET
    ];
    $httpInfo = null;
    $googleRespRaw = post_json_to_google($GOOGLE_WEBAPP_URL, $payload, $httpInfo);

    if ($googleRespRaw === false) {
        // log but don't fail the user
        error_log('Google post failed: ' . json_encode($httpInfo));
        // optional: write debug to a local file for inspection
        @file_put_contents(__DIR__ . '/google_post_error.log', date('c') . " - POST FAILED - " . json_encode($httpInfo) . "\n", FILE_APPEND);
    } else {
        $decoded = json_decode($googleRespRaw, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log('Google response not JSON: ' . $googleRespRaw);
            @file_put_contents(__DIR__ . '/google_post_error.log', date('c') . " - NON-JSON RESPONSE: " . $googleRespRaw . "\n", FILE_APPEND);
        } else {
            if (!isset($decoded['status']) || $decoded['status'] !== 'ok') {
                error_log('Google returned error: ' . $googleRespRaw);
                @file_put_contents(__DIR__ . '/google_post_error.log', date('c') . " - APP ERROR: " . $googleRespRaw . "\n", FILE_APPEND);
            } else {
                // success - optional: record success
                // @file_put_contents(__DIR__ . '/google_post_success.log', date('c') . " - OK: " . $googleRespRaw . "\n", FILE_APPEND);
            }
        }
    }
}

show('Success','Your application was received. Thank you.');
