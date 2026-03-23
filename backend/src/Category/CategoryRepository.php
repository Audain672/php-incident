<?php
declare(strict_types=1);

namespace App\Category;

use App\Core\Database\QueryBuilder;

class CategoryRepository
{
    public function __construct(private QueryBuilder $db) {}

    public function findAll(): array
    {
        $categories = $this->db->table('categories')->get();
        // format expected by frontend
        return array_map(function ($cat) {
            return [
                'id'    => (int)$cat['id'],
                'code'  => $cat['code'],
                'label' => $cat['label'],
                'color' => $cat['color'],
                'icon'  => $cat['icon'],
            ];
        }, $categories);
    }

    public function findByCode(string $code): ?array
    {
        $cat = $this->db->table('categories')->where('code = ?', $code)->first();
        return $cat ?: null;
    }
}
