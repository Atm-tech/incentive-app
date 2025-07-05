import logo from "../../assets/logo.png";

export default function Header() {
  return (
    <div className="app-header p-4 flex justify-center">
        <img src={logo} alt="Logo" style={{ height: "40px" }} />
      </div>
  );
}
