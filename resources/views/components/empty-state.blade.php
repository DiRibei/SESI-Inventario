@props([
    'title' => 'Nenhum registro encontrado',
    'description' => 'Não há itens para exibir neste momento.',
    'actionText' => null,
    'actionUrl' => null,
    'actionIcon' => null,
    'secondaryActionText' => null,
    'secondaryActionUrl' => null,
])

<div class="px-6 py-14 text-center flex flex-col items-center justify-center">
    <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-xs"
         style="background: linear-gradient(135deg, rgba(0, 129, 252, 0.08), rgba(10, 0, 70, 0.04)); color: #2263c8;">
        @if(isset($icon))
            {{ $icon }}
        @else
            <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
            </svg>
        @endif
    </div>

    <h3 class="text-sm font-extrabold text-slate-800 tracking-tight">{{ $title }}</h3>
    <p class="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">{{ $description }}</p>

    @if($actionText && $actionUrl)
    <div class="mt-4 flex flex-wrap items-center justify-center gap-2">
        <a href="{{ $actionUrl }}" class="btn-primary text-xs px-4 py-2 shadow-xs inline-flex items-center gap-1.5">
            @if($actionIcon)
                {!! $actionIcon !!}
            @else
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
            @endif
            <span>{{ $actionText }}</span>
        </a>

        @if($secondaryActionText && $secondaryActionUrl)
        <a href="{{ $secondaryActionUrl }}" class="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            {{ $secondaryActionText }}
        </a>
        @endif
    </div>
    @endif
</div>
