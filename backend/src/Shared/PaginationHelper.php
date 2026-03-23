<?php
declare(strict_types=1);

namespace App\Shared;

class PaginationHelper
{
    public static function paginate(int $total, int $page, int $perPage): array
    {
        $page = max(1, $page);
        $perPage = min(max(1, $perPage), 100);
        $totalPages = (int)ceil($total / $perPage);
        $offset = ($page - 1) * $perPage;

        return [
            'meta' => [
                'currentPage' => $page,
                'totalPages'  => $totalPages,
                'totalCount'  => $total,
                'perPage'     => $perPage,
                'hasNext'     => $page < $totalPages,
                'hasPrev'     => $page > 1,
            ],
            'offset' => $offset,
            'limit'  => $perPage,
        ];
    }

    public static function fromQuery(array $query): array
    {
        $page = (int)($query['page'] ?? 1);
        $limit = (int)($query['limit'] ?? 20);
        return self::paginate(0, $page, $limit);
    }
}
