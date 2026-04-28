<?php
namespace App\Controllers;

use App\Core\Controller;
use App\Core\Auth;
use App\Models\Utilisateur;
use App\Models\Session;
use App\Models\LogAudit;
use App\Middleware\RateLimitMiddleware;
use App\Utils\Validator;
use App\Utils\Security;
use App\Utils\FileUpload;

class AuthController extends Controller
{
    public function register(): void
    {
        $data = $this->body();
        $v    = (new Validator($data))
            ->required('email', 'Email')->email('email')
            ->required('pseudo', 'Pseudo')->minLength('pseudo', 3)->maxLength('pseudo', 50)
            ->required('mot_de_passe', 'Mot de passe')->password('mot_de_passe')
            ->required('nom', 'Nom')->required('prenom', 'Prénom');

        if ($v->fails()) $this->json(['errors' => $v->errors()], 422);

        if (Utilisateur::findByEmail($data['email']))   $this->error(409, 'Email déjà utilisé');
        if (Utilisateur::findByPseudo($data['pseudo'])) $this->error(409, 'Pseudo déjà utilisé');

        $id = Utilisateur::create([
            'email'        => Security::sanitize($data['email']),
            'pseudo'       => Security::sanitize($data['pseudo']),
            'nom'          => Security::sanitize($data['nom']),
            'prenom'       => Security::sanitize($data['prenom']),
            'mot_de_passe' => $data['mot_de_passe'],
        ]);

        LogAudit::log('REGISTER', $id, ['email' => $data['email']]);
        $this->json(['message' => 'Compte créé. Confirmez votre email.'], 201);
    }

    public function login(): void
    {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        RateLimitMiddleware::check("login:{$ip}");

        $data = $this->body();
        $v    = (new Validator($data))->required('email')->email('email')->required('mot_de_passe');
        if ($v->fails()) $this->json(['errors' => $v->errors()], 422);

        $user = Utilisateur::verify($data['email'], $data['mot_de_passe']);
        if (!$user) {
            LogAudit::log('LOGIN_FAIL', null, ['email' => $data['email']]);
            $this->error(401, 'Email ou mot de passe incorrect');
        }
        if ($user['statut'] === 'banni')       $this->error(403, 'Compte suspendu');
        if ($user['statut'] === 'en_attente')  $this->error(403, 'Confirmez votre email d\'abord');

        RateLimitMiddleware::reset("login:{$ip}");
        $token = Session::create($user['id_utilisateur']);
        Utilisateur::update($user['id_utilisateur'], ['date_derniere_connexion' => date('Y-m-d H:i:s')]);
        LogAudit::log('LOGIN', $user['id_utilisateur']);

        $this->json(['token' => $token, 'user' => Utilisateur::safeData($user)]);
    }

    public function logout(): void
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (str_starts_with($header, 'Bearer ')) {
            $token = substr($header, 7);
            $user  = Auth::user();
            Session::revoke($token);
            if ($user) LogAudit::log('LOGOUT', $user['id_utilisateur']);
        }
        $this->json(['message' => 'Déconnecté']);
    }

    public function me(): void
    {
        $user = $this->requireAuth();
        $this->json(Utilisateur::safeData($user));
    }

    public function updateProfile(): void
    {
        $user = $this->requireAuth();
        $data = $this->body();
        $v    = (new Validator($data))->maxLength('bio', 500)->maxLength('nom', 100)->maxLength('prenom', 100);
        if ($v->fails()) $this->json(['errors' => $v->errors()], 422);

        $update = [];
        foreach (['nom', 'prenom', 'bio'] as $f) {
            if (isset($data[$f])) $update[$f] = Security::sanitize($data[$f]);
        }
        if (array_key_exists('badge', $data)) {
            $allowed = ['amateur', 'pro', 'pro_offres', null, ''];
            $badge   = $data['badge'] === '' ? null : $data['badge'];
            if (in_array($badge, $allowed, true)) $update['badge'] = $badge;
        }
        if ($update) Utilisateur::update($user['id_utilisateur'], $update);

        $this->json(Utilisateur::safeData(Utilisateur::find($user['id_utilisateur'])));
    }

    public function uploadAvatar(): void
    {
        $user = $this->requireAuth();
        if (empty($_FILES['avatar'])) $this->error(400, 'Aucun fichier');
        try {
            $result  = FileUpload::handle($_FILES['avatar'], 'avatars');
            $current = Utilisateur::find($user['id_utilisateur']);
            if ($current['avatar']) FileUpload::delete($current['avatar']);
            Utilisateur::update($user['id_utilisateur'], ['avatar' => $result['url_stockage']]);
            $this->json(Utilisateur::safeData(Utilisateur::find($user['id_utilisateur'])));
        } catch (\RuntimeException $e) { $this->error(400, $e->getMessage()); }
    }

    public function uploadBanniere(): void
    {
        $user = $this->requireAuth();
        if (empty($_FILES['banniere'])) $this->error(400, 'Aucun fichier');
        try {
            $result  = FileUpload::handle($_FILES['banniere'], 'bannieres');
            $current = Utilisateur::find($user['id_utilisateur']);
            if ($current['banniere']) FileUpload::delete($current['banniere']);
            Utilisateur::update($user['id_utilisateur'], ['banniere' => $result['url_stockage']]);
            $this->json(Utilisateur::safeData(Utilisateur::find($user['id_utilisateur'])));
        } catch (\RuntimeException $e) { $this->error(400, $e->getMessage()); }
    }
}
