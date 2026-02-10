<?php
// apply_with_google.php
// Simple file upload + local CSV record + optional POST to Google Apps Script WebApp
// Usage: change $CALL_GOOGLE, $GOOGLE_WEBAPP_URL and $GOOGLE_SECRET below.

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
$GOOGLE_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbwSXcsQikoKx8rNE8rDSHHXd1z1l7TquzOcGyVT7a-2iGlEApsBpbxkRqM0akC6WbWp/exec';
$GOOGLE_SECRET = getenv('GOOGLE_HOOK_SECRET') ?: 'my-super-secret-123'; // أنصح بخيار env var
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
$note = trim($_POST['note'] ?? '');

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
$csv = __DIR__ . '/applications.csv';
$fp = fopen($csv,'a');
if ($fp) {
    fputcsv($fp,[date('c'),$name,$email,$position,$filename]);
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
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json; charset=utf-8',
            'Content-Length: ' . strlen($json)
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $resp = curl_exec($ch);
        $err = curl_error($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        $httpInfo = ['http_code'=>$httpCode, 'curl_error'=>$err];
        if ($err) return false;
        return $resp;
    } else {
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
        'position' => $position,
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

/*
 * Example Google Apps Script (Code.gs) to receive this POST and append to a spreadsheet.
 * Deploy the Apps Script as: "Deploy -> New deployment -> Web app"
 * Access: "Anyone" (or "Anyone, even anonymous") so your server can POST without OAuth.
 * Replace SPREADSHEET_ID and expected secret.

function doPost(e) {
  var ss = SpreadsheetApp.openById('SPREADSHEET_ID');
  var sheet = ss.getSheets()[0]; // or getSheetByName('Sheet1')
  try {
    var body = JSON.parse(e.postData.contents);
    if (body._secret !== 'my-super-secret-123') {
      return ContentService.createTextOutput(JSON.stringify({status:'error', message:'bad secret'})).setMimeType(ContentService.MimeType.JSON);
    }
    sheet.appendRow([new Date(), body.name || '', body.email || '', body.position || '', body.filename || '', body.original_filename || '', body.note || '']);
    return ContentService.createTextOutput(JSON.stringify({status:'ok'})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({status:'error', message: String(err)})).setMimeType(ContentService.MimeType.JSON);
  }
}

Notes / troubleshooting:
- Make sure the Apps Script web app is deployed and you've copied the correct URL into $GOOGLE_WEBAPP_URL.
- If your Apps Script requires the user to be signed in, your server POST will be blocked — choose "Anyone" access for testing.
- Check google_post_error.log in the same folder if rows don't appear; it contains HTTP errors and non-JSON replies.
- If your server is behind a firewall that blocks outbound HTTPS, the POST will fail.
- If you want the actual file stored in Google Drive and a link added to the sheet, that's a separate flow requiring OAuth or a service account; ask if you want that.
*/
