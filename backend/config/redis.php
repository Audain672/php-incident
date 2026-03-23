<?php
declare(strict_types=1);

return [
    'host'     => $_ENV['REDIS_HOST']     ?? 'localhost',
    'port'     => (int)($_ENV['REDIS_PORT'] ?? 6379),
    'password' => $_ENV['REDIS_PASSWORD'] ?? '',
];
