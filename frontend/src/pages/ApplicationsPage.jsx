import { useState, useEffect } from 'react'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import SuccessMessage from '../components/SuccessMessage'
import Modal from '../components/Modal'
import FormInput from '../components/FormInput'
import FormSelect from '../components/FormSelect'
import StatusBadge from '../components/StatusBadge'
import { applicationApi, companyApi, jobPostingApi, userApi } from '../api/client'

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [companies, setCompanies] = useState([])
  const [jobPostings, setJobPostings] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState({
    user_id: '',
    job_posting_id: '',
    applied_at: new Date().toISOString().split('T')[0],
    status: 'open',
    note: ''
  })

  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [appsRes, companiesRes, jobsRes, usersRes] = await Promise.all([
        applicationApi.getAll(),
        companyApi.getAll(),
        jobPostingApi.getAll(),
        userApi.getAll()
      ])
      setApplications(appsRes.data || [])
      setCompanies(companiesRes.data || [])
      setJobPostings(jobsRes.data || [])
      setUsers(usersRes.data || [])
    } catch (err) {
      setError(err.response?.data?.detail || 'Fehler beim Laden der Daten')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.user_id) errors.user_id = 'Bewerber ist erforderlich'
    if (!formData.job_posting_id) errors.job_posting_id = 'Stellenausschreibung ist erforderlich'
    if (!formData.applied_at) errors.applied_at = 'Bewerbungsdatum ist erforderlich'
    if (!formData.status) errors.status = 'Status ist erforderlich'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      if (editingId) {
        await applicationApi.update(editingId, formData)
        setSuccess('Bewerbung aktualisiert!')
      } else {
        await applicationApi.create(formData)
        setSuccess('Bewerbung erstellt!')
      }
      closeModal()
      loadData()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Fehler beim Speichern')
    }
  }

  const openModal = (app = null) => {
    if (app) {
      setEditingId(app.id)
      setFormData({
        user_id: app.user_id?.toString() || '',
        job_posting_id: app.job_posting_id?.toString() || '',
        applied_at: app.applied_at || '',
        status: app.status || 'open',
        note: app.note || ''
      })
    } else {
      setEditingId(null)
      setFormData({
        user_id: '',
        job_posting_id: '',
        applied_at: new Date().toISOString().split('T')[0],
        status: 'open',
        note: ''
      })
    }
    setFormErrors({})
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
  }

  const handleDelete = async (id) => {
    if (!confirm('Wirklich löschen?')) return
    try {
      await applicationApi.delete(id)
      setSuccess('Bewerbung gelöscht!')
      loadData()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Fehler beim Löschen')
    }
  }

  const getJobPosting = (id) => jobPostings.find(j => j.id === id)

  const getJobTitle = (id) => getJobPosting(id)?.title || 'Unbekannt'

  const getCompanyNameForJobPosting = (jobPostingId) => {
    const posting = getJobPosting(jobPostingId)
    if (!posting) return 'Unbekannt'
    return companies.find(c => c.id === posting.company_id)?.name || 'Unbekannt'
  }

  const getUserName = (id) => {
    return users.find(u => u.id === id)?.name || 'Unbekannt'
  }

  let filteredApplications = applications
  if (filterStatus) {
    filteredApplications = filteredApplications.filter(a => a.status === filterStatus)
  }
  if (searchTerm) {
    const search = searchTerm.toLowerCase()
    filteredApplications = filteredApplications.filter(a =>
      getCompanyNameForJobPosting(a.job_posting_id).toLowerCase().includes(search) ||
      getJobTitle(a.job_posting_id).toLowerCase().includes(search)
    )
  }

  if (loading) return <LoadingSpinner text="Bewerbungen werden geladen..." />

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tight bg-gradient-to-r from-violet-700 to-fuchsia-600 bg-clip-text text-transparent">Bewerbungen</h2>
          <p className="text-gray-600 mt-1">Verwalte alle deine Bewerbungen</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary">
          + Neue Bewerbung
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadData} />}
      {success && <SuccessMessage message={success} />}

      <div className="card-lg mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <input
              type="text"
              placeholder="Suche nach Unternehmen oder Position..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="input"
          >
            <option value="">Alle Status</option>
            <option value="open">Offen</option>
            <option value="in_progress">In Bearbeitung</option>
            <option value="invited">Eingeladen</option>
            <option value="rejected">Abgelehnt</option>
            <option value="accepted">Angenommen</option>
          </select>
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="card-lg text-center py-16">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center text-3xl mb-4">📋</div>
          <p className="text-gray-600 text-lg">Noch keine Bewerbungen vorhanden</p>
          <button
            onClick={() => openModal()}
            className="btn btn-primary mt-4"
          >
            Erste Bewerbung erstellen
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map(app => (
            <div key={app.id} className="card p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{getJobTitle(app.job_posting_id)}</h3>
                  <p className="text-sm text-gray-600 mt-1">🏢 {getCompanyNameForJobPosting(app.job_posting_id)}</p>
                  <p className="text-xs text-gray-500 mt-1">👤 {getUserName(app.user_id)}</p>
                  <p className="text-xs text-gray-500 mt-1">📅 {app.applied_at ? new Date(app.applied_at).toLocaleDateString('de-DE') : 'Unbekannt'}</p>
                  {app.note && <p className="text-sm text-gray-700 mt-2">📝 {app.note}</p>}
                </div>
                <div className="flex flex-col sm:items-end gap-3">
                  <StatusBadge status={app.status} />
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(app)}
                      className="btn btn-secondary btn-sm"
                    >
                      Bearbeiten
                    </button>
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Löschen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? 'Bewerbung bearbeiten' : 'Neue Bewerbung'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <FormSelect
            label="Bewerber"
            value={formData.user_id}
            onChange={e => setFormData({ ...formData, user_id: e.target.value })}
            options={users.map(u => ({ value: u.id, label: u.name }))}
            error={formErrors.user_id}
            required
          />

          <FormSelect
            label="Stellenausschreibung"
            value={formData.job_posting_id}
            onChange={e => setFormData({ ...formData, job_posting_id: e.target.value })}
            options={jobPostings.map(j => ({ value: j.id, label: j.title }))}
            error={formErrors.job_posting_id}
            required
          />

          <FormInput
            label="Bewerbungsdatum"
            type="date"
            value={formData.applied_at}
            onChange={e => setFormData({ ...formData, applied_at: e.target.value })}
            error={formErrors.applied_at}
            required
          />

          <FormSelect
            label="Status"
            value={formData.status}
            onChange={e => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'open', label: 'Offen' },
              { value: 'in_progress', label: 'In Bearbeitung' },
              { value: 'invited', label: 'Eingeladen' },
              { value: 'rejected', label: 'Abgelehnt' },
              { value: 'accepted', label: 'Angenommen' }
            ]}
            error={formErrors.status}
            required
          />

          <div className="form-group">
            <label className="label">Notizen</label>
            <textarea
              value={formData.note}
              onChange={e => setFormData({ ...formData, note: e.target.value })}
              placeholder="Weitere Informationen zur Bewerbung..."
              className="input min-h-24"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <button type="button" onClick={closeModal} className="btn btn-secondary">
              Abbrechen
            </button>
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Aktualisieren' : 'Erstellen'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
