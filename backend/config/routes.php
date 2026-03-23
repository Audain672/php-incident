<?php
declare(strict_types=1);

use App\Core\Router;
use App\Core\Controllers\HealthController;
use App\Auth\AuthController;
use App\Incident\IncidentController;
use App\Category\CategoryController;
use App\Core\Middleware\AuthMiddleware;
use App\Core\Middleware\AdminMiddleware;

/** @var Router $router */

// --- Routes Publiques ---
$router->get('/api/health', [HealthController::class, 'check']);
$router->get('/api/categories', [CategoryController::class, 'index']);

// Auth Publique
$router->post('/api/auth/login', [AuthController::class, 'login']);
$router->post('/api/auth/register', [AuthController::class, 'register']);
$router->post('/api/auth/refresh', [AuthController::class, 'refresh']);
$router->post('/api/auth/forgot-password', [AuthController::class, 'forgotPassword']);
$router->post('/api/auth/reset-password', [AuthController::class, 'resetPassword']);

// Incidents Publique (anonymous report / liste)
$router->get('/api/incidents', [IncidentController::class, 'list']);
$router->get('/api/incidents/stats', [IncidentController::class, 'stats']);
$router->get('/api/incidents/nearby', [IncidentController::class, 'nearby']);
$router->get('/api/incidents/:id', [IncidentController::class, 'show']); // show doit être après les routes spécifiques
$router->post('/api/incidents/report', [IncidentController::class, 'report']);

// --- Routes Protégées (AuthMiddleware) ---
$router->group('/api', [AuthMiddleware::class], function(Router $r) {
    
    // Auth
    $r->get('/auth/me', [AuthController::class, 'me']);
    $r->post('/auth/logout', [AuthController::class, 'logout']);
    $r->put('/auth/profile', [AuthController::class, 'updateProfile']);
    $r->delete('/auth/account', [AuthController::class, 'deleteAccount']);

    // Incidents (Actions authentifiées)
    $r->get('/incidents/user/:id', [IncidentController::class, 'userIncidents']);
    $r->post('/incidents', [IncidentController::class, 'create']);
    $r->put('/incidents/:id', [IncidentController::class, 'update']);
    $r->post('/incidents/:id/image', [IncidentController::class, 'uploadImage']);
    $r->delete('/incidents/:id/image', [IncidentController::class, 'removeImage']);

    // Admin Seulement
    $r->delete('/incidents/:id', [IncidentController::class, 'delete'], [AdminMiddleware::class]);
});
