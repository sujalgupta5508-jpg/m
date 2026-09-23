<?php
require_once 'db.php';
requireLogin();

if ($_SESSION['user_role'] !== 'farmer') {
    jsonResponse(false, 'Only farmers can create auctions');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request');
}

$farmerId = $_SESSION['user_id'];
$cropName = clean($_POST['crop_name'] ?? '');
$quantity = floatval($_POST['quantity'] ?? 0);
$basePrice = floatval($_POST['base_price'] ?? 0);
$duration = intval($_POST['duration'] ?? 30); // minutes

if (empty($cropName) || $quantity <= 0 || $basePrice <= 0) {
    jsonResponse(false, 'All fields are required');
}

$endTime = date('Y-m-d H:i:s', strtotime("+{$duration} minutes"));
$bidIncrement = round($basePrice * 0.05);

$stmt = $conn->prepare("INSERT INTO auctions (farmer_id, crop_name, quantity, base_price, current_price, bid_increment, end_time, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'live')");
$stmt->bind_param("isdddds", $farmerId, $cropName, $quantity, $basePrice, $basePrice, $bidIncrement, $endTime);

if ($stmt->execute()) {
    jsonResponse(true, 'Auction created!', ['auction_id' => $stmt->insert_id]);
} else {
    jsonResponse(false, 'Failed: ' . $conn->error);
}
?>