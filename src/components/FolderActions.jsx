import { ArrowUpFromLine, Plus } from "lucide-react";
import { useState } from "react";
import ShareFile from "./ShareFile";
import { useDropboxStore } from "../store/useDropboxStore";

function FolderActions({ contactName }) {
  const { listFolder, uploadFileOrFolder, createFolder } = useDropboxStore();
  const [openInput, setOpenInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showUploadMenu, setShowUploadMenu] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const path = `${contactName}/${newFolderName}`;
      await createFolder(path);
      setNewFolderName("");
    } catch (error) {
      console.log(error);
    }
    await listFolder(contactName);
  };

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

  return (
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
  );
}

export default FolderActions;
