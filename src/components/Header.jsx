import { Folder } from "lucide-react";
import { useAuthenticated } from "../store/useAuthenticated";

function Header({ contactName }) {
  const { logout } = useAuthenticated();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
  return (
    <div className="flex flex-col">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleLogout}
          className="btn btn-sm btn-outline btn-error"
        >
          Logout
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2 md:gap-4">
        <h2 className="text-xl md:text-3xl font-semibold text-gray-800 flex flex-wrap items-center gap-2">
          <Folder className="w-6 h-6" />
          <span>
            Dropbox Folder for:{" "}
            <span className="highlight font-bold">{contactName}</span>
          </span>
        </h2>
      </div>
    </div>
  );
}

export default Header;
