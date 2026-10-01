<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureIsOperador
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()) {
            abort(403, 'Não autenticado.');
        }

        // Both admin and operador can access operador-level routes
        if (! in_array($request->user()->role, ['admin', 'operador'])) {
            abort(403, 'Acesso não autorizado.');
        }

        return $next($request);
    }
}
