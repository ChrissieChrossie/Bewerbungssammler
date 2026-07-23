import { useState, useEffect } from 'react'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import SuccessMessage from '../components/SuccessMessage'
import Modal from '../components/Modal'
import FormInput from '../components/FormInput'
import FormSelect from '../components/FormSelect'
import StatusBadge from '../components/StatusBadge'
import { applicationApi, companyApi, jobPostingApi } from '../api/client'

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [companies, setCompanies] = useState([])
  const [jobPostings, setJobPostings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState({
    company_id: '',
    job_posting_id: '',
    application_date: new Date().toISOString().split('T')[0],
    status: 'open',
    notes: ''
  })

  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [appsRes, companiesRes, jobsRes] = await Promise.all([
        applicationApi.getAll(),
        companyApi.getAll(),
        jobPostingApi.getAll()
      ])
      setApplications(appsRes.data || [])
      setCompanies(companiesRes.data || [])
      setJobPostings(jobsRes.data || [])
    } catch (err) {
      setError(err.response?.data?.detail || 'Fehler beim Laden der Daten')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.company_id) errors.company_id = 'Unternehmen ist erforderlich'
    if (!formData.job_posting_id) errors.job_posting_id = 'Stellenausschreibung ist erforderlich'
    if (!formData.application_date) errors.application_date = 'Bewerbungsdatum ist erforderlich'
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
        company_id: app.company_id?.toString() || '',
        job_posting_id: app.job_posting_id?.toString() || '',
        application_date: app.application_date || '',
        status: app.status || 'open',
        notes: app.notes || ''
      })
    } else {
      setEditingId(null)
      setFormData({
        company_id: '',
        job_posting_id: '',
        application_date: new Date().toISOString().split('T')[0],
        status: 'open',
        notes: ''
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

  const getCompanyName = (id) => {
    return companies.find(c => c.id === id)?.name || 'Unbekannt'
  }

  const getJobTitle = (id) => {
    return jobPostings.find(j => j.id === id)?.title || 'Unbekannt'
  }

  let filteredApplications = applications
  if (filterStatus) {
    filteredApplications = filteredApplications.filter(a => a.status === filterStatus)
  }
  if (searchTerm) {
    const search = searchTerm.toLowerCase()
    filteredApplications = filteredApplications.filter(a =>
      getCompanyName(a.company_id).toLowerCase().includes(search) ||
      getJobTitle(a.job_posting_id).toLowerCase().includes(search)
    )
  }

  if (loading) return <LoadingSpinner text="Bewerbungen werden geladen..." />

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Bewerbungen</h2>
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
            <option value="withdrawn">Zurückgezogen</option>
          </select>
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="card-lg text-center py-12">
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
                  <p className="text-sm text-gray-600 mt-1">🏢 {getCompanyName(app.company_id)}</p>
                  <p className="text-xs text-gray-500 mt-1">📅 {new Date(app.application_date).toLocaleDateString('de-DE')}</p>
                  {app.notes && <p className="text-sm text-gray-700 mt-2">📝 {app.notes}</p>}
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
            label="Unternehmen"
            value={formData.company_id}
            onChange={e => setFormData({ ...formData, company_id: e.target.value })}
            options={companies.map(c => ({ value: c.id, label: c.name }))}
            error={formErrors.company_id}
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
            value={formData.application_date}
            onChange={e => setFormData({ ...formData, application_date: e.target.value })}
            error={formErrors.application_date}
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
              { value: 'accepted', label: 'Angenommen' },
              { value: 'withdrawn', label: 'Zurückgezogen' }
            ]}
            error={formErrors.status}
            required
          />

          <div className="form-group">
            <label className="label">Notizen</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
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
