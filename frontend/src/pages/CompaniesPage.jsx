import { useState, useEffect } from 'react'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import SuccessMessage from '../components/SuccessMessage'
import Modal from '../components/Modal'
import FormInput from '../components/FormInput'
import { companyApi } from '../api/client'

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    homepage: ''
  })

  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await companyApi.getAll()
      setCompanies(res.data || [])
    } catch (err) {
      setError(err.response?.data?.detail || 'Fehler beim Laden der Unternehmen')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.name) errors.name = 'Unternehmen ist erforderlich'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      const payload = { ...formData, homepage: formData.homepage || null }
      if (editingId) {
        await companyApi.update(editingId, payload)
        setSuccess('Unternehmen aktualisiert!')
      } else {
        await companyApi.create(payload)
        setSuccess('Unternehmen erstellt!')
      }
      closeModal()
      loadData()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Fehler beim Speichern')
    }
  }

  const openModal = (company = null) => {
    if (company) {
      setEditingId(company.id)
      setFormData({
        name: company.name || '',
        homepage: company.homepage || ''
      })
    } else {
      setEditingId(null)
      setFormData({
        name: '',
        homepage: ''
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
      await companyApi.delete(id)
      setSuccess('Unternehmen gelöscht!')
      loadData()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Fehler beim Löschen')
    }
  }

  let filteredCompanies = companies
  if (searchTerm) {
    const search = searchTerm.toLowerCase()
    filteredCompanies = filteredCompanies.filter(c =>
      c.name.toLowerCase().includes(search)
    )
  }

  if (loading) return <LoadingSpinner text="Unternehmen werden geladen..." />

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tight bg-gradient-to-r from-violet-700 to-fuchsia-600 bg-clip-text text-transparent">Unternehmen</h2>
          <p className="text-gray-600 mt-1">Verwalte Unternehmen und Kontakte</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary">
          + Neues Unternehmen
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadData} />}
      {success && <SuccessMessage message={success} />}

      <div className="card-lg mb-6">
        <input
          type="text"
          placeholder="Suche nach Unternehmen..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="input"
        />
      </div>

      {filteredCompanies.length === 0 ? (
        <div className="card-lg text-center py-16">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center text-3xl mb-4">🏢</div>
          <p className="text-gray-600 text-lg">Noch keine Unternehmen vorhanden</p>
          <button
            onClick={() => openModal()}
            className="btn btn-primary mt-4"
          >
            Erstes Unternehmen erstellen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map(company => (
            <div key={company.id} className="card p-4">
              <h3 className="font-semibold text-gray-900 text-lg">{company.name}</h3>
              {company.homepage && (
                <a
                  href={company.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-violet-600 hover:underline mt-1 block"
                >
                  🌐 {company.homepage}
                </a>
              )}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => openModal(company)}
                  className="btn btn-secondary btn-sm flex-1"
                >
                  Bearbeiten
                </button>
                <button
                  onClick={() => handleDelete(company.id)}
                  className="btn btn-danger btn-sm flex-1"
                >
                  Löschen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? 'Unternehmen bearbeiten' : 'Neues Unternehmen'}
      >
        <form onSubmit={handleSubmit}>
          <FormInput
            label="Unternehmensname"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="z.B. Google GmbH"
            error={formErrors.name}
            required
          />

          <FormInput
            label="Webseite"
            type="url"
            value={formData.homepage}
            onChange={e => setFormData({ ...formData, homepage: e.target.value })}
            placeholder="https://beispiel.de"
          />

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
