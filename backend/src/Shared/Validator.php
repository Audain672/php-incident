<?php
declare(strict_types=1);

namespace App\Shared;

class Validator
{
    /**
     * Valide un tableau de données selon un tableau de règles.
     * Exemple de règles : ['email' => 'required|email', 'password' => 'required|min_length:8']
     * 
     * @param array $data Les données à valider (ex: $request->body())
     * @param array $rules Les règles de validation associées aux champs
     * @return array Les erreurs de validation (vide si valide)
     */
    public static function validate(array $data, array $rules): array
    {
        $errors = [];

        foreach ($rules as $field => $ruleString) {
            $fieldRules = explode('|', $ruleString);
            $value = $data[$field] ?? null;

            foreach ($fieldRules as $ruleExpression) {
                // Parsing de la règle (ex: min_length:8)
                $ruleParts = explode(':', $ruleExpression);
                $ruleName = $ruleParts[0];
                $ruleParam = $ruleParts[1] ?? null;

                // Stop la validation pour ce champ s'il est vide et non requis
                if ($ruleName !== 'required' && ($value === null || $value === '')) {
                    continue;
                }

                $error = self::applyRule($field, $value, $ruleName, $ruleParam, $data);
                if ($error) {
                    $errors[$field][] = $error;
                }
            }
        }

        // Simplifier le tableau d'erreurs (on ne garde que le premier message d'erreur par champ)
        $mappedErrors = [];
        foreach ($errors as $field => $fieldErrors) {
            $mappedErrors[$field] = $fieldErrors[0];
        }

        return $mappedErrors;
    }

    private static function applyRule(string $field, mixed $value, string $ruleName, ?string $param, array $data): ?string
    {
        switch ($ruleName) {
            case 'required':
                if ($value === null || (is_string($value) && trim($value) === '')) {
                    return "Le champ {$field} est obligatoire.";
                }
                break;
            case 'string':
                if (!is_string($value)) {
                    return "Le champ {$field} doit être une chaîne de caractères.";
                }
                break;
            case 'email':
                if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    return "Le champ {$field} doit être un email valide.";
                }
                break;
            case 'min_length':
                $min = (int)$param;
                if (is_string($value) && mb_strlen($value) < $min) {
                    return "Le champ {$field} doit contenir au moins {$min} caractères.";
                }
                break;
            case 'max_length':
                $max = (int)$param;
                if (is_string($value) && mb_strlen($value) > $max) {
                    return "Le champ {$field} ne peut pas dépasser {$max} caractères.";
                }
                break;
            case 'regex':
                if (is_string($value) && !preg_match($param, $value)) {
                    return "Le format du champ {$field} est invalide.";
                }
                break;
            case 'in':
                $allowed = explode(',', $param);
                if (!in_array((string)$value, $allowed, true)) {
                    return "Le champ {$field} contient une valeur non autorisée.";
                }
                break;
            case 'numeric':
                if (!is_numeric($value)) {
                    return "Le champ {$field} doit être un nombre.";
                }
                break;
            case 'float':
                if (!filter_var($value, FILTER_VALIDATE_FLOAT) && !is_numeric($value)) {
                    return "Le champ {$field} doit être un nombre décimal.";
                }
                break;
            case 'confirmed':
                // Ex: password_confirmation
                $confirmationField = $field . '_confirmation';
                $confirmationValue = $data[$confirmationField] ?? null;
                if ($value !== $confirmationValue) {
                    return "La confirmation du champ {$field} ne correspond pas.";
                }
                break;
        }

        return null;
    }
}
