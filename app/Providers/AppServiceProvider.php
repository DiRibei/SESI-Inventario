<?php

namespace App\Providers;

use App\Models\Product;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(if($this->app->environment('production')) {
    \Illuminate\Support\Facades\URL::forceScheme('https');
}): void
    {
        View::composer('layouts.app', function ($view) {
            if (auth()->check()) {
                $count = Product::ativo()->estoqueCritico()->count();
                $view->with('globalCriticosCount', $count);
            }
        });
    }
}
