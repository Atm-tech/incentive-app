export default function ComingSoonCard({ title, description }) {
  return (
    <section className="border p-4 rounded shadow">
      <h2 className="text-lg font-bold mb-4">{title}</h2>
      <p className="text-gray-500">{description}</p>
    </section>
  );
}

