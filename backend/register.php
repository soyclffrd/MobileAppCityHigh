<?php
header('Content-Type: application/json');
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
$name = $conn->real_escape_string($data['name'] ?? '');
$email = $conn->real_escape_string($data['email'] ?? '');
$password = $data['password'] ?? '';
$role = $conn->real_escape_string($data['role'] ?? 'user');

if (!$name || !$email || !$password || !$role) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

if ($conn->query("SELECT id FROM users WHERE email='$email'")->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Email already exists']);
    exit;
}

$hashed = password_hash($password, PASSWORD_DEFAULT);
$sql = "INSERT INTO users (name, email, password, role) VALUES ('$name', '$email', '$hashed', '$role')";
if ($conn->query($sql)) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Registration failed']);
}
$conn->close(); 