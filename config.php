<?php
// ============================================
// MANDIMART - INFINITYFREE CONFIGURATION
// ============================================

// Database Settings - InfinityFree
define('DB_HOST', 'sql309.infinityfree.com');
define('DB_USER', 'if0_42962939');
define('DB_PASS', 'SUJAL5508');
define('DB_NAME', 'if0_42962939_mandimart');
define('DB_PORT', 3306);

// Site Settings
define('SITE_NAME', 'MandiMart');
define('SITE_URL', 'https://mandimart.ifree.page/');

// File Upload Settings
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB

// Session Settings
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Error Reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Time Zone
date_default_timezone_set('Asia/Kolkata');
?>