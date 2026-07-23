export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bewerbungssammler</h1>
              <p className="text-sm text-gray-600">Dein digitales Bewerbungs-Management</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
