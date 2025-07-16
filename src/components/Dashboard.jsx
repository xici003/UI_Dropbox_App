import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpFromLine, Folder, Plus } from "lucide-react";
import "../App.css";
import TreeItem from "./TreeItem.jsx";
import ShareFile from "./ShareFile.jsx";
import { useDropboxStore } from "../store/useDropboxStore.js";
import Toast from "./Toast";
import { useAuthenticated } from "../store/useAuthenticated";

function Dashboard() {
  const contactName = "NguyenVanA";
  const { logout } = useAuthenticated();
  const {
    items,
    listFolder,
    uploadFileOrFolder,
    createFolder,
    loading,
    message,
    currentPath,
    goBack,
  } = useDropboxStore();
  const [openInput, setOpenInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [contactId, setContactId] = useState(null);
  // useEffect(() => {
  //   const createContactFolder = async () => {
  //     try {
  //       const response = await axios.post(
  //         "http://localhost:3000/dropbox/create-folder",
  //         { path: `/${contactName}` },
  //         { withCredentials: true }
  //       );
  //       setMessage(response.data.message);
  //     } catch (error) {
  //       if (error.response?.status === 409) return;
  //       const errMsg =
  //         error.response?.data?.message +
  //           (error.response?.data?.error
  //             ? `: ${error.response.data.error}`
  //             : "") || error.message;
  //       setMessage(` ${errMsg}`);
  //     }
  //   };

  //   createContactFolder();
  // }, [contactName]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("contactId");
    setContactId(id);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await listFolder(contactName);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [contactName]);

  const handleUpload = async (files) => {
    for (const file of files) {
      const relativePath = file.webkitRelativePath || file.name;
      const dropboxPath = `/${contactName}/${relativePath}`;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", dropboxPath);

      try {
        await uploadFileOrFolder(formData);
      } catch (error) {
        console.error("Upload failed:", dropboxPath, error);
      }
    }

    alert("Upload completed.");
    await listFolder(contactName);
  };
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await createFolder(contactName, newFolderName);
      setNewFolderName("");
    } catch (error) {
      console.log(error);
    }
    await listFolder(contactName);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="app-container">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 flex items-center gap-2">
          <Folder /> Dropbox Folder for:{" "}
          <span className="highlight">NguyenVanA</span>
          <p className="text-lg">Contact ID: {contactId}</p>
        </h2>

        <button
          onClick={handleLogout}
          className="btn btn-sm btn-outline btn-error"
        >
          Logout
        </button>
      </div>

      <div className="add-buttons">
        <div className="action-group">
          <button className="add-btn" onClick={() => setOpenInput(!openInput)}>
            <Plus size={20} />
            <span>Create</span>
          </button>

          {openInput && (
            <form onSubmit={handleAdd} className="folder-form">
              <input
                type="text"
                placeholder="Enter folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="folder-input border border-gray-500 rounded-lg"
              />
              <button type="submit" className="create-btn rounded-lg">
                Create
              </button>
            </form>
          )}
        </div>

        <div className="upload-section">
          <button
            className="add-btn"
            onClick={() => setShowUploadMenu((prev) => !prev)}
            type="button"
          >
            <ArrowUpFromLine size={20} />
            <span>Upload</span>
          </button>

          {showUploadMenu && (
            <div className="upload-menu">
              <button
                className="menu-item"
                onClick={() => {
                  document.getElementById("hidden-file-input")?.click();
                  setShowUploadMenu(false);
                }}
              >
                Upload File
              </button>
              <button
                className="menu-item"
                onClick={() => {
                  document.getElementById("hidden-folder-input")?.click();
                  setShowUploadMenu(false);
                }}
              >
                Upload Folder
              </button>
            </div>
          )}
          <input
            type="file"
            id="hidden-file-input"
            style={{ display: "none" }}
            accept="*/*"
            onChange={async (e) => {
              const selectedFile = e.target.files[0];
              if (selectedFile) handleUpload([selectedFile]);
            }}
          />
          <input
            type="file"
            id="hidden-folder-input"
            style={{ display: "none" }}
            webkitdirectory="true"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files);
              if (files.length > 0) handleUpload(files);
            }}
          />
        </div>

        <ShareFile contactName={contactName} />
      </div>

      {loading ? (
        <div className="flex flex-col gap-4 mt-6 w-full">
          <div className="skeleton h-6 w-full"></div>
          <div className="skeleton h-6 w-full"></div>
          <div className="skeleton h-6 w-full"></div>
        </div>
      ) : (
        <div>
          {/* Back Button */}
          <div className="flex items-center justify-between mt-6 mb-4">
            <h3 className="text-lg font-semibold">
              Folder: <span className="text-gray-500">{currentPath}</span>
            </h3>

            {currentPath && currentPath !== contactName && (
              <button
                onClick={goBack}
                className="btn btn-sm btn-outline flex items-center gap-1"
              >
                <ArrowLeft size={16} />
                Back
              </button>
            )}
          </div>
          <div className="overflow-x-auto rounded-xl shadow border border-base-300">
            <table className="table w-full">
              <thead>
                <tr className="bg-base-200 text-base-content text-lg">
                  <th className="font-semibold">Name</th>
                  <th className="font-semibold">Who can access</th>
                  <th className="font-semibold">Modified</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <TreeItem
                    key={item.path}
                    item={item}
                    contactName={contactName}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Toast message={message} onClose={() => setMessage("")} />
    </div>
  );
}

export default Dashboard;
