<?php
declare(strict_types=1);

namespace App\Incident;

use App\Core\Database\QueryBuilder;
use Ramsey\Uuid\Uuid;

class IncidentRepository
{
    public function __construct(private QueryBuilder $db) {}

    public function findAll(array $filters, int $limit, int $offset): array
    {
        $query = "
            SELECT i.*, 
                   u.first_name AS user_firstName, u.last_name AS user_lastName,
                   c.code AS category_code, c.label AS category_label, c.color AS category_color, c.icon AS category_icon
            FROM incidents i
            LEFT JOIN users u ON i.user_id = u.id
            LEFT JOIN categories c ON i.category_id = c.id
            WHERE 1=1
        ";
        
        $params = [];
        $conditions = $this->buildConditions($filters, $params);
        
        $query .= $conditions . " ORDER BY i.created_at DESC LIMIT :limit OFFSET :offset";
        
        // Use direct PDO for complex dynamic queries with mixes of named and array params if needed
        // For simplicity, adapting to PDO direct access or QueryBuilder extension.
        // We will use Connection directly to do complex raw queries easily if QueryBuilder lacks features
        $pdo = \App\Core\Database\Connection::getInstance();
        $stmt = $pdo->prepare($query);
        foreach ($params as $key => $val) {
            $stmt->bindValue($key, $val);
        }
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll();
    }

    public function countAll(array $filters): int
    {
        $query = "SELECT COUNT(*) FROM incidents i WHERE 1=1";
        $params = [];
        $conditions = $this->buildConditions($filters, $params);
        
        $pdo = \App\Core\Database\Connection::getInstance();
        $stmt = $pdo->prepare($query . $conditions);
        foreach ($params as $key => $val) {
            $stmt->bindValue($key, $val);
        }
        $stmt->execute();
        
        return (int)$stmt->fetchColumn();
    }

    private function buildConditions(array $filters, array &$params): string
    {
        $sql = "";
        if (!empty($filters['type'])) {
            $sql .= " AND i.type = :type";
            $params[':type'] = $filters['type'];
        }
        if (!empty($filters['status'])) {
            $sql .= " AND i.status = :status";
            $params[':status'] = $filters['status'];
        }
        if (!empty($filters['severity'])) {
            $sql .= " AND i.severity = :severity";
            $params[':severity'] = $filters['severity'];
        }
        if (!empty($filters['search'])) {
            $sql .= " AND MATCH(i.title, i.description) AGAINST(:search IN BOOLEAN MODE)";
            $params[':search'] = $filters['search'] . '*';
        }
        if (!empty($filters['dateFrom'])) {
            $sql .= " AND i.created_at >= :dateFrom";
            $params[':dateFrom'] = $filters['dateFrom'] . ' 00:00:00';
        }
        if (!empty($filters['dateTo'])) {
            $sql .= " AND i.created_at <= :dateTo";
            $params[':dateTo'] = $filters['dateTo'] . ' 23:59:59';
        }
        return $sql;
    }

