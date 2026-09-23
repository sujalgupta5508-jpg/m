-- ============================================
-- MANDIMART - COMPLETE DATABASE SCHEMA
-- For XAMPP/WAMP - Import via phpMyAdmin
-- ============================================

-- Create database
CREATE DATABASE IF NOT EXISTS mandimart 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE mandimart;

-- ============================================
-- 1. USERS TABLE
-- Farmers, Buyers, and Admins
-- ============================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('farmer','buyer','admin') DEFAULT 'buyer',
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    pincode VARCHAR(10),
    rating DECIMAL(2,1) DEFAULT 5.0,
    status ENUM('active','pending','suspended') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 2. MANDI PRICES TABLE
-- Government API price data
-- ============================================
CREATE TABLE mandi_prices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    crop_name VARCHAR(50) NOT NULL,
    mandi_name VARCHAR(100) NOT NULL,
    state VARCHAR(50),
    min_price DECIMAL(10,2) NOT NULL,
    max_price DECIMAL(10,2) NOT NULL,
    modal_price DECIMAL(10,2) NOT NULL,
    trend ENUM('up','down','flat') DEFAULT 'flat',
    price_date DATE NOT NULL,
    distance_km DECIMAL(5,1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_crop_date (crop_name, price_date),
    INDEX idx_mandi (mandi_name)
);

-- ============================================
-- 3. CROP LISTINGS TABLE
-- Farmer's products for sale
-- ============================================
CREATE TABLE crops (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farmer_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    grade ENUM('A','B','C') DEFAULT 'A',
    price_per_q DECIMAL(10,2) NOT NULL,
    description TEXT,
    image_path VARCHAR(255),
    status ENUM('available','sold','reserved') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_farmer (farmer_id),
    INDEX idx_status (status)
);

-- ============================================
-- 4. AUCTIONS TABLE
-- Live bidding system
-- ============================================
CREATE TABLE auctions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farmer_id INT NOT NULL,
    crop_name VARCHAR(50) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    current_price DECIMAL(10,2) NOT NULL,
    bid_increment DECIMAL(10,2) DEFAULT 0,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NOT NULL,
    status ENUM('live','ended','cancelled') DEFAULT 'live',
    winner_id INT DEFAULT NULL,
    total_bids INT DEFAULT 0,
    FOREIGN KEY (farmer_id) REFERENCES users(id),
    FOREIGN KEY (winner_id) REFERENCES users(id),
    INDEX idx_status (status),
    INDEX idx_end_time (end_time)
);

-- ============================================
-- 5. BIDS TABLE
-- Individual bid records
-- ============================================
CREATE TABLE bids (
    id INT PRIMARY KEY AUTO_INCREMENT,
    auction_id INT NOT NULL,
    buyer_id INT NOT NULL,
    bid_amount DECIMAL(10,2) NOT NULL,
    bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    INDEX idx_auction (auction_id)
);

-- ============================================
-- 6. ORDERS TABLE
-- Completed transactions
-- ============================================
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    buyer_id INT NOT NULL,
    farmer_id INT NOT NULL,
    crop_id INT,
    auction_id INT,
    quantity DECIMAL(10,2) NOT NULL,
    price_per_q DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    status ENUM('pending','confirmed','shipped','delivered','cancelled') DEFAULT 'pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (farmer_id) REFERENCES users(id),
    FOREIGN KEY (crop_id) REFERENCES crops(id),
    FOREIGN KEY (auction_id) REFERENCES auctions(id),
    INDEX idx_buyer (buyer_id),
    INDEX idx_status (status)
);

-- ============================================
-- 7. MESSAGES TABLE
-- Farmer-Buyer chat
-- ============================================
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id),
    INDEX idx_conversation (sender_id, receiver_id)
);

-- ============================================
-- 8. AI COMPARE RESULTS
-- Quality analysis history
-- ============================================
CREATE TABLE ai_compare_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    image1_path VARCHAR(255),
    image2_path VARCHAR(255),
    veg1_score INT,
    veg2_score INT,
    winner VARCHAR(20),
    analysis TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============================================
-- INSERT SAMPLE DATA
-- ============================================

