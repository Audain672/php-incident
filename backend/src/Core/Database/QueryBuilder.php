<?php
declare(strict_types=1);

namespace App\Core\Database;

use PDO;
use PDOStatement;

class QueryBuilder
{
    private PDO $pdo;
    private string $table = '';
    private array $conditions = [];
    private array $bindings = [];
    private ?int $limit = null;
    private ?int $offset = null;
    private string $orderBy = '';
    private string $select = '*';

    public function __construct()
    {
        $this->pdo = Connection::getInstance();
    }

    public function table(string $table): static
    {
        $this->table = $table;
        return $this;
    }

    public function select(string $columns): static
    {
        $this->select = $columns;
        return $this;
    }

    public function where(string $condition, mixed ...$values): static
    {
        $this->conditions[] = $condition;
        $this->bindings = array_merge($this->bindings, $values);
        return $this;
    }

    public function limit(int $limit): static
    {
        $this->limit = $limit;
        return $this;
    }

    public function offset(int $offset): static
    {
        $this->offset = $offset;
        return $this;
    }

    public function orderBy(string $column, string $direction = 'ASC'): static
    {
        $this->orderBy = " ORDER BY {$column} {$direction}";
        return $this;
    }

    public function get(): array
    {
        $sql = "SELECT {$this->select} FROM {$this->table}";
        $sql .= $this->buildWhereClause();
        $sql .= $this->orderBy;
        if ($this->limit !== null) {
            $sql .= ' LIMIT ' . (int)$this->limit;
        }
        if ($this->offset !== null) {
            $sql .= ' OFFSET ' . (int)$this->offset;
        }

        $stmt = $this->execute($sql, $this->bindings);
        return $stmt->fetchAll();
    }

    public function first(): ?array
    {
        $this->limit(1);
        $results = $this->get();
        return $results[0] ?? null;
    }

    public function count(): int
    {
        $sql = "SELECT COUNT(*) as count FROM {$this->table}";
        $sql .= $this->buildWhereClause();
        $stmt = $this->execute($sql, $this->bindings);
        $row = $stmt->fetch();
        return (int)($row['count'] ?? 0);
    }

    public function insert(array $data): string
    {
        $columns = implode(', ', array_keys($data));
        $placeholders = implode(', ', array_fill(0, count($data), '?'));
        $sql = "INSERT INTO {$this->table} ({$columns}) VALUES ({$placeholders})";
        $this->execute($sql, array_values($data));
        return (string)$this->pdo->lastInsertId();
    }

    public function update(array $data): int
    {
        $sets = implode(', ', array_map(fn($col) => "{$col} = ?", array_keys($data)));
        $sql = "UPDATE {$this->table} SET {$sets}" . $this->buildWhereClause();
        $stmt = $this->execute($sql, array_merge(array_values($data), $this->bindings));
        return $stmt->rowCount();
    }

    public function delete(): int
    {
        $sql = "DELETE FROM {$this->table}" . $this->buildWhereClause();
        $stmt = $this->execute($sql, $this->bindings);
        return $stmt->rowCount();
    }

    public function raw(string $sql, array $bindings = []): array
    {
        return $this->execute($sql, $bindings)->fetchAll();
    }

    public function rawFirst(string $sql, array $bindings = []): ?array
    {
        $result = $this->execute($sql, $bindings)->fetchAll();
        return $result[0] ?? null;
    }

    private function buildWhereClause(): string
    {
        if (empty($this->conditions)) {
            return '';
        }
        return ' WHERE ' . implode(' AND ', $this->conditions);
    }

    private function execute(string $sql, array $bindings): PDOStatement
    {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($bindings);
        return $stmt;
    }
}
