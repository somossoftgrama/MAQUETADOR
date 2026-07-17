interface ErrorBannerProps {
  message: string | null;
  onDismiss: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/50">
      <div className="flex-1 text-xs text-red-700 dark:text-red-400 whitespace-pre-wrap">
        {message}
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 text-red-400 hover:text-red-600 dark:hover:text-red-300"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 3l8 8M11 3l-8 8" />
        </svg>
      </button>
    </div>
  );
}
