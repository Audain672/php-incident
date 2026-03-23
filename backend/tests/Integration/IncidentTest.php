<?php
declare(strict_types=1);

namespace Tests\Integration;

use PHPUnit\Framework\TestCase;

class IncidentTest extends TestCase
{
    private string $baseUrl = 'http://nginx';
    private ?string $token = null;

    protected function setUp(): void
    {
        // Login to get a token for authentications required
        $payload = [
            'email' => 'admin@incident-reporter.local',
            'password' => 'Admin@1234'
        ];
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->baseUrl . '/api/auth/login');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        
        $raw = curl_exec($ch);
        curl_close($ch);
        
        $data = json_decode((string)$raw, true);
        if (isset($data['data']['accessToken'])) {
            $this->token = $data['data']['accessToken'];
        }
    }

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

    public function testGetIncidentsReturns200(): void
    {
        $response = $this->makeRequest('GET', '/api/incidents');

        $this->assertEquals(200, $response['code']);
        $this->assertTrue($response['body']['success']);
        $this->assertArrayHasKey('items', $response['body']['data']);
    }

    public function testAnonymousReportCreatesIncident(): void
    {
        $payload = [
            'title' => 'Accident de voiture',
            'description' => 'Un accident grave vient de se produire.',
            'type' => 'accident', // this exists in seed.sql
            'severity' => 'high',
            'latitude' => 48.8566,
            'longitude' => 2.3522
        ];

        $response = $this->makeRequest('POST', '/api/incidents/report', $payload);

        $this->assertEquals(201, $response['code']);
        $this->assertTrue($response['body']['success']);
        $this->assertEquals('Accident de voiture', $response['body']['data']['title']);
        $this->assertEquals(1, $response['body']['data']['is_anonymous']);
    }

    public function testAuthenticatedIncidentCreation(): void
    {
        // Ensure token is generated
        $this->assertNotNull($this->token, 'Token requires to setup');

        $payload = [
            'title' => 'Incendie reporté',
            'description' => 'Un incendie mineur.',
            'type' => 'fire',
            'severity' => 'medium',
            'latitude' => 45.7640,
            'longitude' => 4.8357
        ];

        $response = $this->makeRequest('POST', '/api/incidents', $payload, $this->token);

        $this->assertEquals(201, $response['code']);
        $this->assertTrue($response['body']['success']);
        $this->assertEquals('Incendie reporté', $response['body']['data']['title']);
        $this->assertEquals(0, $response['body']['data']['is_anonymous']);
        $this->assertEquals(1, $response['body']['data']['user_id']); // Admin ID
    }
}
