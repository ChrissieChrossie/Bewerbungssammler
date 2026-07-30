import { NavLink } from 'react-router-dom'
import { HomeIcon, ClipboardDocumentListIcon, BuildingOffice2Icon, BriefcaseIcon } from '@heroicons/react/24/outline'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: HomeIcon, end: true },
  { to: '/dashboard/applications', label: 'Bewerbungen', icon: ClipboardDocumentListIcon },
  { to: '/dashboard/companies', label: 'Unternehmen', icon: BuildingOffice2Icon },
  { to: '/dashboard/job-postings', label: 'Stellenausschreibungen', icon: BriefcaseIcon },
]

export default function Navigation() {
  return (
    <nav className="relative border-t border-white/10" aria-label="Dashboard-Navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto gap-2 py-3">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-200 border ${
                  isActive
                    ? 'bg-white text-violet-800 border-white shadow-md'
                    : 'text-violet-100 border-white/20 hover:bg-white/10 hover:border-white/40'
                }`
              }
            >
              <item.icon className="w-4 h-4 mr-2" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
