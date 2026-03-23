<?php
declare(strict_types=1);

namespace App\Core;

use App\Core\Middleware\CorsMiddleware;
use App\Core\Middleware\RateLimitMiddleware;
use App\Core\Cache\RedisCache;
use App\Core\Database\Connection;

class Application
{
    private Container $container;
    private Router $router;

    public function __construct(private string $basePath)
    {
        $this->loadEnvironment();
        $this->configureErrorHandling();
        $this->container = new Container();
        $this->router = new Router($this->container);
        $this->registerBindings();
        $this->loadRoutes();
    }

    public function run(): void
    {
        $request  = new Request();
        $response = new Response();

        $dummyNext = fn() => null;

        // Middlewares globaux exécutés avant tout routing
        (new CorsMiddleware())->handle($request, $response, $dummyNext);
        (new RateLimitMiddleware($this->container->get(RedisCache::class)))->handle($request, $response, $dummyNext);

        $this->router->dispatch($request, $response, $this->container);
    }

    private function loadEnvironment(): void
    {
        if (file_exists($this->basePath . '/.env')) {
            $dotenv = \Dotenv\Dotenv::createImmutable($this->basePath);
            $dotenv->load();
        }
    }

    private function configureErrorHandling(): void
    {
        set_error_handler(function ($severity, $message, $file, $line) {
            if (!(error_reporting() & $severity)) {
                return;
            }
            throw new \ErrorException($message, 0, $severity, $file, $line);
        });

        set_exception_handler(function (\Throwable $e) {
            $status = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            if ($status === 500) {
                // Default error status
                http_response_code(500);
            } else {
                http_response_code($status);
            }
            
            header('Content-Type: application/json; charset=utf-8');
            $debug = ($_ENV['APP_ENV'] ?? 'production') === 'development';
            
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => [
                    'code'    => 'EXCEPTION',
                    'details' => $debug ? $e->getTrace() : null,
                    'file'    => $debug ? $e->getFile() : null,
                    'line'    => $debug ? $e->getLine() : null,
                ]
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            exit;
        });
    }

    private function registerBindings(): void
    {
        $this->container->singleton('cache', fn() => new RedisCache());
        $this->container->singleton(RedisCache::class, fn() => new RedisCache());
        
        $this->container->singleton('db', fn() => Connection::getInstance());
        $this->container->singleton(Connection::class, fn() => Connection::getInstance());
    }

    private function loadRoutes(): void
    {
        $router = $this->router;
        require_once $this->basePath . '/config/routes.php';
    }
}
