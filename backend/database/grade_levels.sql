-- Drop existing table if it exists
DROP TABLE IF EXISTS grade_levels;

-- Create grade_levels table with explicit settings
CREATE TABLE grade_levels (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(191) NOT NULL,
    description TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY unique_grade_level_name (name)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for better query performance
CREATE INDEX idx_grade_levels_is_active ON grade_levels(is_active);
CREATE INDEX idx_grade_levels_created_at ON grade_levels(created_at);
CREATE INDEX idx_grade_levels_deleted_at ON grade_levels(deleted_at);

-- Add comments to table and columns
ALTER TABLE grade_levels
    COMMENT 'Stores information about grade levels in the school system';

ALTER TABLE grade_levels
    MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for the grade level',
    MODIFY COLUMN name VARCHAR(191) NOT NULL COMMENT 'Name of the grade level (e.g., Grade 7)',
    MODIFY COLUMN description TEXT NULL COMMENT 'Detailed description of the grade level',
    MODIFY COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Whether the grade level is currently active',
    MODIFY COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When the grade level was created',
    MODIFY COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'When the grade level was last updated',
    MODIFY COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'When the grade level was soft deleted'; 