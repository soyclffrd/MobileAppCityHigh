-- Drop the table if it exists
DROP TABLE IF EXISTS sections;

-- Create the sections table
CREATE TABLE sections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    UNIQUE KEY unique_section_name (name)
);

-- Create indexes
CREATE INDEX idx_sections_is_active ON sections(is_active);
CREATE INDEX idx_sections_deleted_at ON sections(deleted_at);

-- Insert sample data
INSERT INTO sections (name, description, is_active) VALUES
('Sampaguita', 'Section A - Morning Class', true),
('Sun Flower', 'Section B - Afternoon Class', true),
('Rose', 'Section C - Evening Class', true),
('Orchids', 'Section D - Weekend Class', true),
('Olympia Woods', 'Section E - Special Class', true); 