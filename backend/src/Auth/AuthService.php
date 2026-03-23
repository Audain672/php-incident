<?php
declare(strict_types=1);

namespace App\Auth;

use Ramsey\Uuid\Uuid;
use App\Shared\Mailer;

class AuthService
{
    public function __construct(
        private UserRepository $repository,
        private JwtService $jwt,
        private Mailer $mailer
    ) {}

    public function login(string $email, string $password): array
    {
        $user = $this->repository->findByEmail($email);
        
        if (!$user || !password_verify($password, $user['password_hash'])) {
            throw new \InvalidArgumentException('Identifiants incorrects');
        }

        if (!$user['is_active']) {
            throw new \DomainException('Compte désactivé');
        }

        $accessToken = $this->jwt->generateAccessToken($user);
        $refreshToken = $this->jwt->generateRefreshToken($user);

        // Stocker hash(refreshToken) en DB (sha256)
        $tokenHash = hash('sha256', $refreshToken);
        $expiresAt = new \DateTime();
        $expiresAt->modify('+' . ($_ENV['JWT_REFRESH_TTL'] ?? 604800) . ' seconds');
        
        $this->repository->saveRefreshToken((int)$user['id'], $tokenHash, $expiresAt);

        return [
            'accessToken'  => $accessToken,
            'refreshToken' => $refreshToken,
            'user'         => $this->repository->format($user)
        ];
    }

