export default function Card({ children }) {
  return (
    <div className="bg-white shadow-md rounded-xl p-4 w-full max-w-lg mx-auto">
      {children}
    </div>
  );
}
