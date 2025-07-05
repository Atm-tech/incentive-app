export default function Button({ children, type = "button", onClick, full = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bg-red-600 hover:bg-red-700 text-white font-semibold py-20 px-4 rounded-full text-center ${full ? "w-50" : ""}`}
    >
      {children}
    </button>
  );
}
