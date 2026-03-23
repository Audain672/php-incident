<?php
declare(strict_types=1);

namespace Tests\Integration;

use PHPUnit\Framework\TestCase;

class AuthTest extends TestCase
{
    private string $baseUrl = 'http://nginx';

    private function makeRequest(string $method, string $path, array $data = [], ?string $token = null): array
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->baseUrl . $path);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $headers = ['Content-Type: application/json'];
        if ($token) {
            $headers[] = 'Authorization: Bearer ' . $token;
        }
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return [
            'code' => $httpCode,
            'body' => json_decode((string)$response, true)
        ];
    }

    public function testLoginWithValidCredentials(): void
    {
        $payload = [
            'email' => 'admin@incident-reporter.local',
            'password' => 'Admin@1234' // from seed.sql and latest test
        ];

        $response = $this->makeRequest('POST', '/api/auth/login', $payload);

        $this->assertEquals(200, $response['code']);
        $this->assertTrue($response['body']['success']);
        $this->assertArrayHasKey('accessToken', $response['body']['data']);
    }

    public function testLoginWithInvalidCredentials(): void
    {
        $payload = [
            'email' => 'admin@incident-reporter.local',
            'password' => 'wrongpassword'
        ];

        $response = $this->makeRequest('POST', '/api/auth/login', $payload);

        $this->assertEquals(401, $response['code']);
        $this->assertFalse($response['body']['success']);
    }

    public function testGetMeWithValidToken(): void
    {
        // 1. Get token
        $payload = [
            'email' => 'admin@incident-reporter.local',
            'password' => 'Admin@1234'
        ];
        $loginResponse = $this->makeRequest('POST', '/api/auth/login', $payload);
        $token = $loginResponse['body']['data']['accessToken'];

        // 2. Fetch /me
        $meResponse = $this->makeRequest('GET', '/api/auth/me', [], $token);

        $this->assertEquals(200, $meResponse['code']);
        $this->assertTrue($meResponse['body']['success']);
        $this->assertEquals('Admin', $meResponse['body']['data']['user']['firstName']);
    }
}
