<?php
declare(strict_types=1);

namespace App\Auth;

use App\Core\Request;
use App\Core\Response;
use App\Shared\Validator;
use App\Shared\Sanitizer;

class AuthController
{
    public function __construct(private AuthService $service) {}

    public function register(Request $request, Response $response): void
    {
        $body = $request->getBody();

        $errors = Validator::validate($body, [
            'firstName' => 'required|string|min_length:2|max_length:50',
            'lastName'  => 'required|string|min_length:2|max_length:50',
            'email'     => 'required|email|max_length:100',
            'password'  => 'required|string|min_length:8'
        ]);

        if (!empty($errors)) {
            $response->error('Données invalides', 422, 'VALIDATION_ERROR', $errors);
        }

        try {
            $result = $this->service->register(Sanitizer::array($body));
            $response->json($result, 201, 'Inscription réussie');
        } catch (\DomainException $e) {
            $response->error($e->getMessage(), 409, 'CONFLICT');
        } catch (\Exception $e) {
            $response->error($e->getMessage(), 500, 'SERVER_ERROR');
        }
    }

    public function login(Request $request, Response $response): void
    {
        $body = $request->getBody();

        $errors = Validator::validate($body, [
            'email'    => 'required|email',
            'password' => 'required|string'
        ]);

        if (!empty($errors)) {
            $response->error('Données invalides', 422, 'VALIDATION_ERROR', $errors);
        }

        try {
            $result = $this->service->login($body['email'], $body['password']);
            $response->json($result, 200, 'Connexion réussie');
        } catch (\InvalidArgumentException $e) {
            $response->unauthorized('Identifiants incorrects');
        } catch (\DomainException $e) {
            $response->forbidden('Compte désactivé');
        } catch (\Exception $e) {
            $response->error($e->getMessage(), 500, 'SERVER_ERROR');
        }
    }

    public function logout(Request $request, Response $response): void
    {
        $user = $request->getUser(); // Peut être null si on logout par Refresh Token seulement
        $userId = $user ? (int)$user['sub_id'] : null; // Si JWT supporte ça
        // Pour être robuste, on l'extrait du body ou de l'auth
        
        $body = $request->getBody();
        $refreshToken = $body['refreshToken'] ?? null;

        if (!$userId && !$refreshToken) {
            $response->success([], 200, 'Rien à déconnecter'); // Just return success
        }

        // Fake id if user is null but we have a refresh token (handled in service)
        $this->service->logout($userId ?? 0, $refreshToken);
        $response->json(['success' => true], 200, 'Déconnexion réussie');
    }

    public function refresh(Request $request, Response $response): void
    {
        $body = $request->getBody();

        $errors = Validator::validate($body, [
            'refreshToken' => 'required|string'
        ]);

        if (!empty($errors)) {
            $response->error('Données invalides', 422, 'VALIDATION_ERROR', $errors);
        }

        try {
            $result = $this->service->refresh($body['refreshToken']);
            $response->json($result, 200, 'Token rafraîchi');
        } catch (\InvalidArgumentException $e) {
            $response->unauthorized($e->getMessage());
        } catch (\Exception $e) {
            $response->error($e->getMessage(), 500, 'SERVER_ERROR');
        }
    }

    public function forgotPassword(Request $request, Response $response): void
    {
        $body = $request->getBody();

        $errors = Validator::validate($body, [
            'email' => 'required|email'
        ]);

        if (!empty($errors)) {
            $response->error('Données invalides', 422, 'VALIDATION_ERROR', $errors);
        }

        try {
            $this->service->forgotPassword($body['email']);
            // Succès silencieux même si non trouvé
            $response->json(['success' => true], 200, 'Si un compte existe, un email a été envoyé.');
        } catch (\Exception $e) {
            $response->error($e->getMessage(), 500, 'SERVER_ERROR');
        }
    }

    public function resetPassword(Request $request, Response $response): void
    {
        $body = $request->getBody();

        $errors = Validator::validate($body, [
            'email'    => 'required|email',
            'token'    => 'required|string',
            'password' => 'required|string|min_length:8'
        ]);

        if (!empty($errors)) {
            $response->error('Données invalides', 422, 'VALIDATION_ERROR', $errors);
        }

        try {
            $this->service->resetPassword($body['email'], $body['token'], $body['password']);
            $response->json(['success' => true], 200, 'Mot de passe mis à jour avec succès');
        } catch (\InvalidArgumentException $e) {
            $response->error($e->getMessage(), 400, 'INVALID_REQUEST');
        } catch (\Exception $e) {
            $response->error($e->getMessage(), 500, 'SERVER_ERROR');
        }
    }

    public function me(Request $request, Response $response): void
    {
        $user = $request->getUser();
        try {
            // Le JWT payload 'sub' contient l'UUID, on le gère dans AuthMiddleware
            // Ici on va requérir l'ID interne qui devrait être injecté.
            // Corrigeons: on va utiliser UserRepository via AuthService. 
            // Mais AuthMiddleware devrait idéalement passer l'id ou l'user complet.
            // Assumons que target id = $user['internal_id'] (on modifira AuthMiddleware pour le faire)
            
            if (!isset($user['internal_id'])) {
                $response->unauthorized('Utilisateur invalide');
            }
            $profile = $this->service->getProfile((int)$user['internal_id']);
            $response->json(['user' => $profile]);
        } catch (\Exception $e) {
            $response->error($e->getMessage(), 500, 'SERVER_ERROR');
        }
    }

    public function updateProfile(Request $request, Response $response): void
    {
        $user = $request->getUser();
        if (!isset($user['internal_id'])) {
            $response->unauthorized('Utilisateur invalide');
        }

        $body = $request->getBody();

        $errors = Validator::validate($body, [
            'firstName' => 'string|min_length:2|max_length:50',
            'lastName'  => 'string|min_length:2|max_length:50',
            'phone'     => 'string|max_length:20',
            'password'  => 'string|min_length:8'
        ]);

        if (!empty($errors)) {
            $response->error('Données invalides', 422, 'VALIDATION_ERROR', $errors);
        }

        try {
            $profile = $this->service->updateProfile((int)$user['internal_id'], Sanitizer::array($body));
            $response->json(['user' => $profile], 200, 'Profil mis à jour');
        } catch (\Exception $e) {
            $response->error($e->getMessage(), 500, 'SERVER_ERROR');
        }
    }

    public function deleteAccount(Request $request, Response $response): void
    {
        $user = $request->getUser();
        if (!isset($user['internal_id'])) {
            $response->unauthorized('Utilisateur invalide');
        }

        try {
            $this->service->deleteAccount((int)$user['internal_id']);
            $response->json(['success' => true], 200, 'Compte supprimé');
        } catch (\Exception $e) {
            $response->error($e->getMessage(), 500, 'SERVER_ERROR');
        }
    }
}
