<?php
declare(strict_types=1);

namespace App\Incident;

use App\Core\Cache\RedisCache;
use App\Shared\PaginationHelper;
use App\Category\CategoryRepository;
use Ramsey\Uuid\Uuid;

class IncidentService
{
    public function __construct(
        private IncidentRepository $repository,
        private FileUploadService $fileService,
        private RedisCache $cache,
        private CategoryRepository $categoryRepo
    ) {}

    public function getList(array $queryParams, ?int $currentUserId): array
    {
        // 1. Sanitiser et valider les filtres
        $filters = [
            'type'     => $queryParams['type'] ?? null,
            'status'   => $queryParams['status'] ?? null,
            'severity' => $queryParams['severity'] ?? null,
            'search'   => $queryParams['search'] ?? null,
            'dateFrom' => $queryParams['dateFrom'] ?? null,
            'dateTo'   => $queryParams['dateTo'] ?? null,
        ];
        
        $page  = max(1, (int)($queryParams['page'] ?? 1));
        $limit = max(1, min(100, (int)($queryParams['limit'] ?? 15)));

        // 2. Clé de cache Redis
        $cacheKey = 'incidents:list:' . md5(serialize($filters) . $page . $limit . $currentUserId);

        // 3. Essayer de lire depuis le cache (TTL 60s)
        if ($cached = $this->cache->get($cacheKey)) {
            return $cached;
        }

        // 4. Si miss → DB
        $total = $this->repository->countAll($filters);
        $pagination = PaginationHelper::paginate($page, $limit, $total);
        $incidents = $this->repository->findAll($filters, $limit, $pagination['offset']);

        // 5. Transformer image_path en imageUrl complète + formater
        foreach ($incidents as &$inc) {
            if (!empty($inc['image_path'])) {
                $inc['imageUrl'] = $this->fileService->getPublicUrl($inc['image_path']);
            }
            // format keys to match specific API formats if needed
            $this->formatIncident($inc);
        }

        $result = [
            'incidents'  => $incidents,
            'pagination' => $pagination,
        ];

        // Stocker en cache
        $this->cache->set($cacheKey, $result, 60);

        return $result;
    }

    public function create(array $data, array $files, int $userId): array
    {
        // 1. Valider données (déjà fait partiellement dans le Controller)
        
        // Résoudre category_id par category code (ex: data['type'] = 'road_work')
        $cat = $this->categoryRepo->findByCode($data['type']);
        if (!$cat) {
            throw new \InvalidArgumentException("Catégorie / Type invalide");
        }

        $insertData = [
            'uuid'         => Uuid::uuid4()->toString(),
            'user_id'      => $userId,
            'category_id'  => $cat['id'],
            'title'        => $data['title'],
            'description'  => $data['description'],
            'type'         => $data['type'],
            'severity'     => $data['severity'] ?? 'medium',
            'status'       => 'pending',
            'latitude'     => $data['latitude'],
            'longitude'    => $data['longitude'],
            'location_name'=> $data['locationName'] ?? null,
            'is_anonymous' => 0,
            'created_at'   => date('Y-m-d H:i:s'),
            'updated_at'   => date('Y-m-d H:i:s')
        ];

        // 2. Gérer upload photo si présent
        if (!empty($files['image'])) {
            $insertData['image_path'] = $this->fileService->handle($files['image']);
        }

        // 3. Insérer
        $created = $this->repository->create($insertData);

        // 4. Invalider le cache
        $this->cache->invalidatePattern('incidents:list:*');

        if (!empty($created['image_path'])) {
            $created['imageUrl'] = $this->fileService->getPublicUrl($created['image_path']);
        }
        $this->formatIncident($created);
        
        return $created;
    }

    public function delete(string $uuid, array $currentUser): void
    {
        $incident = $this->repository->findByUuid($uuid);
        if (!$incident) {
            throw new \InvalidArgumentException("Incident introuvable", 404);
        }

        // 2. Autorisation
        if ($currentUser['role'] !== 'ADMIN' && (int)$incident['user_id'] !== (int)$currentUser['internal_id']) {
            throw new \DomainException("Non autorisé", 403);
        }

        // 3. Supprimer le fichier
        if (!empty($incident['image_path'])) {
            $this->fileService->delete($incident['image_path']);
        }

        // 4. Supprimer en DB
        $this->repository->delete((int)$incident['id']);

        // 5. Invalider cache
        $this->cache->invalidatePattern('incidents:list:*');
    }

    public function anonymousReport(array $data, array $files): array
    {
        $cat = $this->categoryRepo->findByCode($data['type']);
        if (!$cat) {
            throw new \InvalidArgumentException("Catégorie / Type invalide");
        }

        $insertData = [
            'uuid'         => Uuid::uuid4()->toString(),
            'user_id'      => null, // Anonyme
            'category_id'  => $cat['id'],
            'title'        => $data['title'],
            'description'  => $data['description'],
            'type'         => $data['type'],
            'severity'     => $data['severity'] ?? 'medium',
            'status'       => 'pending',
            'latitude'     => $data['latitude'],
            'longitude'    => $data['longitude'],
            'location_name'=> $data['locationName'] ?? null,
            'is_anonymous' => 1,
            'created_at'   => date('Y-m-d H:i:s'),
            'updated_at'   => date('Y-m-d H:i:s')
        ];

        if (!empty($files['image'])) {
            $insertData['image_path'] = $this->fileService->handle($files['image']);
        }

        $created = $this->repository->create($insertData);
        $this->cache->invalidatePattern('incidents:list:*');

        if (!empty($created['image_path'])) {
            $created['imageUrl'] = $this->fileService->getPublicUrl($created['image_path']);
        }
        $this->formatIncident($created);
        
        return $created;
    }

