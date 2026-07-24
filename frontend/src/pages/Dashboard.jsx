import { useState, useEffect } from 'react'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import { applicationApi, companyApi } from '../api/client'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [appsRes, companiesRes] = await Promise.all([
        applicationApi.getAll(),
        companyApi.getAll()
      ])

      const applications = appsRes.data || []
      const companies = companiesRes.data || []

      const statusCounts = {
        open: applications.filter(a => a.status === 'open').length,
        in_progress: applications.filter(a => a.status === 'in_progress').length,
        invited: applications.filter(a => a.status === 'invited').length,
        rejected: applications.filter(a => a.status === 'rejected').length,
        accepted: applications.filter(a => a.status === 'accepted').length,
      }

      setStats({
        totalApplications: applications.length,
        totalCompanies: companies.length,
        statusCounts
      })
    } catch (err) {
      setError(err.response?.data?.detail || 'Fehler beim Laden der Daten')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner text="Dashboard wird geladen..." />
  if (error) return <ErrorMessage message={error} onRetry={loadData} />

  const statCards = [
    { label: 'Bewerbungen insgesamt', value: stats?.totalApplications || 0, icon: '📋', gradient: 'from-violet-500 to-fuchsia-500' },
    { label: 'Unternehmen', value: stats?.totalCompanies || 0, icon: '🏢', gradient: 'from-indigo-500 to-violet-500' },
    { label: 'Offen', value: stats?.statusCounts.open || 0, icon: '📝', gradient: 'from-amber-400 to-orange-500' },
    { label: 'Einladungen', value: stats?.statusCounts.invited || 0, icon: '✉️', gradient: 'from-emerald-400 to-teal-500' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-4xl font-black tracking-tight bg-gradient-to-r from-violet-700 to-fuchsia-600 bg-clip-text text-transparent mb-2">Willkommen zurück! 👋</h2>
        <p className="text-gray-600">Hier ist ein Überblick über deine Bewerbungen</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, idx) => (
          <div key={idx} className="card-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
              </div>
              <div className={`flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} text-2xl shadow-md`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Übersicht</h3>
          <div className="space-y-3">
            {[
              { status: 'Offen', count: stats?.statusCounts.open, color: 'bg-blue-100 text-blue-800' },
              { status: 'In Bearbeitung', count: stats?.statusCounts.in_progress, color: 'bg-yellow-100 text-yellow-800' },
              { status: 'Eingeladen', count: stats?.statusCounts.invited, color: 'bg-green-100 text-green-800' },
              { status: 'Angenommen', count: stats?.statusCounts.accepted, color: 'bg-green-100 text-green-800' },
              { status: 'Abgelehnt', count: stats?.statusCounts.rejected, color: 'bg-red-100 text-red-800' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className={`badge ${item.color}`}>{item.status}</span>
                <span className="font-bold text-lg text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Tipps & Tricks</h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-violet-600 mr-3 font-bold">1.</span>
              <span>Nutze die <strong>Bewerbungen</strong>-Seite um all deine Bewerbungen zu sehen und zu verwalten</span>
            </li>
            <li className="flex items-start">
              <span className="text-violet-600 mr-3 font-bold">2.</span>
              <span>Speichere <strong>Unternehmen</strong> zentral ab, um schneller neue Bewerbungen zu erstellen</span>
            </li>
            <li className="flex items-start">
              <span className="text-violet-600 mr-3 font-bold">3.</span>
              <span>Verwalte <strong>Stellenausschreibungen</strong> um den Überblick zu behalten</span>
            </li>
            <li className="flex items-start">
              <span className="text-violet-600 mr-3 font-bold">4.</span>
              <span>Nutze die Status um deine Bewerbungen zu kategorisieren</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
