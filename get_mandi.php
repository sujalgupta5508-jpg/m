<?php
require_once 'db.php';

$search = clean($_GET['q'] ?? '');
$date = date('Y-m-d');

$sql = "SELECT * FROM mandi_prices WHERE price_date = ?";
$params = [$date];
$types = "s";

if (!empty($search)) {
    $sql .= " AND (crop_name LIKE ? OR mandi_name LIKE ?)";
    $search = "%$search%";
    $params[] = $search;
    $params[] = $search;
    $types .= "ss";
}

$sql .= " ORDER BY crop_name, distance_km";

$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

$mandis = [];
while ($row = $result->fetch_assoc()) {
    $mandis[] = [
        'crop' => $row['crop_name'],
        'mandi' => $row['mandi_name'],
        'min' => $row['min_price'],
        'max' => $row['max_price'],
        'modal' => $row['modal_price'],
        'trend' => $row['trend'],
        'distance' => $row['distance_km']
    ];
}

jsonResponse(true, 'Mandi prices fetched', $mandis);
?>