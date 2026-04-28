<?php
namespace App\Utils;

class Validator
{
    private array $errors = [];
    private array $data;

    public function __construct(array $data) { $this->data = $data; }

    public function required(string $field, string $label = ''): static
    {
        if (empty($this->data[$field])) {
            $this->errors[$field] = ($label ?: $field) . ' est requis';
        }
        return $this;
    }

    public function email(string $field): static
    {
        if (!empty($this->data[$field]) && !filter_var($this->data[$field], FILTER_VALIDATE_EMAIL)) {
            $this->errors[$field] = 'Adresse email invalide';
        }
        return $this;
    }

    public function minLength(string $field, int $min, string $label = ''): static
    {
        $val = $this->data[$field] ?? '';
        if (strlen($val) > 0 && mb_strlen($val) < $min) {
            $this->errors[$field] = ($label ?: $field) . " : minimum {$min} caractères";
        }
        return $this;
    }

    public function maxLength(string $field, int $max, string $label = ''): static
    {
        if (mb_strlen($this->data[$field] ?? '') > $max) {
            $this->errors[$field] = ($label ?: $field) . " : maximum {$max} caractères";
        }
        return $this;
    }

    public function password(string $field): static
    {
        $val = $this->data[$field] ?? '';
        if ($val && !preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/', $val)) {
            $this->errors[$field] = '8 caractères min, une majuscule, une minuscule, un chiffre';
        }
        return $this;
    }

    public function in(string $field, array $values): static
    {
        if (!empty($this->data[$field]) && !in_array($this->data[$field], $values, true)) {
            $this->errors[$field] = 'Valeur non autorisée';
        }
        return $this;
    }

    public function fails(): bool   { return !empty($this->errors); }
    public function errors(): array { return $this->errors; }
    public function get(string $f): mixed { return $this->data[$f] ?? null; }
}
