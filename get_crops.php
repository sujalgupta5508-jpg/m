<?php
require_once 'db.php';

// Get crops with farmer info
$sql = "SELECT c.*, u.name as seller_name, u.rating, u.city 
        FROM crops c 
        JOIN users u ON c.farmer_id = u.id 
        WHERE c.status = 'available' 
        ORDER BY c.created_at DESC";

$result = $conn->query($sql);
$crops = [];

while ($row = $result->fetch_assoc()) {
    $crops[] = [
        'id' => $row['id'],
        'name' => $row['name'],
        'quantity' => $row['quantity'],
        'grade' => $row['grade'],
        'price' => $row['price_per_q'],
        'image' => $row['image_path'],
        'seller' => $row['seller_name'],
        'rating' => $row['rating'],
        'city' => $row['city']
    ];
}

jsonResponse(true, 'Crops fetched', $crops);
?>