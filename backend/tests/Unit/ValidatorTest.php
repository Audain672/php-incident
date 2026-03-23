<?php
declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Shared\Validator;

class ValidatorTest extends TestCase
{
    public function testValidationPassesOnValidData(): void
    {
        $data = [
            'email' => 'test@example.com',
            'age'   => '25',
        ];
        $rules = [
            'email' => 'required|email',
            'age'   => 'required|numeric'
        ];

        $errors = Validator::validate($data, $rules);

        $this->assertEmpty($errors, 'Les données valides ne doivent pas générer d\'erreurs.');
    }

    public function testValidationFailsOnMissingRequiredFields(): void
    {
        $data = [
            'age' => '25',
        ];
        $rules = [
            'email' => 'required|email'
        ];

        $errors = Validator::validate($data, $rules);

        $this->assertArrayHasKey('email', $errors);
        $this->assertStringContainsString('obligatoire', $errors['email']);
    }

    public function testValidationFailsOnInvalidEmail(): void
    {
        $data = ['email' => 'not-an-email'];
        $rules = ['email' => 'email'];

        $errors = Validator::validate($data, $rules);
        $this->assertArrayHasKey('email', $errors);
    }
    
    public function testMinLengthValidation(): void
    {
        $data = ['password' => 'short'];
        $rules = ['password' => 'min_length:8'];

        $errors = Validator::validate($data, $rules);
        $this->assertArrayHasKey('password', $errors);
        $this->assertStringContainsString('au moins 8', $errors['password']);
    }

    public function testInValidation(): void
    {
        $data = ['status' => 'unknown'];
        $rules = ['status' => 'in:pending,closed'];

        $errors = Validator::validate($data, $rules);
        $this->assertArrayHasKey('status', $errors);
        
        $data2 = ['status' => 'closed'];
        $errors2 = Validator::validate($data2, $rules);
        $this->assertEmpty($errors2);
    }
}
