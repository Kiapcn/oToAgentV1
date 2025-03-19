-- Création de la table utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    position_x FLOAT,
    position_y FLOAT,
    rotation FLOAT
);

-- Création de la table agents
CREATE TABLE IF NOT EXISTS agents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    position_x FLOAT,
    position_y FLOAT,
    rotation FLOAT,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Création de la table contenus
CREATE TABLE IF NOT EXISTS contents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_type TEXT NOT NULL, -- 'user' ou 'agent'
    owner_id INTEGER NOT NULL,
    content_type TEXT NOT NULL, -- 'text', 'image', 'video', etc.
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    is_public BOOLEAN DEFAULT false
); 