    public function findNearby(float $lat, float $lng, float $radiusKm, int $limit = 20): array
    {
        $query = "
            SELECT i.*, 
                   u.first_name AS user_firstName, u.last_name AS user_lastName,
                   c.code AS category_code, c.label AS category_label, c.color AS category_color, c.icon AS category_icon,
                   (6371 * acos(cos(radians(:lat)) * cos(radians(i.latitude)) 
                   * cos(radians(i.longitude) - radians(:lng)) 
                   + sin(radians(:lat)) * sin(radians(i.latitude)))) AS distance
            FROM incidents i
            LEFT JOIN users u ON i.user_id = u.id
            LEFT JOIN categories c ON i.category_id = c.id
            HAVING distance < :radius
            ORDER BY distance ASC
            LIMIT :limit
        ";

        $pdo = \App\Core\Database\Connection::getInstance();
        $stmt = $pdo->prepare($query);
        $stmt->bindValue(':lat', $lat);
        $stmt->bindValue(':lng', $lng);
        $stmt->bindValue(':radius', $radiusKm);
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    public function findByUserId(int $userId, int $limit, int $offset): array
    {
        $query = "
            SELECT i.*, 
                   c.code AS category_code, c.label AS category_label, c.color AS category_color, c.icon AS category_icon
            FROM incidents i
            LEFT JOIN categories c ON i.category_id = c.id
            WHERE i.user_id = :userId
            ORDER BY i.created_at DESC LIMIT :limit OFFSET :offset
        ";
        $pdo = \App\Core\Database\Connection::getInstance();
        $stmt = $pdo->prepare($query);
        $stmt->bindValue(':userId', $userId, \PDO::PARAM_INT);
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function countByUserId(int $userId): int
    {
        return $this->db->table('incidents')->where('user_id = ?', $userId)->count();
    }

    public function findByUuid(string $uuid): ?array
    {
        $query = "
            SELECT i.*, 
                   u.first_name AS user_firstName, u.last_name AS user_lastName,
                   c.code AS category_code, c.label AS category_label, c.color AS category_color, c.icon AS category_icon
            FROM incidents i
            LEFT JOIN users u ON i.user_id = u.id
            LEFT JOIN categories c ON i.category_id = c.id
            WHERE i.uuid = :uuid
        ";
        $pdo = \App\Core\Database\Connection::getInstance();
        $stmt = $pdo->prepare($query);
        $stmt->bindValue(':uuid', $uuid);
        $stmt->execute();
        $res = $stmt->fetch();
        return $res ?: null;
    }

    public function findById(int $id): ?array
    {
        $query = "
            SELECT i.*, 
                   u.first_name AS user_firstName, u.last_name AS user_lastName,
                   c.code AS category_code, c.label AS category_label, c.color AS category_color, c.icon AS category_icon
            FROM incidents i
            LEFT JOIN users u ON i.user_id = u.id
            LEFT JOIN categories c ON i.category_id = c.id
            WHERE i.id = :id
        ";
        $pdo = \App\Core\Database\Connection::getInstance();
        $stmt = $pdo->prepare($query);
        $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
        $stmt->execute();
        $res = $stmt->fetch();
        return $res ?: null;
    }

    public function create(array $data): array
    {
        $id = $this->db->table('incidents')->insert($data);
        return $this->findById((int)$id);
    }

    public function update(int $id, array $data): array
    {
        $this->db->table('incidents')->where('id = ?', $id)->update($data);
        return $this->findById($id);
    }

    public function delete(int $id): bool
    {
        return $this->db->table('incidents')->where('id = ?', $id)->delete() > 0;
    }

    public function updateImagePath(int $id, ?string $imagePath): bool
    {
        $this->db->table('incidents')->where('id = ?', $id)->update(['image_path' => $imagePath]);
        return true;
    }

    public function getStats(?string $dateFrom, ?string $dateTo): array
    {
        $pdo = \App\Core\Database\Connection::getInstance();
        
        $dateCond = "";
        if ($dateFrom && $dateTo) {
            $dateCond = " AND created_at BETWEEN :df AND :dt ";
        }

        // Total
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM incidents WHERE 1=1 $dateCond");
        if ($dateFrom && $dateTo) { $stmt->bindValue(':df', $dateFrom); $stmt->bindValue(':dt', $dateTo); }
        $stmt->execute();
        $total = (int)$stmt->fetchColumn();

        // By Type
        $stmt = $pdo->prepare("SELECT type, COUNT(*) as count FROM incidents WHERE 1=1 $dateCond GROUP BY type");
        if ($dateFrom && $dateTo) { $stmt->bindValue(':df', $dateFrom); $stmt->bindValue(':dt', $dateTo); }
        $stmt->execute();
        $byType = $stmt->fetchAll();

        // By Severity
        $stmt = $pdo->prepare("SELECT severity, COUNT(*) as count FROM incidents WHERE 1=1 $dateCond GROUP BY severity");
        if ($dateFrom && $dateTo) { $stmt->bindValue(':df', $dateFrom); $stmt->bindValue(':dt', $dateTo); }
        $stmt->execute();
        $bySeverity = $stmt->fetchAll();

        // By Status
        $stmt = $pdo->prepare("SELECT status, COUNT(*) as count FROM incidents WHERE 1=1 $dateCond GROUP BY status");
        if ($dateFrom && $dateTo) { $stmt->bindValue(':df', $dateFrom); $stmt->bindValue(':dt', $dateTo); }
        $stmt->execute();
        $byStatus = $stmt->fetchAll();

        // By Month (12 derniers mois) - MySQL specific syntax
        $stmt = $pdo->query("
            SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count 
            FROM incidents 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY month ORDER BY month ASC
        ");
        $byMonth = $stmt->fetchAll();

        return [
            'totalIncidents' => $total,
            'byType' => $byType,
            'bySeverity' => $bySeverity,
            'byStatus' => $byStatus,
            'byMonth' => $byMonth
        ];
    }
}
