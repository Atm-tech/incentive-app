import { useNavigate } from "react-router-dom";
import { removeToken } from "../../auth/token";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    navigate("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 mt-4"
    >
      Logout
    </button>
  );
}
