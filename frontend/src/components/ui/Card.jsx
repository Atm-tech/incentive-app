export default function Card({ title, children, className = "" }) {
  return (
    <div className={`bg-white shadow rounded-xl p-6 w-full max-w-6xl mx-auto ${className}`}>
      {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
      {children}
    </div>
  );
}
