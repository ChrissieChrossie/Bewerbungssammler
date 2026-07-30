import { Link } from 'react-router-dom'

const variantClasses = {
  primary: 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/30 hover:shadow-lg hover:shadow-violet-500/40 hover:from-violet-500 hover:to-fuchsia-500',
  secondary: 'bg-gray-100 text-gray-900 border border-gray-200 hover:bg-gray-200',
  outline: 'border border-white/30 text-white hover:bg-white/10',
  ghost: 'text-violet-700 hover:bg-violet-50',
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
}

/**
 * Gemeinsame Button-Komponente für Landingpage/Login/Signup.
 * Rendert als <Link> (react-router), wenn `to` gesetzt ist, sonst als <button>.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  className = '',
  ...props
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
