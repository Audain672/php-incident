<?php
declare(strict_types=1);

namespace App\Core;

class Request
{
    private array $params = [];
    private ?array $parsedBody = null;

    public function getMethod(): string
    {
        return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    }

    public function getPath(): string
    {
        $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
        return $uri ?? '/';
    }

    public function getQuery(string $key, mixed $default = null): mixed
    {
        return $_GET[$key] ?? $default;
    }

    public function getQueryAll(): array
    {
        return $_GET;
    }

    public function getBody(): array
    {
        if ($this->parsedBody !== null) {
            return $this->parsedBody;
        }

        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

        if (str_contains($contentType, 'application/json')) {
            $raw = file_get_contents('php://input');
            $this->parsedBody = json_decode($raw, true) ?? [];
        } else {
            $this->parsedBody = $_POST;
        }

        return $this->parsedBody;
    }

    public function input(string $key, mixed $default = null): mixed
    {
        return $this->getBody()[$key] ?? $default;
    }

    public function getFiles(): array
    {
        return $_FILES;
    }

    public function getFile(string $key): ?array
    {
        return $_FILES[$key] ?? null;
    }

    public function getHeader(string $name): ?string
    {
        $key = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
        return $_SERVER[$key] ?? $_SERVER[$name] ?? null;
    }

    public function getBearerToken(): ?string
    {
        $auth = $this->getHeader('Authorization');
        if ($auth && str_starts_with($auth, 'Bearer ')) {
            return substr($auth, 7);
        }
        return null;
    }

    public function getIp(): string
    {
        return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    }

    public function setParams(array $params): void
    {
        $this->params = $params;
    }

    public function getParam(string $key, mixed $default = null): mixed
    {
        return $this->params[$key] ?? $default;
    }

    public function getUser(): ?array
    {
        return $_SERVER['AUTH_USER'] ?? null;
    }

    public function setUser(array $user): void
    {
        $_SERVER['AUTH_USER'] = $user;
    }

    public function query(): array
    {
        return $this->getQueryAll();
    }

    public function param(string $key, mixed $default = null): mixed
    {
        return $this->getParam($key, $default);
    }

    public function file(string $key): ?array
    {
        return $this->getFile($key);
    }

    public function bearerToken(): ?string
    {
        return $this->getBearerToken();
    }
}
