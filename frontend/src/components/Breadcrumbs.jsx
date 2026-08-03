import { Link, useLocation } from 'react-router-dom'
import { ChevronRightIcon } from '@heroicons/react/24/outline'

const labels = {
  applications: 'Bewerbungen',
  companies: 'Unternehmen',
  'job-postings': 'Stellenausschreibungen',
  settings: 'Einstellungen',
}

export default function Breadcrumbs() {
  const location = useLocation()
  const segments = location.pathname.replace(/^\/dashboard\/?/, '').split('/').filter(Boolean)

  return (
    <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <ol className="flex items-center gap-1.5 text-sm text-gray-500">
        <li>
          <Link to="/dashboard" className="hover:text-violet-700 transition-colors">
            Dashboard
          </Link>
        </li>
        {segments.map((segment, idx) => (
          <li key={segment} className="flex items-center gap-1.5">
            <ChevronRightIcon className="w-4 h-4 text-gray-300" aria-hidden="true" />
            <span className={idx === segments.length - 1 ? 'text-gray-900 font-medium' : ''}>
              {labels[segment] || segment}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  )
}
