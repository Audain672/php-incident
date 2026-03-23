<?php
declare(strict_types=1);

namespace App\Core\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database\Connection;
use App\Core\Cache\RedisCache;

class HealthController
{
    public function __construct(private RedisCache $cache) {}

    public function check(Request $request, Response $response): void
    {
        try {
            // DB Check
            $db = Connection::getInstance();
            $db->query("SELECT 1");

            // Redis Check
            $this->cache->set('health_check', 'ok', 10);

            $response->json([
                'status'   => 'ok',
                'database' => 'connected',
                'redis'    => 'connected',
                'time'     => date('Y-m-d H:i:s')
            ], 200, 'API is healthy');
        } catch (\Exception $e) {
            $response->error('System Unhealthy: ' . $e->getMessage(), 503);
        }
    }
}
