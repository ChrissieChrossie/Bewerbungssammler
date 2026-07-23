import { useState, useEffect } from 'react'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import SuccessMessage from '../components/SuccessMessage'
import Modal from '../components/Modal'
import FormInput from '../components/FormInput'
import FormSelect from '../components/FormSelect'
import { jobPostingApi, companyApi } from '../api/client'

export default function JobPostingsPage() {
  const [jobPostings, setJobPostings] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    company_id: '',
    description: '',
    location: '',
    salary_range: '',
    job_url: ''
  })

  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [jobsRes, companiesRes] = await Promise.all([
        jobPostingApi.getAll(),
        companyApi.getAll()
      ])
      setJobPostings(jobsRes.data || [])
      setCompanies(companiesRes.data || [])
    } catch (err) {
      setError(err.response?.data?.detail || 'Fehler beim Laden der Stellenausschreibungen')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.title) errors.title = 'Jobtitel ist erforderlich'
    if (!formData.company_id) errors.company_id = 'Unternehmen ist erforderlich'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      const payload = {
        ...formData,
        company_id: parseInt(formData.company_id)
      }
      if (editingId) {
        await jobPostingApi.update(editingId, payload)
        setSuccess('Stellenausschreibung aktualisiert!')
      } else {
        await jobPostingApi.create(payload)
        setSuccess('Stellenausschreibung erstellt!')
      }
      closeModal()
      loadData()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Fehler beim Speichern')
    }
  }

  const openModal = (posting = null) => {
    if (posting) {
      setEditingId(posting.id)
      setFormData({
        title: posting.title || '',
        company_id: posting.company_id?.toString() || '',
        description: posting.description || '',
        location: posting.location || '',
        salary_range: posting.salary_range || '',
        job_url: posting.job_url || ''
      })
    } else {
      setEditingId(null)
      setFormData({
        title: '',
        company_id: '',
        description: '',
        location: '',
        salary_range: '',
        job_url: ''
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
      await jobPostingApi.delete(id)
      setSuccess('Stellenausschreibung gelöscht!')
      loadData()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Fehler beim Löschen')
    }
  }

  const getCompanyName = (id) => {
    return companies.find(c => c.id === id)?.name || 'Unbekannt'
  }

  let filteredJobPostings = jobPostings
  if (searchTerm) {
    const search = searchTerm.toLowerCase()
    filteredJobPostings = filteredJobPostings.filter(j =>
      j.title.toLowerCase().includes(search) ||
      getCompanyName(j.company_id).toLowerCase().includes(search) ||
      j.location?.toLowerCase().includes(search)
    )
  }

  if (loading) return <LoadingSpinner text="Stellenausschreibungen werden geladen..." />

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Stellenausschreibungen</h2>
          <p className="text-gray-600 mt-1">Verwalte offene Positionen</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary">
          + Neue Ausschreibung
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadData} />}
      {success && <SuccessMessage message={success} />}

      <div className="card-lg mb-6">
        <input
          type="text"
          placeholder="Suche nach Jobtitel, Unternehmen oder Ort..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="input"
        />
      </div>

      {filteredJobPostings.length === 0 ? (
        <div className="card-lg text-center py-12">
          <p className="text-gray-600 text-lg">Noch keine Stellenausschreibungen vorhanden</p>
          <button
            onClick={() => openModal()}
            className="btn btn-primary mt-4"
          >
            Erste Ausschreibung erstellen
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobPostings.map(posting => (
            <div key={posting.id} className="card p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{posting.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">🏢 {getCompanyName(posting.company_id)}</p>
                  {posting.location && (
                    <p className="text-sm text-gray-600">📍 {posting.location}</p>
                  )}
                  {posting.salary_range && (
                    <p className="text-sm text-gray-600">💰 {posting.salary_range}</p>
                  )}
                  {posting.description && (
                    <p className="text-sm text-gray-700 mt-3 p-3 bg-gray-50 rounded">
                      {posting.description.substring(0, 150)}
                      {posting.description.length > 150 ? '...' : ''}
                    </p>
                  )}
                  {posting.job_url && (
                    <a
                      href={posting.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline mt-2 block"
                    >
                      🔗 Zur Ausschreibung
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(posting)}
                    className="btn btn-secondary btn-sm"
                  >
                    Bearbeiten
                  </button>
                  <button
                    onClick={() => handleDelete(posting.id)}
                    className="btn btn-danger btn-sm"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? 'Stellenausschreibung bearbeiten' : 'Neue Stellenausschreibung'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <FormInput
            label="Jobtitel"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            placeholder="z.B. Senior Developer"
            error={formErrors.title}
            required
          />

          <FormSelect
            label="Unternehmen"
            value={formData.company_id}
            onChange={e => setFormData({ ...formData, company_id: e.target.value })}
            options={companies.map(c => ({ value: c.id, label: c.name }))}
            error={formErrors.company_id}
            required
          />

          <FormInput
            label="Standort"
            value={formData.location}
            onChange={e => setFormData({ ...formData, location: e.target.value })}
            placeholder="z.B. Berlin, Remote"
          />

          <FormInput
            label="Gehaltsbereich"
            value={formData.salary_range}
            onChange={e => setFormData({ ...formData, salary_range: e.target.value })}
            placeholder="z.B. 50.000 - 60.000 EUR"
          />

          <FormInput
            label="Jobangebot URL"
            type="url"
            value={formData.job_url}
            onChange={e => setFormData({ ...formData, job_url: e.target.value })}
            placeholder="https://..."
          />

          <div className="form-group">
            <label className="label">Beschreibung</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Stellenbeschreibung und Anforderungen..."
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
