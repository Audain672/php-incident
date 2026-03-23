<?php
declare(strict_types=1);

namespace App\Shared;

class Sanitizer
{
    public static function string(mixed $value): string
    {
        return htmlspecialchars(strip_tags(trim((string)$value)), ENT_QUOTES, 'UTF-8');
    }

    public static function email(mixed $value): string
    {
        return strtolower(filter_var(trim((string)$value), FILTER_SANITIZE_EMAIL) ?: '');
    }

    public static function int(mixed $value): int
    {
        return (int)filter_var($value, FILTER_SANITIZE_NUMBER_INT);
    }

    public static function float(mixed $value): float
    {
        return (float)filter_var($value, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
    }

    public static function array(array $data): array
    {
        return array_map(fn($v) => is_string($v) ? self::string($v) : $v, $data);
    }
}
