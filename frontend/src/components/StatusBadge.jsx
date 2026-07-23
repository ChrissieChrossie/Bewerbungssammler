export default function StatusBadge({ status }) {
  const statusConfig = {
    'open': { label: 'Offen', color: 'badge-blue' },
    'in_progress': { label: 'In Bearbeitung', color: 'badge-yellow' },
    'invited': { label: 'Eingeladen', color: 'badge-green' },
    'rejected': { label: 'Abgelehnt', color: 'badge-red' },
    'accepted': { label: 'Angenommen', color: 'badge-green' },
    'withdrawn': { label: 'Zurückgezogen', color: 'badge-gray' }
  }

  const config = statusConfig[status] || { label: status, color: 'badge-gray' }

  return (
    <span className={`badge ${config.color}`}>
      {config.label}
    </span>
  )
}
