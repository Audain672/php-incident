<?php
/**
 * Utilitaire pour générer les hash bcrypt des mots de passe
 */

$passwords = [
    'Admin' => 'Admin@1234',
    'User'  => 'User@1234',
];

echo "Génération des hash bcrypt (cost: 12)...\n\n";

foreach ($passwords as $name => $pwd) {
    $hash = password_hash($pwd, PASSWORD_BCRYPT, ['cost' => 12]);
    echo str_pad($name, 10) . " : $pwd\n";
    echo "Hash       : $hash\n\n";
}
