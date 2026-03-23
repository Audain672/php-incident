<?php
declare(strict_types=1);

namespace App\Incident;

use Ramsey\Uuid\Uuid;

class FileUploadService
{
    private string $uploadPath;
    private string $publicUrl;
    private int $maxSize;
    private array $allowedMimes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'
    ];
    private array $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'webp'];

    public function __construct()
    {
        $this->uploadPath = $_ENV['UPLOAD_PATH'] ?? '/var/www/html/storage/uploads';
        $this->publicUrl  = rtrim($_ENV['APP_URL'] ?? 'http://localhost:8080', '/') . '/storage/uploads';
        $this->maxSize    = (int)($_ENV['MAX_UPLOAD_SIZE'] ?? 5242880); // 5MB default

        if (!is_dir($this->uploadPath)) {
            mkdir($this->uploadPath, 0755, true);
        }
    }

    public function handle(array $file): string
    {
        // 1. Vérifier UPLOAD_ERR_OK
        if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            throw new \InvalidArgumentException('Erreur lors de l\'upload du fichier.');
        }

        // 2. Vérifier taille <= $this->maxSize
        if (($file['size'] ?? 0) > $this->maxSize) {
            throw new \InvalidArgumentException('Fichier trop lourd (max 5MB).');
        }

        // 3. Vérifier extension
        $filename = $file['name'] ?? '';
        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        if (!in_array($ext, $this->allowedExtensions, true)) {
            throw new \InvalidArgumentException('Extension non autorisée.');
        }

        // 4. Vérifier MIME réel via finfo_file()
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mime, $this->allowedMimes, true)) {
            throw new \InvalidArgumentException('Type de fichier (MIME) non autorisé.');
        }

        // 5. Générer nom : uuid4 + extension originale
        $newFileName = Uuid::uuid4()->toString() . '.' . $ext;
        $destination = rtrim($this->uploadPath, '/') . '/' . $newFileName;

        // 6. move_uploaded_file()
        if (!move_uploaded_file($file['tmp_name'], $destination)) {
            throw new \RuntimeException('Erreur interne lors du déplacement du fichier.');
        }

        // 7. Retourner le chemin relatif
        return $newFileName;
    }

    public function delete(string $imagePath): void
    {
        $fullPath = rtrim($this->uploadPath, '/') . '/' . basename($imagePath);
        if (file_exists($fullPath)) {
            unlink($fullPath);
        }
    }

    public function getPublicUrl(string $imagePath): string
    {
        return $this->publicUrl . '/' . basename($imagePath);
    }
}
