<?php
declare(strict_types=1);

namespace App\Category;

use App\Core\Request;
use App\Core\Response;
use App\Core\Cache\RedisCache;

class CategoryController
{
    public function __construct(
        private CategoryRepository $repository,
        private RedisCache $cache
    ) {}

    public function index(Request $request, Response $response): void
    {
        $cacheKey = 'categories:all';

        // Retourne toutes les catégories depuis le cache Redis (TTL 3600s)
        try {
            if ($cached = $this->cache->get($cacheKey)) {
                $response->json($cached);
            }

            $categories = $this->repository->findAll();
            $this->cache->set($cacheKey, $categories, 3600);

            $response->json($categories);
        } catch (\Exception $e) {
            $response->error($e->getMessage(), 500, 'SERVER_ERROR');
        }
    }
}
