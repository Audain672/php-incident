<?php
declare(strict_types=1);

namespace App\Core;

class Response
{
    public function json(mixed $data, int $status = 200, string $message = ''): void
    {
        $this->setHeaders($status);
        $body = ['success' => true, 'data' => $data];
        if ($message !== '') {
            $body['message'] = $message;
        }
        echo json_encode($body, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }

    public function error(string $message, int $status = 400, string $code = 'ERROR', array $details = []): void
    {
        $this->setHeaders($status);
        echo json_encode([
            'success' => false,
            'error' => [
                'code'    => $code,
                'message' => $message,
                'details' => $details,
            ]
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }

    public function paginated(array $items, array $pagination): void
    {
        $this->setHeaders(200);
        echo json_encode([
            'success' => true,
            'data'    => [
                'items' => $items,
                'pagination' => $pagination
            ],
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }

    public function notFound(string $message = 'Ressource introuvable'): void
    {
        $this->error($message, 404, 'NOT_FOUND');
    }

    public function unauthorized(string $message = 'Non autorisé'): void
    {
        $this->error($message, 401, 'UNAUTHORIZED');
    }

    public function forbidden(string $message = 'Accès refusé'): void
    {
        $this->error($message, 403, 'FORBIDDEN');
    }

    public function serverError(string $message = 'Erreur serveur interne'): void
    {
        $this->error($message, 500, 'SERVER_ERROR');
    }

    private function setHeaders(int $status): void
    {
        header('Content-Type: application/json; charset=UTF-8');
        http_response_code($status);
    }
}
