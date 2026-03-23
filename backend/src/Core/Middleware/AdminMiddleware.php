<?php
declare(strict_types=1);

namespace App\Core\Middleware;

use App\Core\Request;
use App\Core\Response;

class AdminMiddleware implements MiddlewareInterface
{
    public function handle(Request $request, Response $response, callable $next): void
    {
        $user = $request->getUser();

        if (!$user || ($user['role'] ?? '') !== 'ADMIN') {
            $response->forbidden('Accès réservé aux administrateurs');
        }

        $next($request, $response);
    }
}
