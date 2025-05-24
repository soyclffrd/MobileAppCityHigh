<?php
header('Content-Type: application/json');
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
$email = $conn->real_escape_string($data['email'] ?? '');
$password = $data['password'] ?? '';

if (!$email || !$password) {
    echo json_encode(['success' => false, 'message' => 'Email and password required']);
    exit;
}

$res = $conn->query("SELECT * FROM users WHERE email='$email'");
if ($res->num_rows === 1) {
    $user = $res->fetch_assoc();
    if (password_verify($password, $user['password'])) {
        unset($user['password']);
        echo json_encode(['success' => true, 'user' => $user]);
        exit;
    }
}
echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
$conn->close(); 