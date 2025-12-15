<?php
header("Access-Control-Allow-Origin: *"); // Networking skill: Handling CORS
header("Content-Type: application/json; charset=UTF-8");

include 'db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];

// GET Request: Fetch all projects
if ($method == 'GET') {
    $sql = "SELECT * FROM projects ORDER BY id DESC";
    $result = $conn->query($sql);
    
    $projects = array();
    while($row = $result->fetch_assoc()) {
        $projects[] = $row;
    }
    echo json_encode($projects);
}

// POST Request: Add a new project
if ($method == 'POST') {
    // Read JSON input
    $data = json_decode(file_get_contents("php://input"));

    if(!empty($data->title) && !empty($data->category)) {
        // Programming skill: Prepared Statements (Security)
        $stmt = $conn->prepare("INSERT INTO projects (title, category, description) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $data->title, $data->category, $data->description);
        
        if($stmt->execute()) {
            echo json_encode(["message" => "Project created successfully."]);
        } else {
            echo json_encode(["message" => "Error creating project."]);
        }
        $stmt->close();
    }
}

$conn->close();
?>