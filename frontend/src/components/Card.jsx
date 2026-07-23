export default function Card({ children, className = '', padded = true }) {
  return (
    <div className={`card ${padded ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  )
}
