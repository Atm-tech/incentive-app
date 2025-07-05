import { jwtDecode } from "jwt-decode";

export function getSalesmanId() {
  const token = localStorage.getItem("token");
  if (!token || typeof token !== "string") return null;

  try {
    const decoded = jwtDecode(token);
    return decoded?.id || null;
  } catch (error) {
    console.error("Token decode failed:", error);
    return null;
  }
}
