<!-- <?php
$uploadDir = __DIR__ . '/uploads/';
$maxFileSize = 4 * 1024 * 1024; 
$allowedExt = ['pdf','doc','docx'];
$allowedMime = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

function show($t,$m){ echo "<h2>$t</h2><p>$m</p><p><a href='index.php'>&larr; Back</a></p>"; exit; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { show('Invalid','Please submit the form'); }

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
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
    show('Bad mime','Detected: '.htmlspecialchars($mime));
}

if (!is_dir($uploadDir)) mkdir($uploadDir,0755,true);
$filename = bin2hex(random_bytes(8)) . '_' . time() . '.' . $ext;
$dest = $uploadDir . $filename;
if (!move_uploaded_file($file['tmp_name'], $dest)) show('Server error','Could not save file');


$csv = __DIR__ . '/applications.csv';
$fp = fopen($csv,'a');
if ($fp) {
    fputcsv($fp,[date('c'),$name,$email,$_POST['position'] ?? '',$filename]);
    fclose($fp);
}

show('Success','Your application was received. Thank you.'); -->
