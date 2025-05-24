<?php
// db.php - Database connection for school_app
$host = 'localhost';
$user = 'root';
$pass = '';
$db = 'school_app';
$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'DB connection failed']));
}
?> 