<?php
$data = json_decode(file_get_contents("php://input"), true);

$csvPath = __DIR__ . "/../data/positions.csv";
$fp = fopen($csvPath, "w");

// CSV header
fputcsv($fp, ["role", "title", "type", "level", "active"]);

foreach ($data as $row) {
    fputcsv($fp, [
        $row["role"],
        $row["title"],
        $row["type"],
        $row["level"],
        $row["active"]
    ]);
}

fclose($fp);
echo "ok";