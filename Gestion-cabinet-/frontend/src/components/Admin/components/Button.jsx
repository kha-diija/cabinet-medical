export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const baseStyles = "flex items-center justify-center gap-2 font-medium rounded-lg transition-colors"

  const variants = {
    primary:
      "bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed",
    secondary:
      "bg-slate-200 text-slate-900 px-4 py-2 hover:bg-slate-300 disabled:bg-slate-100",
    danger: "bg-red-600 text-white px-4 py-2 hover:bg-red-700 disabled:bg-red-300",
    ghost: "text-slate-600 px-4 py-2 hover:bg-slate-100 disabled:text-slate-300",
  }

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
