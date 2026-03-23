<?php
declare(strict_types=1);

namespace App\Auth;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Ramsey\Uuid\Uuid;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;
use Firebase\JWT\BeforeValidException;

class JwtService
{
    private string $secret;
    private int $accessTtl;
    private int $refreshTtl;

    public function __construct()
    {
        $this->secret     = $_ENV['JWT_SECRET'] ?? 'default_secret_key_change_in_production';
        $this->accessTtl  = (int)($_ENV['JWT_ACCESS_TTL'] ?? 900);   // 15 minutes par défaut
        $this->refreshTtl = (int)($_ENV['JWT_REFRESH_TTL'] ?? 604800); // 7 jours par défaut
    }

    public function generateAccessToken(array $user): string
    {
        $payload = [
            'sub'  => $user['uuid'],
            'role' => $user['role'],
            'iat'  => time(),
            'exp'  => time() + $this->accessTtl,
            'type' => 'access'
        ];

        return JWT::encode($payload, $this->secret, 'HS256');
    }

    public function generateRefreshToken(array $user): string
    {
        $payload = [
            'sub'  => $user['uuid'],
            'jti'  => Uuid::uuid4()->toString(),
            'iat'  => time(),
            'exp'  => time() + $this->refreshTtl,
            'type' => 'refresh'
        ];

        return JWT::encode($payload, $this->secret, 'HS256');
    }

    public function verify(string $token): array
    {
        try {
            $decoded = JWT::decode($token, new Key($this->secret, 'HS256'));
            return (array)$decoded;
        } catch (ExpiredException $e) {
            throw new \InvalidArgumentException('Token expiré', 401);
        } catch (SignatureInvalidException $e) {
            throw new \InvalidArgumentException('Signature du token invalide', 401);
        } catch (BeforeValidException $e) {
            throw new \InvalidArgumentException('Token non encore valide', 401);
        } catch (\Exception $e) {
            throw new \InvalidArgumentException('Token invalide', 401);
        }
    }

    public function decode(string $token): array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            throw new \InvalidArgumentException('Format de token invalide');
        }

        $payload = base64_decode(strtr($parts[1], '-_', '+/'));
        return json_decode($payload, true) ?: [];
    }
}
