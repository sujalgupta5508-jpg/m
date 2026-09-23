<?php

// Load database configuration
require_once 'config.php';

// Create MySQL connection
$conn = new mysqli(
    DB_HOST,
    DB_USER,
    DB_PASS,
    DB_NAME,
    DB_PORT
);

// Check connection
if ($conn->connect_error) {
    die(
        "❌ Database connection failed:<br>" .
        htmlspecialchars($conn->connect_error)
    );
}

$conn->set_charset("utf8mb4");

echo "<h2>✅ MandiMart Database Connected!</h2>";

echo "<p><strong>Database:</strong> " . htmlspecialchars(DB_NAME) . "</p>";
echo "<p><strong>Host:</strong> " . htmlspecialchars(DB_HOST) . "</p>";

// Check tables
$result = $conn->query("SHOW TABLES");

if (!$result) {
    die("❌ Could not read tables: " . htmlspecialchars($conn->error));
}

echo "<h3>Tables found:</h3>";

if ($result->num_rows === 0) {

    echo "<p>⚠️ Database connected, but no tables were found.</p>";

} else {

    echo "<ul>";

    while ($row = $result->fetch_array()) {
        echo "<li>✅ " . htmlspecialchars($row[0]) . "</li>";
    }

    echo "</ul>";

    echo "<p><strong>🎉 Database and tables are working!</strong></p>";
}

$conn->close();

?>