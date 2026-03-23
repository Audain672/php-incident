-- ============================================================
-- Incident Reporter — Schéma MySQL 8.0
-- ============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET FOREIGN_KEY_CHECKS = 0;

-- Table : users
CREATE TABLE IF NOT EXISTS users (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid            CHAR(36)      NOT NULL,
    first_name      VARCHAR(100)  NOT NULL,
    last_name       VARCHAR(100)  NOT NULL,
    email           VARCHAR(255)  NOT NULL,
    password_hash   VARCHAR(255)  NOT NULL,
    phone           VARCHAR(20)   NULL,
    role            ENUM('USER','ADMIN') NOT NULL DEFAULT 'USER',
    is_active       TINYINT(1)    NOT NULL DEFAULT 1,
    email_verified_at DATETIME    NULL,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                    ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_uuid  (uuid),
    UNIQUE KEY uq_email (email),
    INDEX idx_role      (role),
    INDEX idx_active    (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table : refresh_tokens (révocation JWT)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT UNSIGNED NOT NULL,
    token_hash  VARCHAR(255)    NOT NULL,
    expires_at  DATETIME        NOT NULL,
    revoked     TINYINT(1)      NOT NULL DEFAULT 0,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token_hash  (token_hash),
    INDEX idx_user_id     (user_id),
    INDEX idx_expires     (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table : password_resets
CREATE TABLE IF NOT EXISTS password_resets (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email       VARCHAR(255) NOT NULL,
    token_hash  VARCHAR(255) NOT NULL,
    expires_at  DATETIME     NOT NULL,
    used        TINYINT(1)   NOT NULL DEFAULT 0,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email      (email),
    INDEX idx_token_hash (token_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table : categories (types d'incidents)
CREATE TABLE IF NOT EXISTS categories (
    id      TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code    VARCHAR(50)  NOT NULL,
    label   VARCHAR(100) NOT NULL,
    color   VARCHAR(7)   NOT NULL,    -- hex color ex: #E74C3C
    icon    VARCHAR(50)  NOT NULL,    -- emoji ou nom d'icône
    UNIQUE KEY uq_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table : incidents (table principale)
CREATE TABLE IF NOT EXISTS incidents (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid            CHAR(36)         NOT NULL,
    user_id         BIGINT UNSIGNED  NULL,     -- NULL si signalement anonyme
    category_id     TINYINT UNSIGNED NOT NULL,
    title           VARCHAR(100)     NOT NULL,
    description     TEXT             NOT NULL,
    type            ENUM('accident','fire','flood','road_work','obstacle','weather','other') NOT NULL,
    severity        ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium',
    status          ENUM('pending','in_progress','resolved','closed') NOT NULL DEFAULT 'pending',
    latitude        DECIMAL(10,8)    NOT NULL,
    longitude       DECIMAL(11,8)    NOT NULL,
    location_name   VARCHAR(255)     NULL,
    image_path      VARCHAR(512)     NULL,
    is_anonymous    TINYINT(1)       NOT NULL DEFAULT 0,
    created_at      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP
                    ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_uuid          (uuid),
    CONSTRAINT fk_inc_user     FOREIGN KEY (user_id)    REFERENCES users(id)      ON DELETE SET NULL,
    CONSTRAINT fk_inc_category FOREIGN KEY (category_id) REFERENCES categories(id),

    -- Index optimisés pour les requêtes frontend
    INDEX idx_status            (status),
    INDEX idx_type              (type),
    INDEX idx_severity          (severity),
    INDEX idx_type_status       (type, status),
    INDEX idx_created_status    (created_at DESC, status),
    INDEX idx_geo               (latitude, longitude),
    INDEX idx_user_id           (user_id),
    FULLTEXT idx_search         (title, description)     -- Pour le paramètre ?search=
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
