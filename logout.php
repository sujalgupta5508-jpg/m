<?php
require_once 'db.php';

// Clear session
$_SESSION = array();

// Delete session cookie
if (isset($_COOKIE[session_name()])) {
    setcookie(session_name(), '', time() - 3600, '/');
}

// Destroy session
session_destroy();

jsonResponse(true, 'Logged out successfully');
?>