import { useState } from 'react'
import Header from './components/Header'
import Navigation from './components/Navigation'
import Dashboard from './pages/Dashboard'
import ApplicationsPage from './pages/ApplicationsPage'
import CompaniesPage from './pages/CompaniesPage'
import JobPostingsPage from './pages/JobPostingsPage'

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'applications':
        return <ApplicationsPage />
      case 'companies':
        return <CompaniesPage />
      case 'job-postings':
        return <JobPostingsPage />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPage()}
      </main>
      <footer className="border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-600">
          <p>&copy; 2026 Bewerbungssammler. Behalte den Überblick über deine Bewerbungen.</p>
        </div>
      </footer>
    </div>
  )
}
