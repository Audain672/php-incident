<?php
declare(strict_types=1);

namespace App\Core\Cache;

use Redis;

class RedisCache
{
    private static ?Redis $instance = null;

    private function getClient(): Redis
    {
        if (self::$instance === null) {
            $redis = new Redis();
            $redis->connect(
                $_ENV['REDIS_HOST'] ?? 'localhost',
                (int)($_ENV['REDIS_PORT'] ?? 6379)
            );
            $password = $_ENV['REDIS_PASSWORD'] ?? '';
            if ($password) {
                $redis->auth($password);
            }
            self::$instance = $redis;
        }
        return self::$instance;
    }

    public function get(string $key): mixed
    {
        $value = $this->getClient()->get($key);
        if ($value === false) {
            return null;
        }
        $decoded = json_decode($value, true);
        return $decoded !== null ? $decoded : $value;
    }

    public function set(string $key, mixed $value, int $ttl = 0): void
    {
        $serialized = is_string($value) ? $value : json_encode($value);
        if ($ttl > 0) {
            $this->getClient()->setex($key, $ttl, $serialized);
        } else {
            $this->getClient()->set($key, $serialized);
        }
    }

    public function delete(string $key): void
    {
        $this->getClient()->del($key);
    }

    public function increment(string $key, int $ttl = 60): int
    {
        $client = $this->getClient();
        $value = $client->incr($key);
        if ($value === 1) {
            $client->expire($key, $ttl);
        }
        return $value;
    }

    public function invalidatePattern(string $pattern): void
    {
        $keys = $this->getClient()->keys($pattern);
        if (!empty($keys)) {
            $this->getClient()->del($keys);
        }
    }

    public function exists(string $key): bool
    {
        return (bool)$this->getClient()->exists($key);
    }
}
