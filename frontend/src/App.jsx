import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoadingSpinner from './components/LoadingSpinner'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'
import { AuthProvider } from './context/AuthContext'

const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ApplicationsPage = lazy(() => import('./pages/ApplicationsPage'))
const CompaniesPage = lazy(() => import('./pages/CompaniesPage'))
const JobPostingsPage = lazy(() => import('./pages/JobPostingsPage'))
const Settings = lazy(() => import('./pages/Settings'))

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingSpinner text="Wird geladen..." />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="companies" element={<CompaniesPage />} />
            <Route path="job-postings" element={<JobPostingsPage />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}
