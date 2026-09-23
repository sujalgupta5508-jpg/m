<?php
require_once 'db.php';
requireLogin();

if ($_SESSION['user_role'] !== 'buyer') {
    jsonResponse(false, 'Only buyers can place bids');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request');
}

$auctionId = intval($_POST['auction_id'] ?? 0);
$buyerId = $_SESSION['user_id'];

// Get auction details
$stmt = $conn->prepare("SELECT * FROM auctions WHERE id = ? AND status = 'live' AND end_time > NOW()");
$stmt->bind_param("i", $auctionId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows !== 1) {
    jsonResponse(false, 'Auction not found or ended');
}

$auction = $result->fetch_assoc();

// Calculate new bid
$newBid = $auction['current_price'] + $auction['bid_increment'];

// Update auction
$update = $conn->prepare("UPDATE auctions SET current_price = ?, total_bids = total_bids + 1, winner_id = ? WHERE id = ?");
$update->bind_param("dii", $newBid, $buyerId, $auctionId);

// Record bid
$insert = $conn->prepare("INSERT INTO bids (auction_id, buyer_id, bid_amount) VALUES (?, ?, ?)");
$insert->bind_param("iid", $auctionId, $buyerId, $newBid);

if ($update->execute() && $insert->execute()) {
    jsonResponse(true, 'Bid placed!', ['new_price' => $newBid]);
} else {
    jsonResponse(false, 'Failed to place bid');
}
?>