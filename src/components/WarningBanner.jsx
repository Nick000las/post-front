// Caixa de aviso não-bloqueante — mesmo estilo em todo lugar que precisa
// chamar atenção pra algo sem impedir a ação (ex.: lembrete de Reels,
// incompatibilidade de plataforma).
function WarningBanner({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      {children}
    </div>
  )
}

export default WarningBanner
