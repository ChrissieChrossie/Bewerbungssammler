export default function LoadingSpinner({ text = 'Lädt...' }) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <div className="relative inline-block w-14 h-14">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-20 animate-ping"></div>
          <div className="absolute inset-0 rounded-full border-4 border-gray-200 border-t-violet-600 border-r-fuchsia-500 animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-500 font-medium">{text}</p>
      </div>
    </div>
  )
}
