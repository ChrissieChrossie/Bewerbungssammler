export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="p-5 mb-6 rounded-xl bg-red-50 border border-red-100 shadow-sm animate-fade-in-up">
      <div className="flex items-start">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-600 text-lg mr-4 shrink-0">⚠️</div>
        <div className="flex-1">
          <h3 className="font-semibold text-red-900">Fehler</h3>
          <p className="text-red-800 mt-1 text-sm">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="btn btn-primary btn-sm mt-3"
            >
              Erneut versuchen
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
