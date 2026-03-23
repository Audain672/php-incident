<?php
declare(strict_types=1);

namespace App\Core\Middleware;

use App\Core\Cache\RedisCache;
use App\Core\Request;
use App\Core\Response;

class RateLimitMiddleware implements MiddlewareInterface
{
    private int $maxRequests;
    private int $windowSeconds = 60;

    public function __construct(
        private RedisCache $cache,
        int $maxRequests = 0
    ) {
        $this->maxRequests = $maxRequests ?: (int)($_ENV['RATE_LIMIT_API'] ?? 60);
    }

    public function handle(Request $request, Response $response, callable $next): void
    {
        $ip = $request->getIp();
        $key = 'rate_limit:' . $ip;

        $current = (int)$this->cache->get($key);

        if ($current >= $this->maxRequests) {
            $response->error('RATE_LIMIT_EXCEEDED', 'Trop de requêtes. Réessayez dans une minute.', [], 429);
        }

        $this->cache->increment($key, $this->windowSeconds);
        $next();
    }
}
