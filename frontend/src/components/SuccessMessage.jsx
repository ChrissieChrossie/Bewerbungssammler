export default function SuccessMessage({ message }) {
  return (
    <div className="p-5 mb-6 rounded-xl bg-green-50 border border-green-100 shadow-sm flex items-start animate-fade-in-up">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600 text-lg mr-4 shrink-0">✓</div>
      <div>
        <h3 className="font-semibold text-green-900">Erfolgreich</h3>
        <p className="text-green-800 mt-1 text-sm">{message}</p>
      </div>
    </div>
  )
}
