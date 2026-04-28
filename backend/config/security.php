<?php
define('SESSION_LIFETIME',    7200);
define('CSRF_TOKEN_LENGTH',   32);
define('MAX_LOGIN_ATTEMPTS',  5);
define('RATE_LIMIT_WINDOW',   900);
define('MAX_FILE_SIZE',       5 * 1024 * 1024);
define('ALLOWED_MIME_TYPES',  ['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
define('BCRYPT_COST',         12);
define('COOKIE_CONSENT_TTL',  13 * 30 * 24 * 3600);
