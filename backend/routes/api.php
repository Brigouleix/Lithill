<?php
/** @var \App\Core\Router $router */

// Auth
$router->post('api/auth/register',          'AuthController@register');
$router->post('api/auth/login',             'AuthController@login');
$router->post('api/auth/logout',            'AuthController@logout');
$router->get ('api/auth/me',                'AuthController@me');
$router->patch('api/auth/profile',          'AuthController@updateProfile');
$router->post ('api/auth/avatar',           'AuthController@uploadAvatar');
$router->post ('api/auth/banniere',         'AuthController@uploadBanniere');

// Catégories & Tags
$router->get('api/categories', 'CategorieController@index');
$router->get('api/tags',       'CategorieController@tags');

// Portfolios
$router->get   ('api/portfolios',           'PortfolioController@index');
$router->get   ('api/portfolios/miens',     'PortfolioController@miens');
$router->get   ('api/portfolios/{slug}',    'PortfolioController@show');
$router->post  ('api/portfolios',           'PortfolioController@store');
$router->patch ('api/portfolios/{slug}',    'PortfolioController@update');
$router->delete('api/portfolios/{slug}',    'PortfolioController@destroy');
$router->post  ('api/portfolios/{slug}/couverture', 'PortfolioController@uploadCouverture');

// Projets
$router->get ('api/projets',                'ProjetController@index');
$router->get ('api/projets/{slug}',         'ProjetController@show');
$router->post('api/projets',                'ProjetController@store');
$router->patch('api/projets/{slug}',        'ProjetController@update');
$router->delete('api/projets/{slug}',       'ProjetController@destroy');
$router->post('api/projets/{slug}/like',    'ProjetController@like');

// Médias
$router->post  ('api/projets/{slug}/medias',        'MediaController@store');
$router->delete('api/projets/{slug}/medias/{id}',   'MediaController@destroy');
$router->post  ('api/medias/{id}/react',            'ReactionController@react');

// Commentaires
$router->get   ('api/projets/{slug}/commentaires',          'CommentaireController@index');
$router->post  ('api/projets/{slug}/commentaires',          'CommentaireController@store');
$router->patch ('api/commentaires/{id}/signaler',           'CommentaireController@signaler');
$router->delete('api/commentaires/{id}',                    'CommentaireController@destroy');

// Amis
$router->get  ('api/amis/recherche',              'AmitieController@search');
$router->get  ('api/amis',                        'AmitieController@liste');
$router->get  ('api/amis/demandes',               'AmitieController@demandesRecues');
$router->post ('api/amis',                        'AmitieController@envoyer');
$router->patch('api/amis/{id}/repondre',          'AmitieController@repondre');
$router->delete('api/amis/{id}',                  'AmitieController@supprimer');

// Abonnements & Galerie
$router->post('api/utilisateurs/{id}/suivre',     'AbonnementController@suivre');
$router->get ('api/abonnements',                  'AbonnementController@abonnements');
$router->get ('api/abonnes',                      'AbonnementController@abonnes');
$router->get ('api/galerie',                      'AbonnementController@galerie');

// Stats utilisateur
$router->get('api/mes-stats', 'StatsController@miens');

// Admin
$router->get  ('api/admin/stats',                           'AdminController@stats');
$router->get  ('api/admin/users',                           'AdminController@users');
$router->patch('api/admin/users/{id}/ban',                  'AdminController@banUser');
$router->patch('api/admin/users/{id}/unban',                'AdminController@unbanUser');
$router->get  ('api/admin/commentaires/signales',           'AdminController@commentsSignales');
$router->patch('api/admin/commentaires/{id}/moderer',       'AdminController@moderateComment');
$router->get  ('api/admin/logs',                            'AdminController@logs');
