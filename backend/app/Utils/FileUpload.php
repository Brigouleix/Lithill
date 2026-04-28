<?php
namespace App\Utils;

class FileUpload
{
    private static string $uploadDir = __DIR__ . '/../../public/uploads/';

    public static function handle(array $file, string $subdir = 'medias'): array
    {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new \RuntimeException('Erreur lors du téléchargement');
        }
        if ($file['size'] > MAX_FILE_SIZE) {
            throw new \RuntimeException('Fichier trop volumineux (max 5 Mo)');
        }

        $mime = (new \finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
        if (!in_array($mime, ALLOWED_MIME_TYPES, true)) {
            throw new \RuntimeException('Type de fichier non autorisé');
        }

        $ext  = match ($mime) {
            'image/jpeg' => 'jpg', 'image/png' => 'png',
            'image/webp' => 'webp', 'image/gif' => 'gif', default => 'bin',
        };
        $name = bin2hex(random_bytes(16)) . '.' . $ext;
        $dir  = self::$uploadDir . $subdir . '/';
        if (!is_dir($dir)) mkdir($dir, 0755, true);

        if (!move_uploaded_file($file['tmp_name'], $dir . $name)) {
            throw new \RuntimeException('Impossible de sauvegarder le fichier');
        }

        return [
            'nom_fichier'   => $name,
            'url_stockage'  => "/uploads/{$subdir}/{$name}",
            'type_mime'     => $mime,
            'taille_octets' => $file['size'],
        ];
    }

    public static function delete(string $url): void
    {
        $path = self::$uploadDir . ltrim(str_replace('/uploads/', '', $url), '/');
        if (file_exists($path)) unlink($path);
    }
}
