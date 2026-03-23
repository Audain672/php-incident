<?php
declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Shared\GeoHelper;

class GeoHelperTest extends TestCase
{
    public function testHaversineDistanceCalculatesCorrectly(): void
    {
        // Paris
        $lat1 = 48.8566;
        $lng1 = 2.3522;
        // Lyon
        $lat2 = 45.7640;
        $lng2 = 4.8357;

        $distance = GeoHelper::haversineDistance($lat1, $lng1, $lat2, $lng2);

        // Distance approx Paris-Lyon : ~392 km
        $this->assertEqualsWithDelta(392.2, $distance, 1.0, 'La distance Paris-Lyon doit être autour de 392km');
    }

    public function testDistanceIsZeroForSamePoints(): void
    {
        $lat = 48.8566;
        $lng = 2.3522;
        $distance = GeoHelper::haversineDistance($lat, $lng, $lat, $lng);
        $this->assertEquals(0, $distance);
    }
}
