<?php
require_once 'db.php';
requireLogin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request');
}

$farmerId = $_SESSION['user_id'];
$name = clean($_POST['name'] ?? '');
$quantity = floatval($_POST['quantity'] ?? 0);
$grade = clean($_POST['grade'] ?? 'A');
$price = floatval($_POST['price'] ?? 0);
$description = clean($_POST['description'] ?? '');

// Validation
if (empty($name) || $quantity <= 0 || $price <= 0) {
    jsonResponse(false, 'Name, quantity and price are required');
}

// Handle image upload
$imagePath = null;
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $file = $_FILES['image'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'gif'];
    
    if (!in_array($ext, $allowed)) {
        jsonResponse(false, 'Only JPG, PNG, GIF images allowed');
    }
    
    if ($file['size'] > MAX_FILE_SIZE) {
        jsonResponse(false, 'Image must be less than 5MB');
    }
    
    $filename = uniqid() . '.' . $ext;
    $target = UPLOAD_DIR . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $target)) {
        $imagePath = $target;
    }
}

// Insert crop
$stmt = $conn->prepare("INSERT INTO crops (farmer_id, name, quantity, grade, price_per_q, description, image_path) VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("isdsdss", $farmerId, $name, $quantity, $grade, $price, $description, $imagePath);

if ($stmt->execute()) {
    jsonResponse(true, 'Crop listed successfully!', ['crop_id' => $stmt->insert_id]);
} else {
    jsonResponse(false, 'Failed to list crop: ' . $conn->error);
}
?>