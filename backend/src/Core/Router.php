<?php
declare(strict_types=1);

namespace App\Core;

class Router
{
    /** @var array<string, array<string, array{handler: callable|array, middleware: array}>> */
    private array $routes = [];

    private string $currentGroupPrefix = '';
    private array $currentGroupMiddlewares = [];

    public function group(string $prefix, array $middlewares, \Closure $callback): void
    {
        $previousPrefix = $this->currentGroupPrefix;
        $previousMiddlewares = $this->currentGroupMiddlewares;

        $this->currentGroupPrefix .= $prefix;
        $this->currentGroupMiddlewares = array_merge($this->currentGroupMiddlewares, $middlewares);

        $callback($this);

        $this->currentGroupPrefix = $previousPrefix;
        $this->currentGroupMiddlewares = $previousMiddlewares;
    }

    public function get(string $path, callable|array $handler, array $middleware = []): void
    {
        $this->addRoute('GET', $path, $handler, $middleware);
    }

    public function post(string $path, callable|array $handler, array $middleware = []): void
    {
        $this->addRoute('POST', $path, $handler, $middleware);
    }

    public function put(string $path, callable|array $handler, array $middleware = []): void
    {
        $this->addRoute('PUT', $path, $handler, $middleware);
    }

    public function delete(string $path, callable|array $handler, array $middleware = []): void
    {
        $this->addRoute('DELETE', $path, $handler, $middleware);
    }

    private function addRoute(string $method, string $path, callable|array $handler, array $middleware): void
    {
        $fullPath = rtrim($this->currentGroupPrefix . $path, '/');
        if ($fullPath === '') {
            $fullPath = '/';
        }
        $fullMiddlewares = array_merge($this->currentGroupMiddlewares, $middleware);
        $this->routes[$method][$fullPath] = ['handler' => $handler, 'middleware' => $fullMiddlewares];
    }

    public function dispatch(Request $request, Response $response, Container $container): void
    {
        $method = $request->getMethod();
        $path = $request->getPath();

        foreach ($this->routes[$method] ?? [] as $routePath => $route) {
            $params = $this->matchPath($routePath, $path);
            if ($params !== null) {
                $request->setParams($params);

                // Run middleware chain
                $handler = function () use ($route, $request, $response, $container) {
                    $this->callHandler($route['handler'], $request, $response, $container);
                };

                $middlewares = array_reverse($route['middleware']);
                foreach ($middlewares as $middlewareClass) {
                    $middleware = $container->make($middlewareClass);
                    $next = $handler;
                    $handler = function () use ($middleware, $request, $response, $next) {
                        $middleware->handle($request, $response, $next);
                    };
                }

                $handler();
                return;
            }
        }

        $response->notFound();
    }

    private function matchPath(string $routePath, string $requestPath): ?array
    {
        $routeParts = explode('/', trim($routePath, '/'));
        $requestParts = explode('/', trim($requestPath, '/'));

        if (count($routeParts) !== count($requestParts)) {
            return null;
        }

        $params = [];
        foreach ($routeParts as $i => $part) {
            if (str_starts_with($part, ':')) {
                $params[substr($part, 1)] = $requestParts[$i];
            } elseif ($part !== $requestParts[$i]) {
                return null;
            }
        }

        return $params;
    }

    private function callHandler(callable|array $handler, Request $request, Response $response, Container $container): void
    {
        if (is_callable($handler)) {
            $handler($request, $response);
        } elseif (is_array($handler) && count($handler) === 2) {
            [$controllerClass, $method] = $handler;
            $controller = $container->make($controllerClass);
            $controller->$method($request, $response);
        }
    }
}
