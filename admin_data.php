<?php
require_once 'db.php';
requireAdmin();

$data = [
    'users' => [],
    'crops' => [],
    'auctions' => [],
    'transactions' => [],
    'stats' => []
];

// User stats
$result = $conn->query("SELECT COUNT(*) as total FROM users");
$data['stats']['total_users'] = $result->fetch_assoc()['total'];

$result = $conn->query("SELECT COUNT(*) as total FROM users WHERE role='farmer'");
$data['stats']['farmers'] = $result->fetch_assoc()['total'];

$result = $conn->query("SELECT COUNT(*) as total FROM users WHERE role='buyer'");
$data['stats']['buyers'] = $result->fetch_assoc()['total'];

// Crop stats
$result = $conn->query("SELECT COUNT(*) as total FROM crops");
$data['stats']['total_crops'] = $result->fetch_assoc()['total'];

// Auction stats
$result = $conn->query("SELECT COUNT(*) as total FROM auctions");
$data['stats']['total_auctions'] = $result->fetch_assoc()['total'];

// Trade value
$result = $conn->query("SELECT SUM(price_per_q * quantity) as total FROM crops WHERE status='sold'");
$row = $result->fetch_assoc();
$data['stats']['trade_value'] = $row['total'] ?? 0;

// Recent users
$result = $conn->query("SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC LIMIT 10");
while ($row = $result->fetch_assoc()) {
    $data['users'][] = $row;
}

// Recent crops
$result = $conn->query("SELECT c.*, u.name as farmer_name FROM crops c JOIN users u ON c.farmer_id = u.id ORDER BY c.created_at DESC LIMIT 10");
while ($row = $result->fetch_assoc()) {
    $data['crops'][] = $row;
}

jsonResponse(true, 'Admin data loaded', $data);
?>