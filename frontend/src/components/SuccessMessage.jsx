export default function SuccessMessage({ message }) {
  return (
    <div className="card-lg bg-green-50 border border-green-200 rounded-lg flex items-start">
      <div className="text-green-600 text-2xl mr-4">✓</div>
      <div>
        <h3 className="font-semibold text-green-900">Erfolgreich</h3>
        <p className="text-green-800 mt-1">{message}</p>
      </div>
    </div>
  )
}
