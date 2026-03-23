<?php
declare(strict_types=1);

namespace App\Core\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Auth\JwtService;
use App\Auth\UserRepository;

class AuthMiddleware implements MiddlewareInterface
{
    public function __construct(
        private JwtService $jwt,
        private UserRepository $userRepository
    ) {}

    public function handle(Request $request, Response $response, callable $next): void
    {
        $token = $request->bearerToken();

        if (!$token) {
            $response->unauthorized('Token manquant');
        }

        try {
            // 1 & 2. Extraire et valider avec JwtService
            $payload = $this->jwt->verify($token);

            if (($payload['type'] ?? '') !== 'access') {
                $response->unauthorized('Type de token invalide');
            }

            // 5. Vérifier que l'utilisateur existe et est actif
            $uuid = $payload['sub'] ?? '';
            $user = $this->userRepository->findByUuid($uuid);

            if (!$user || !$user['is_active']) {
                $response->unauthorized('Utilisateur introuvable ou inactif');
            }

            // 4. Injecter le payload enrichi dans la requête
            $payload['internal_id'] = $user['id']; // Needed for controllers
            $request->setUser($payload);
            
            $next($request, $response);
            
        } catch (\InvalidArgumentException $e) {
            // 3. Invalide ou expiré -> Response::unauthorized
            $response->unauthorized($e->getMessage());
        } catch (\Exception $e) {
            $response->unauthorized('Erreur lors de la validation du token');
        }
    }
}
