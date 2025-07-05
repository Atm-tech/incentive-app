export default function RedBackground({ children, className = "" }) {
  return (
    <div className={`bg-red-100 min-h-screen w-full ${className}`}>
      {children}
    </div>
  );
}
