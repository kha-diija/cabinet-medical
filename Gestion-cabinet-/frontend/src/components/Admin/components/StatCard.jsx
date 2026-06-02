export default function StatCard({ title, value, change, icon }) {
  const positive = change.startsWith("+");

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 min-h-[100px]
                    flex flex-col justify-center gap-4
                    hover:shadow-xl transition-all duration-300">

      {/* Icon */}
      <div className="flex justify-center text-blue-600 text-3xl">
        {icon}
      </div>

      {/* Title */}
      <p className="text-xs uppercase tracking-wider text-slate-500 text-center">
        {title}
      </p>

      {/* Value */}
      <p className="text-2xl font-bold text-slate-900 text-center">
        {value}
      </p>

      {/* Change */}
      <span
        className={`text-xs font-semibold text-center ${
          positive ? "text-green-600" : "text-red-600"
        }`}
      >
        {change}
      </span>
    </div>
  );
}
