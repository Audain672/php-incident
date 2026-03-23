<?php
declare(strict_types=1);

// Application constants
define('APP_ENV',   $_ENV['APP_ENV']   ?? 'production');
define('APP_DEBUG', ($_ENV['APP_DEBUG'] ?? 'false') === 'true');
define('APP_URL',   $_ENV['APP_URL']   ?? '');

// Error reporting
if (APP_DEBUG) {
    ini_set('display_errors', '1');
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', '0');
    error_reporting(0);
}

// Timezone
date_default_timezone_set('UTC');
