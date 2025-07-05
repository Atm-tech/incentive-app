export function toLocalTime(utcString) {
  if (!utcString) return "—"; // fallback for null/undefined
  try {
    const date = new Date(utcString);
    if (isNaN(date.getTime())) return "Invalid date"; // fallback for junk data
    return date.toLocaleString(); // ✅ local time
  } catch {
    return "Invalid timestamp";
  }
}