    public function register(array $data): array
    {
        if ($this->repository->findByEmail($data['email'])) {
            throw new \DomainException('Cet email est déjà utilisé');
        }

        $userId = $this->repository->create([
            'uuid'          => Uuid::uuid4()->toString(),
            'first_name'    => $data['firstName'],
            'last_name'     => $data['lastName'],
            'email'         => $data['email'],
            'password_hash' => password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]),
            'role'          => 'USER',
            'is_active'     => 1,
            'created_at'    => date('Y-m-d H:i:s'),
            'updated_at'    => date('Y-m-d H:i:s'),
        ]);

        $user = $this->repository->findById((int)$userId['id']);

        $accessToken = $this->jwt->generateAccessToken($user);
        $refreshToken = $this->jwt->generateRefreshToken($user);

        $tokenHash = hash('sha256', $refreshToken);
        $expiresAt = new \DateTime();
        $expiresAt->modify('+' . ($_ENV['JWT_REFRESH_TTL'] ?? 604800) . ' seconds');
        $this->repository->saveRefreshToken((int)$user['id'], $tokenHash, $expiresAt);

        // Envoyer email de vérification (non bloquant)
        try {
            $this->mailer->send(
                $user['email'],
                'Bienvenue sur Incident Reporter',
                "Bonjour {$user['first_name']}, votre compte a été créé avec succès."
            );
        } catch (\Exception $e) {
            // Log silencieux
        }

        return [
            'accessToken'  => $accessToken,
            'refreshToken' => $refreshToken,
            'user'         => $this->repository->format($user)
        ];
    }

    public function refresh(string $refreshToken): array
    {
        try {
            // Vérifier la signature JWT
            $payload = $this->jwt->verify($refreshToken);
        } catch (\InvalidArgumentException $e) {
            throw new \InvalidArgumentException('Token de rafraîchissement invalide ou expiré');
        }

        if (($payload['type'] ?? '') !== 'refresh') {
            throw new \InvalidArgumentException('Token invalide');
        }

        $tokenHash = hash('sha256', $refreshToken);
        $dbToken = $this->repository->findRefreshToken($tokenHash);

        if (!$dbToken) {
            throw new \InvalidArgumentException('Token non trouvé');
        }

        // Détecter réutilisation : si déjà révoqué → révoquer TOUS
        if ($dbToken['revoked']) {
            $this->repository->revokeAllUserTokens((int)$dbToken['user_id']);
            throw new \InvalidArgumentException('Token déjà révoqué. Sécurité compromise, tous vos accès sont révoqués.');
        }

        if (strtotime($dbToken['expires_at']) < time()) {
            throw new \InvalidArgumentException('Token expiré');
        }

        $user = $this->repository->findById((int)$dbToken['user_id']);
        if (!$user || !$user['is_active']) {
            throw new \InvalidArgumentException('Utilisateur inactif ou introuvable');
        }

        // Rotation : révoquer l'ancien, générer un nouveau pair
        $this->repository->revokeRefreshToken($tokenHash);

        $newAccessToken = $this->jwt->generateAccessToken($user);
        $newRefreshToken = $this->jwt->generateRefreshToken($user);

        $newTokenHash = hash('sha256', $newRefreshToken);
        $expiresAt = new \DateTime();
        $expiresAt->modify('+' . ($_ENV['JWT_REFRESH_TTL'] ?? 604800) . ' seconds');
        $this->repository->saveRefreshToken((int)$user['id'], $newTokenHash, $expiresAt);

        return [
            'accessToken'  => $newAccessToken,
            'refreshToken' => $newRefreshToken
        ];
    }

    public function logout(int $userId, ?string $refreshToken): void
    {
        if ($refreshToken) {
            $tokenHash = hash('sha256', $refreshToken);
            $this->repository->revokeRefreshToken($tokenHash);
        } else {
            $this->repository->revokeAllUserTokens($userId);
        }
    }

    public function forgotPassword(string $email): void
    {
        // 1. Chercher l'utilisateur (ne pas révéler si l'email existe)
        $user = $this->repository->findByEmail($email);
        if (!$user) {
            return; // Silencieux pour sécurité
        }

        // 2. Générer token aléatoire
        $token = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $token);
        
        // 3. Stocker hash(token) avec TTL 1h
        $expiresAt = new \DateTime('+1 hour');
        $this->repository->savePasswordReset($email, $tokenHash, $expiresAt);

        // 4. Envoyer email avec lien de reset
        $resetLink = ($_ENV['APP_URL'] ?? 'http://localhost:3000') . '/reset-password?token=' . $token . '&email=' . urlencode($email);
        try {
            $this->mailer->send(
                $email,
                'Réinitialisation de votre mot de passe',
                "Pour réinitialiser votre mot de passe, cliquez sur ce lien : $resetLink \n\nCe lien expire dans 1 heure."
            );
        } catch (\Exception $e) {
            // Log silencieux
        }
    }

    public function resetPassword(string $email, string $token, string $password): void
    {
        $tokenHash = hash('sha256', $token);
        $resetRequest = $this->repository->findPasswordReset($email, $tokenHash);

        if (!$resetRequest) {
            throw new \InvalidArgumentException('Requête invalide ou expirée');
        }

        if (strtotime($resetRequest['expires_at']) < time()) {
            throw new \InvalidArgumentException('Token expiré');
        }

        $user = $this->repository->findByEmail($email);
        if (!$user) {
            throw new \InvalidArgumentException('Utilisateur introuvable');
        }

        // Mettre à jour en DB
        $hashObj = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
        $this->repository->update((int)$user['id'], ['password_hash' => $hashObj, 'updated_at' => date('Y-m-d H:i:s')]);

        // Marquer le token comme utilisé
        $this->repository->markPasswordResetUsed((int)$resetRequest['id']);

        // Révoquer tous les refresh tokens de l'utilisateur
        $this->repository->revokeAllUserTokens((int)$user['id']);
    }

    public function getProfile(int $userId): array
    {
        $user = $this->repository->findById($userId);
        return $this->repository->format($user);
    }

    public function updateProfile(int $userId, array $data): array
    {
        $updates = ['updated_at' => date('Y-m-d H:i:s')];
        
        if (isset($data['firstName'])) {
            $updates['first_name'] = $data['firstName'];
        }
        if (isset($data['lastName'])) {
            $updates['last_name'] = $data['lastName'];
        }
        if (isset($data['phone'])) {
            $updates['phone'] = $data['phone'];
        }
        if (isset($data['password'])) {
            $updates['password_hash'] = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]);
            // Révoquer les tokens en cas de chgt de mot de passe
            $this->repository->revokeAllUserTokens($userId);
        }

        $user = $this->repository->update($userId, $updates);
        return $this->repository->format($user);
    }

    public function deleteAccount(int $userId): void
    {
        $this->repository->revokeAllUserTokens($userId);
        $this->repository->delete($userId);
    }
}
