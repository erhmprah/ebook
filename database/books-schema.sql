-- Books Table Schema for BookHub
-- Creates the main books table with all required fields

CREATE TABLE IF NOT EXISTS books (
    Idbooks INT PRIMARY KEY AUTO_INCREMENT,
    Title VARCHAR(500) NOT NULL,
    Author VARCHAR(255) NOT NULL,
    Description TEXT,
    category VARCHAR(255) NOT NULL,
    excerpt TEXT,
    class VARCHAR(100),
    image VARCHAR(500),
    book VARCHAR(500),
    price DECIMAL(10,2) DEFAULT 0.00,
    dateAdded TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_author (author),
    INDEX idx_title (title)
);

-- Insert sample books for testing
INSERT INTO books (Title, Author, Description, category, excerpt, class, image, book, price) VALUES
-- Textbooks
('Mathematics Grade 1', 'John Smith', 'Comprehensive mathematics textbook for Grade 1 students', 'Textbooks', 'Learn basic arithmetic and number recognition', 'Grade 1', 'images/download.png', 'uploads/book-1740333474032.pdf', 15.99),
('Science Basics', 'Jane Doe', 'Introduction to basic science concepts', 'Textbooks', 'Explore the world of science', 'Grade 1', 'images/download.png', 'uploads/book-1740333546223.pdf', 12.99),
('English Grammar', 'Mark Wilson', 'Complete English grammar guide', 'Textbooks', 'Master English grammar rules', 'Grade 1', 'images/download.png', 'uploads/book-1740333651169.pdf', 18.99),

-- Storybooks
('The Little Prince', 'Antoine de Saint-Exupéry', 'A beloved tale about a little prince from a small planet', 'Storybooks', 'A magical story of love and adventure', 'All Ages', 'images/download.png', 'uploads/book-1740333653577.pdf', 9.99),
('Alice in Wonderland', 'Lewis Carroll', 'Alice follows the white rabbit down the rabbit hole', 'Storybooks', 'Join Alice in her wonderland adventure', 'All Ages', 'images/download.png', 'uploads/book-1741315001260.pdf', 11.99),
('The Magic Garden', 'Sarah Johnson', 'A story about a magical garden', 'Storybooks', 'Discover the secrets of the magic garden', 'All Ages', 'images/download.png', 'uploads/book-1741737528777.pdf', 8.99),

-- Poetry Books
('Rivers of Time', 'Emily Carter', 'Beautiful poetry collection about life and nature', 'Poetry Books', 'Poems that flow like rivers', 'All Ages', 'images/download.png', 'uploads/book-1742201749176.pdf', 13.99),
('Stars and Dreams', 'Robert Brown', 'Collection of inspirational poems', 'Poetry Books', 'Reach for the stars with poetry', 'All Ages', 'images/download.png', 'uploads/book-1742202101549.pdf', 10.99),
('Whispers of the Wind', 'Lisa Davis', 'Nature-inspired poetry collection', 'Poetry Books', 'Listen to the whispers in the wind', 'All Ages', 'images/download.png', 'uploads/book-1744329231010.pdf', 12.99),

-- Non-Fiction
('My First Encyclopedia', 'David Lee', 'Comprehensive encyclopedia for young readers', 'Informational / Non-Fiction Books', 'Learn about the world around you', 'All Ages', 'images/download.png', 'uploads/book-1744329305753.pdf', 19.99),
('Animal Kingdom', 'Maria Garcia', 'Discover amazing animals and their habitats', 'Informational / Non-Fiction Books', 'Explore the animal kingdom', 'All Ages', 'images/download.png', 'uploads/book-1744329410993.pdf', 16.99),
('How Things Work', 'Tom Anderson', 'Simple explanations of how things work', 'Informational / Non-Fiction Books', 'Understand the world of technology', 'All Ages', 'images/download.png', 'uploads/book-1744329489740.pdf', 14.99),

-- Featured Books (using %% as category)
('The Golden Compass', 'Philip Pullman', 'Epic fantasy adventure', '%%', 'Join Lyra on her incredible journey', 'All Ages', 'images/download.png', 'uploads/book-1744329597168.pdf', 17.99),
('Fantastic Mr. Fox', 'Roald Dahl', 'Clever fox outsmarts farmers', '%%', 'A clever tale of wit and cunning', 'All Ages', 'images/download.png', 'uploads/book-1744379776944.pdf', 9.99),
('The Tale of Peter Rabbit', 'Beatrix Potter', 'Classic tale of a mischievous rabbit', '%%', 'Learn about obedience and adventure', 'All Ages', 'images/download.png', 'uploads/book-1746200213239.pdf', 7.99);