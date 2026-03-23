-- Catégories initiales
INSERT IGNORE INTO categories (code, label, color, icon) VALUES
('accident',  'Accident',          '#E74C3C', '🚨'),
('fire',      'Incendie',          '#E67E22', '🔥'),
('flood',     'Inondation',        '#3498DB', '🌊'),
('road_work', 'Travaux / Route',   '#F39C12', '🕳️'),
('obstacle',  'Obstacle',          '#8E44AD', '🚧'),
('weather',   'Météo dangereuse',  '#2980B9', '⛈️'),
('other',     'Autre',             '#7F8C8D', '📍');

-- Utilisateur ADMIN de test (password: Admin@1234)
INSERT IGNORE INTO users (uuid, first_name, last_name, email, password_hash, role, is_active, email_verified_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Admin', 'System',
    'admin@incident-reporter.local',
    '$2y$12$jX0cYMXwpCpMFZdovlAukO4a.aF2fwe.OYXmefbJ/fS5Ll2RYdC7K',
    'ADMIN', 1, NOW()
);

-- Utilisateur USER de test (password: User@1234)
INSERT IGNORE INTO users (uuid, first_name, last_name, email, password_hash, role, is_active, email_verified_at)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    'Jean', 'Dupont',
    'jean@incident-reporter.local',
    '$2y$12$CERMHEbHJpXSYzwH42LgVOxf3wBFGT0SbbKIqivlrccyu3pU9UZ9W',
    'USER', 1, NOW()
);
