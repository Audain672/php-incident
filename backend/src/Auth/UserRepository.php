<?php
declare(strict_types=1);

namespace App\Auth;

use App\Core\Database\QueryBuilder;

class UserRepository
{
    public function __construct(private QueryBuilder $db) {}

    public function findByEmail(string $email): ?array
    {
        return $this->db->table('users')->where('email = ?', $email)->first();
    }

    public function findByUuid(string $uuid): ?array
    {
        return $this->db->table('users')->where('uuid = ?', $uuid)->first();
    }

    public function findById(int $id): ?array
    {
        return $this->db->table('users')->where('id = ?', $id)->first();
    }

    public function create(array $data): array
    {
        $id = $this->db->table('users')->insert($data);
        return $this->findById((int)$id);
    }

    public function update(int $id, array $data): array
    {
        $this->db->table('users')->where('id = ?', $id)->update($data);
        return $this->findById($id);
    }

    public function delete(int $id): bool
    {
        return $this->db->table('users')->where('id = ?', $id)->delete() > 0;
    }

    public function saveRefreshToken(int $userId, string $tokenHash, \DateTime $expiresAt): void
    {
        $this->db->table('refresh_tokens')->insert([
            'user_id'    => $userId,
            'token_hash' => $tokenHash,
            'expires_at' => $expiresAt->format('Y-m-d H:i:s'),
            'revoked'    => 0,
            'created_at' => date('Y-m-d H:i:s')
        ]);
    }

    public function findRefreshToken(string $tokenHash): ?array
    {
        return $this->db->table('refresh_tokens')->where('token_hash = ?', $tokenHash)->first();
    }

    public function revokeRefreshToken(string $tokenHash): void
    {
        $this->db->table('refresh_tokens')
                ->where('token_hash = ?', $tokenHash)
                ->update(['revoked' => 1]);
    }

    public function revokeAllUserTokens(int $userId): void
    {
        $this->db->table('refresh_tokens')
                ->where('user_id = ?', $userId)
                ->update(['revoked' => 1]);
    }

    public function savePasswordReset(string $email, string $tokenHash, \DateTime $expiresAt): void
    {
        $this->db->table('password_resets')->insert([
            'email'      => $email,
            'token_hash' => $tokenHash,
            'expires_at' => $expiresAt->format('Y-m-d H:i:s'),
            'used'       => 0,
            'created_at' => date('Y-m-d H:i:s')
        ]);
    }

    public function findPasswordReset(string $email, string $tokenHash): ?array
    {
        return $this->db->table('password_resets')
                ->where('email = ? AND token_hash = ? AND used = 0', $email, $tokenHash)
                ->first();
    }

    public function markPasswordResetUsed(int $id): void
    {
        $this->db->table('password_resets')
                ->where('id = ?', $id)
                ->update(['used' => 1]);
    }

    public function format(array $user): array
    {
        return [
            'id'        => (int)$user['id'],
            'uuid'      => $user['uuid'],
            'firstName' => $user['first_name'],
            'lastName'  => $user['last_name'],
            'email'     => $user['email'],
            'phone'     => $user['phone'],
            'role'      => $user['role'],
            'isActive'  => (bool)$user['is_active'],
            'createdAt' => $user['created_at'],
        ];
    }
}
