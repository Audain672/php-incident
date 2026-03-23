<?php
declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Auth\JwtService;

class JwtServiceTest extends TestCase
{
    private JwtService $service;

    protected function setUp(): void
    {
        $_ENV['JWT_SECRET'] = 'test_secret_12345';
        $_ENV['JWT_ACCESS_TTL'] = 900;
        $_ENV['JWT_REFRESH_TTL'] = 604800;
        $this->service = new JwtService();
    }

    public function testGeneratesAccessTokenCorrectly(): void
    {
        $user = ['uuid' => 'user-uuid-1', 'role' => 'USER'];
        $token = $this->service->generateAccessToken($user);

        $this->assertNotEmpty($token);

        $decoded = $this->service->verify($token);
        
        $this->assertEquals('user-uuid-1', $decoded['sub']);
        $this->assertEquals('USER', $decoded['role']);
        $this->assertEquals('access', $decoded['type']);
    }

    public function testGeneratesRefreshTokenCorrectly(): void
    {
        $user = ['uuid' => 'user-uuid-1', 'role' => 'USER'];
        $token = $this->service->generateRefreshToken($user);

        $this->assertNotEmpty($token);

        $decoded = $this->service->verify($token);
        
        $this->assertEquals('user-uuid-1', $decoded['sub']);
        $this->assertArrayHasKey('jti', $decoded);
        $this->assertEquals('refresh', $decoded['type']);
    }

    public function testVerificationFailsOnExpiredToken(): void
    {
        // TTL de 0 pour expirer immédiatement ou -1
        $_ENV['JWT_ACCESS_TTL'] = -10;
        $service = new JwtService();
        $user = ['uuid' => 'user-uuid-1', 'role' => 'USER'];
        
        $token = $service->generateAccessToken($user);

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Token expiré');
        
        $service->verify($token);
    }
}
