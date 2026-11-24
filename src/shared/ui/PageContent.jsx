// Прокручиваемая область вложенной страницы (настройки, установка)
export function PageContent({ children }) {
  return (
    <main className="min-h-0 flex-1 overflow-auto px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-3">{children}</div>
    </main>
  )
}
