import { Outlet, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import Navigation from '../components/Navigation'
import Breadcrumbs from '../components/Breadcrumbs'
import Footer from '../components/Footer'

export default function DashboardLayout() {
  const location = useLocation()

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Aurora-Hintergrund: dezente, schwebende Farbflächen hinter dem Content */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-violet-300/40 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-fuchsia-300/30 rounded-full blur-3xl animate-blob [animation-delay:5s]" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl animate-blob [animation-delay:10s]" />
      </div>

      {/* Hero-Band: Header + Navigation teilen sich einen durchgehenden dunklen Gradient-Hintergrund */}
      <div className="sticky top-0 z-40 relative overflow-hidden bg-gradient-to-br from-violet-950 via-purple-900 to-fuchsia-900">
        <div className="absolute -top-20 -right-10 w-72 h-72 rounded-full bg-fuchsia-500/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/4 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute top-6 right-1/4 w-20 h-20 rounded-full border border-white/10 pointer-events-none hidden sm:block" />
        <div className="absolute bottom-4 right-16 w-3 h-3 rounded-full bg-white/30 pointer-events-none hidden sm:block" />
        <div className="absolute top-10 left-1/3 w-1.5 h-1.5 rounded-full bg-fuchsia-300/60 pointer-events-none hidden sm:block" />

        <Header />
        <Navigation />
      </div>

      <Breadcrumbs />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div key={location.pathname} className="animate-fade-in-up">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  )
}
