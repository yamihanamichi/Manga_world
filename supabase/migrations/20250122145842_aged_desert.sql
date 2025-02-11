-- Création de la base de données
CREATE DATABASE IF NOT EXISTS manga_world;
USE manga_world;

-- Table des utilisateurs avec rôle admin
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    avatar_url VARCHAR(255),
    bio TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT username_min_length CHECK (LENGTH(username) >= 3)
);

-- Table des listes de manga des utilisateurs
CREATE TABLE user_manga_list (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    mal_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    image_url VARCHAR(255),
    status ENUM('reading', 'completed', 'on_hold', 'dropped', 'plan_to_read') DEFAULT 'plan_to_read',
    rating INT CHECK (rating >= 1 AND rating <= 10),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_manga (user_id, mal_id)
);

-- Table des commentaires
CREATE TABLE manga_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    mal_id INT NOT NULL,
    comment TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Création du compte admin par défaut
-- Mot de passe: admin123 (sera hashé dans l'application)
INSERT INTO users (username, email, password, role) 
VALUES ('admin', 'admin@mangaworld.com', '$2a$10$XFE/UQEeI.QxiJ1bjxgm3.zrW3PUxkMqz3nKyQXYh4uEfPm1Hv.K2', 'admin');