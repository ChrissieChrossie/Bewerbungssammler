export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="card-lg bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start">
        <div className="text-red-600 text-2xl mr-4">⚠️</div>
        <div className="flex-1">
          <h3 className="font-semibold text-red-900">Fehler</h3>
          <p className="text-red-800 mt-1">{message}</p>
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
