<?php
declare(strict_types=1);

namespace App\Shared;

class GeoHelper
{
    /**
     * Calcule la distance en kilomètres entre 2 coordonnées GPS
     * Formule de Haversine
     *
     * @param float $lat1
     * @param float $lng1
     * @param float $lat2
     * @param float $lng2
     * @return float Distance en kilomètres
     */
    public static function haversineDistance(
        float $lat1, float $lng1,
        float $lat2, float $lng2
    ): float
    {
        $earthRadius = 6371; // km

        $latDelta = deg2rad($lat2 - $lat1);
        $lngDelta = deg2rad($lng2 - $lng1);

        $a = sin($latDelta / 2) * sin($latDelta / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($lngDelta / 2) * sin($lngDelta / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }
}