-- Sample Users (password: 'password123')
-- Hashed with password_hash()
INSERT INTO users (name, email, phone, password, role, city, state, rating, status) VALUES
('Ramesh Kumar', 'ramesh@mandimart.com', '9876543210', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'farmer', 'Delhi', 'Delhi', 4.8, 'active'),
('Sunita Devi', 'sunita@mandimart.com', '9876543211', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'farmer', 'Ghaziabad', 'UP', 4.5, 'active'),
('Gurpreet Singh', 'gurpreet@mandimart.com', '9876543212', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'farmer', 'Noida', 'UP', 4.9, 'active'),
('Admin User', 'admin@mandimart.com', '9999999999', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'Delhi', 'Delhi', 5.0, 'active'),
('Rajesh Buyer', 'rajesh@email.com', '9876543213', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'buyer', 'Mumbai', 'Maharashtra', 4.2, 'active');

-- Sample Mandi Prices
INSERT INTO mandi_prices (crop_name, mandi_name, state, min_price, max_price, modal_price, trend, price_date, distance_km) VALUES
('Tomato', 'Azadpur Mandi', 'Delhi', 1200, 1800, 1500, 'up', '2026-09-12', 2.3),
('Tomato', 'Ghazipur Mandi', 'Delhi', 1100, 1700, 1400, 'down', '2026-09-12', 5.1),
('Onion', 'Azadpur Mandi', 'Delhi', 2100, 2600, 2350, 'up', '2026-09-12', 2.3),
('Onion', 'Keshopur Mandi', 'Delhi', 2000, 2500, 2250, 'flat', '2026-09-12', 8.4),
('Potato', 'Ghazipur Mandi', 'Delhi', 1400, 1900, 1650, 'up', '2026-09-12', 5.1),
('Potato', 'Okhla Mandi', 'Delhi', 1350, 1850, 1600, 'flat', '2026-09-12', 9.0),
('Wheat', 'Narela Mandi', 'Delhi', 2200, 2450, 2325, 'up', '2026-09-12', 14.2),
('Brinjal', 'Azadpur Mandi', 'Delhi', 800, 1200, 1000, 'down', '2026-09-12', 2.3),
('Carrot', 'Keshopur Mandi', 'Delhi', 1500, 2000, 1750, 'up', '2026-09-12', 8.4),
('Cauliflower', 'Ghazipur Mandi', 'Delhi', 1800, 2400, 2100, 'flat', '2026-09-12', 5.1),
('Mango', 'Okhla Mandi', 'Delhi', 3000, 4500, 3750, 'up', '2026-09-12', 9.0);

-- Sample Crops
INSERT INTO crops (farmer_id, name, quantity, grade, price_per_q, description, status) VALUES
(1, 'Tomato', 50, 'A', 1500, 'Fresh organic tomatoes, hand-picked', 'available'),
(2, 'Onion', 120, 'B', 2250, 'Red onions, good for storage', 'unavailable'),
(3, 'Potato', 200, 'A', 1650, 'Premium Kufri potatoes', 'available');

-- Sample Auctions
INSERT INTO auctions (farmer_id, crop_name, quantity, base_price, current_price, bid_increment, end_time, status, total_bids) VALUES
(1, 'Premium Wheat', 100, 2300, 2300, 115, DATE_ADD(NOW(), INTERVAL 30 MINUTE), 'live', 0),
(2, 'Organic Brinjal', 75, 900, 900, 45, DATE_ADD(NOW(), INTERVAL 45 MINUTE), 'live', 0);

-- Sample Orders
INSERT INTO orders (buyer_id, farmer_id, crop_id, quantity, price_per_q, total_amount, status) VALUES
(5, 1, 1, 10, 1500, 15000, 'delivered'),
(5, 2, 2, 25, 2250, 56250, 'confirmed');
-- ============================================
-- AI COMPARE RESULTS TABLE
-- Stores vegetable comparison history
-- ============================================

CREATE TABLE IF NOT EXISTS ai_compare_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    image1_path VARCHAR(255),
    image2_path VARCHAR(255),
    veg1_score DECIMAL(5,2),
    veg2_score DECIMAL(5,2),
    winner INT DEFAULT 0 COMMENT '1=veg1, 2=veg2, 0=tie',
    analysis JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_created (created_at)
);