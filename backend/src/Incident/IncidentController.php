<?php
declare(strict_types=1);

namespace App\Incident;

use App\Core\Request;
use App\Core\Response;
use App\Shared\Validator;
use App\Shared\Sanitizer;

class IncidentController
{
    public function __construct(private IncidentService $service) {}

    public function list(Request $request, Response $response): void
    {
        $query = $request->query();
        $user = $request->getUser();
        $userId = $user ? (int)$user['internal_id'] : null;

        try {
            $result = $this->service->getList($query, $userId);
            $response->paginated($result['incidents'], $result['pagination']);
        } catch (\Exception $e) {
            $response->error($e->getMessage(), 500, 'SERVER_ERROR');
        }
    }

    public function show(Request $request, Response $response): void
    {
        $uuid = $request->param('id');
        try {
            $incident = $this->service->show((string)$uuid);
            $response->json($incident);
        } catch (\InvalidArgumentException $e) {
            $response->notFound($e->getMessage());
        } catch (\Exception $e) {
            $response->error($e->getMessage(), 500, 'SERVER_ERROR');
        }
    }

    public function create(Request $request, Response $response): void
    {
        $body = $request->getBody();
        $user = $request->getUser();

        $errors = Validator::validate($body, [
            'title'     => 'required|string|max_length:100',
            'description'=>'required|string',
            'type'      => 'required|string',
            'severity'  => 'string|in:low,medium,high,critical',
            'latitude'  => 'required|numeric',
            'longitude' => 'required|numeric'
        ]);

        if (!empty($errors)) {
            $response->error('Données invalides', 422, 'VALIDATION_ERROR', $errors);
        }

        try {
            $files = [
                'image' => $request->file('image')
            ];
            $incident = $this->service->create(Sanitizer::array($body), $files, (int)$user['internal_id']);
            $response->json($incident, 201, 'Incident signalé avec succès (identifié)');
        } catch (\InvalidArgumentException $e) {
            $response->error($e->getMessage(), 400);
        } catch (\Exception $e) {
            $response->error($e->getMessage(), 500, 'SERVER_ERROR');
        }
    }

    public function update(Request $request, Response $response): void
    {
        $uuid = $request->param('id');
        $body = $request->getBody();
        $user = $request->getUser();

        $errors = Validator::validate($body, [
            'title'     => 'string|max_length:100',
            'description'=>'string',
            'severity'  => 'string|in:low,medium,high,critical',
            'status'    => 'string|in:pending,in_progress,resolved,closed'
        ]);

        if (!empty($errors)) {
            $response->error('Données invalides', 422, 'VALIDATION_ERROR', $errors);
        }

        try {
            $incident = $this->service->update((string)$uuid, Sanitizer::array($body), $user);
            $response->json($incident, 200, 'Incident mis à jour');
        } catch (\InvalidArgumentException $e) {
            $response->notFound($e->getMessage());
        } catch (\DomainException $e) {
            $response->forbidden($e->getMessage());
        } catch (\Exception $e) {
            $response->error($e->getMessage(), 500, 'SERVER_ERROR');
        }
    }

    public function delete(Request $request, Response $response): void
    {
        $uuid = $request->param('id');
        $user = $request->getUser();

        try {
            $this->service->delete((string)$uuid, $user);
            $response->json(['success' => true], 200, 'Incident supprimé');
        } catch (\InvalidArgumentException $e) {
            $response->notFound($e->getMessage());
        } catch (\DomainException $e) {
            $response->forbidden($e->getMessage());
        } catch (\Exception $e) {
            $response->error($e->getMessage(), 500, 'SERVER_ERROR');
        }
    }

    public function uploadImage(Request $request, Response $response): void
    {
        $uuid = $request->param('id');
        $user = $request->getUser();
        $file = $request->file('image');

        if (!$file) {
            $response->error('Fichier manquant', 400);
        }

        try {
            $incident = $this->service->uploadImage((string)$uuid, $file, $user);
            $response->json($incident, 200, 'Image ajoutée');
        } catch (\DomainException $e) {
            $response->forbidden($e->getMessage());
        } catch (\Exception $e) {
            $response->error($e->getMessage(), 400, 'UPLOAD_ERROR');
        }
    }

    public function removeImage(Request $request, Response $response): void
    {
        $uuid = $request->param('id');
        $user = $request->getUser();

        try {
            $this->service->removeImage((string)$uuid, $user);
            $response->json(['success' => true], 200, 'Image supprimée');
        } catch (\DomainException $e) {
            $response->forbidden($e->getMessage());
        } catch (\Exception $e) {
            $response->error($e->getMessage(), 500, 'SERVER_ERROR');
        }
    }

    public function stats(Request $request, Response $response): void
    {
        $q = $request->query();
        $df = $q['dateFrom'] ?? null;
        $dt = $q['dateTo'] ?? null;

        try {
            $stats = $this->service->getStats($df, $dt);
            $response->json($stats);
        } catch (\Exception $e) {
            $response->error($e->getMessage(), 500, 'SERVER_ERROR');
        }
    }

    public function nearby(Request $request, Response $response): void
    {
        $q = $request->query();
        $errors = Validator::validate($q, [
            'lat' => 'required|numeric',
            'lng' => 'required|numeric'
        ]);

        if (!empty($errors)) {
            $response->error('Paramètres gps manquants', 422, 'VALIDATION_ERROR', $errors);
        }

        $lat = (float)$q['lat'];
        $lng = (float)$q['lng'];
        $rad = (float)($q['radius'] ?? 10.0);
        $lim = (int)($q['limit'] ?? 20);

        try {
            $incidents = $this->service->getNearby($lat, $lng, $rad, $lim);
            $response->json($incidents);
        } catch (\Exception $e) {
            $response->error($e->getMessage(), 500, 'SERVER_ERROR');
        }
    }

    public function userIncidents(Request $request, Response $response): void
    {
        $userId = (int)$request->param('id');
        $q = $request->query();
        $page = (int)($q['page'] ?? 1);
        $limit = (int)($q['limit'] ?? 20);

        try {
            $result = $this->service->getUserIncidents($userId, $page, $limit);
            $response->paginated($result['incidents'], $result['pagination']);
        } catch (\Exception $e) {
            $response->error($e->getMessage(), 500, 'SERVER_ERROR');
        }
    }

    public function report(Request $request, Response $response): void
    {
        $body = $request->getBody();

        $errors = Validator::validate($body, [
            'title'     => 'required|string|max_length:100',
            'description'=>'required|string',
            'type'      => 'required|string',
            'severity'  => 'string|in:low,medium,high,critical',
            'latitude'  => 'required|numeric',
            'longitude' => 'required|numeric'
        ]);

        if (!empty($errors)) {
            $response->error('Données invalides', 422, 'VALIDATION_ERROR', $errors);
        }

        try {
            $files = [
                'image' => $request->file('image')
            ];
            $incident = $this->service->anonymousReport(Sanitizer::array($body), $files);
            $response->json($incident, 201, 'Signalement anonyme reçu');
        } catch (\InvalidArgumentException $e) {
            $response->error($e->getMessage(), 400);
        } catch (\Exception $e) {
            $response->error($e->getMessage(), 500, 'SERVER_ERROR');
        }
    }
}