    public function show(string $uuid): array
    {
        $inc = $this->repository->findByUuid($uuid);
        if (!$inc) {
            throw new \InvalidArgumentException("Incident introuvable", 404);
        }
        if (!empty($inc['image_path'])) {
            $inc['imageUrl'] = $this->fileService->getPublicUrl($inc['image_path']);
        }
        $this->formatIncident($inc);
        return $inc;
    }

    public function getStats(?string $dateFrom, ?string $dateTo): array
    {
        $cacheKey = 'incidents:stats:' . md5($dateFrom . $dateTo);
        if ($cached = $this->cache->get($cacheKey)) {
            return $cached;
        }

        $stats = $this->repository->getStats($dateFrom, $dateTo);
        $this->cache->set($cacheKey, $stats, 300); // 5 min
        return $stats;
    }

    public function getNearby(float $lat, float $lng, float $radius, int $limit): array
    {
        $incidents = $this->repository->findNearby($lat, $lng, $radius, $limit);
        foreach ($incidents as &$inc) {
            if (!empty($inc['image_path'])) {
                $inc['imageUrl'] = $this->fileService->getPublicUrl($inc['image_path']);
            }
            $this->formatIncident($inc);
        }
        return $incidents;
    }

    public function getUserIncidents(int $userId, int $page, int $limit): array
    {
        $total = $this->repository->countByUserId($userId);
        $pagination = PaginationHelper::paginate($page, $limit, $total);
        $incidents = $this->repository->findByUserId($userId, $limit, $pagination['offset']);

        foreach ($incidents as &$inc) {
            if (!empty($inc['image_path'])) {
                $inc['imageUrl'] = $this->fileService->getPublicUrl($inc['image_path']);
            }
            $this->formatIncident($inc);
        }

        return [
            'incidents' => $incidents,
            'pagination' => $pagination
        ];
    }
    
    public function update(string $uuid, array $data, array $currentUser): array
    {
        $incident = $this->repository->findByUuid($uuid);
        if (!$incident) {
            throw new \InvalidArgumentException("Incident introuvable", 404);
        }

        if ($currentUser['role'] !== 'ADMIN' && (int)$incident['user_id'] !== (int)$currentUser['internal_id']) {
            throw new \DomainException("Non autorisé", 403);
        }

        $updates = ['updated_at' => date('Y-m-d H:i:s')];
        if (isset($data['title'])) $updates['title'] = $data['title'];
        if (isset($data['description'])) $updates['description'] = $data['description'];
        if (isset($data['status'])) $updates['status'] = $data['status'];
        if (isset($data['severity'])) $updates['severity'] = $data['severity'];
        
        $updated = $this->repository->update((int)$incident['id'], $updates);
        $this->cache->invalidatePattern('incidents:list:*');
        $this->cache->invalidatePattern('incidents:stats:*');
        
        $this->formatIncident($updated);
        return $updated;
    }

    public function uploadImage(string $uuid, array $file, array $currentUser): array
    {
        $incident = $this->repository->findByUuid($uuid);
        if (!$incident) {
            throw new \InvalidArgumentException("Incident introuvable", 404);
        }

        if ($currentUser['role'] !== 'ADMIN' && (int)$incident['user_id'] !== (int)$currentUser['internal_id']) {
            throw new \DomainException("Non autorisé", 403);
        }
        
        // Remove old if exists
        if (!empty($incident['image_path'])) {
            $this->fileService->delete($incident['image_path']);
        }

        $path = $this->fileService->handle($file);
        $this->repository->updateImagePath((int)$incident['id'], $path);
        
        $this->cache->invalidatePattern('incidents:list:*');
        
        $incident['image_path'] = $path;
        $incident['imageUrl'] = $this->fileService->getPublicUrl($path);
        $this->formatIncident($incident);
        return $incident;
    }

    public function removeImage(string $uuid, array $currentUser): void
    {
        $incident = $this->repository->findByUuid($uuid);
        if (!$incident || empty($incident['image_path'])) {
            return;
        }

        if ($currentUser['role'] !== 'ADMIN' && (int)$incident['user_id'] !== (int)$currentUser['internal_id']) {
            throw new \DomainException("Non autorisé", 403);
        }

        $this->fileService->delete($incident['image_path']);
        $this->repository->updateImagePath((int)$incident['id'], null);
        $this->cache->invalidatePattern('incidents:list:*');
    }

    private function formatIncident(array &$inc): void
    {
        // cleanup for api
        if (isset($inc['category_code'])) {
            $inc['category'] = [
                'code'  => $inc['category_code'],
                'label' => $inc['category_label'],
                'color' => $inc['category_color'],
                'icon'  => $inc['category_icon']
            ];
            unset($inc['category_code'], $inc['category_label'], $inc['category_color'], $inc['category_icon']);
        }
        if (isset($inc['user_firstName'])) {
            $inc['user'] = [
                'firstName' => $inc['user_firstName'],
                'lastName'  => $inc['user_lastName']
            ];
            unset($inc['user_firstName'], $inc['user_lastName']);
        }
        // numeric conversions
        if (isset($inc['latitude'])) $inc['latitude'] = (float)$inc['latitude'];
        if (isset($inc['longitude'])) $inc['longitude'] = (float)$inc['longitude'];
        if (isset($inc['is_anonymous'])) $inc['is_anonymous'] = (bool)$inc['is_anonymous'];
    }
}
