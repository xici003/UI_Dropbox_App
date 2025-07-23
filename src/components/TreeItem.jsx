import { useState } from "react";
import { FileText, Folder, FolderPen, Link, Trash2 } from "lucide-react";
import { useDropboxStore } from "../store/useDropboxStore";

const TreeItem = ({ item, contactName }) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(item.name);
  const [showShare, setShowShare] = useState(false);
  const [shareLink, setShareLink] = useState("");

  const {
    renameItem,
    deleteItem,
    getShareLink,
    getPreview,
    setPreviewUrl,
    listFolder,
    isShareFolder,
  } = useDropboxStore();
  const isFolder = item.tag === "folder";
  const modified = item.client_modified || null;

  const handleRename = async () => {
    try {
      await renameItem(contactName, item.path, newName);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`))
      return;
    try {
      await deleteItem(contactName, item.path);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async () => {
    setShowShare(true);
    try {
      const link = await getShareLink(contactName, item.path);
      setShareLink(link);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePreview = async () => {
    const path = `/${contactName}${item.path}`;
    try {
      const tempLink = await getPreview(path);
      const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
        tempLink
      )}&embedded=true`;
      setPreviewUrl(googleViewerUrl);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFolderClick = async () => {
    const path = `${contactName}${item.path}`;
    if (isFolder) {
      try {
        await listFolder(path);
      } catch (err) {
        console.error("Failed to load folder:", err);
      }
    }
  };

  const icon = isFolder ? (
    <Folder className="w-5 h-5" />
  ) : (
    <FileText className="w-5 h-5 text-gray-600" />
  );

  return (
    <>
      <tr className="relative hover:bg-base-100 transition text-sm">
        <td className="px-4 py-3 flex items-center gap-3">
          {icon}
          {isRenaming ? (
            <input
              className="input input-sm input-bordered w-full max-w-xs"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={() => setIsRenaming(false)}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              autoFocus
            />
          ) : (
            <button
              className={`truncate max-w-[300px] ${
                isFolder ? "cursor-pointer hover:underline" : ""
              }`}
              onClick={handleFolderClick}
            >
              {item.name}
            </button>
          )}
        </td>
        <td className="px-4 py-3 text-gray-500">Only you</td>
        <td className="px-4 py-3 text-gray-500">
          {modified ? new Date(modified).toLocaleDateString() : "--"}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="btn btn-xs btn-outline btn-info"
            >
              <Link size={16} />
            </button>
            <button
              onClick={() => setIsRenaming(true)}
              className="btn btn-xs btn-outline"
            >
              <FolderPen size={16} />
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-xs btn-outline btn-error"
            >
              <Trash2 size={16} />
            </button>

            {!isFolder && (
              <button
                onClick={handlePreview}
                className="btn btn-xs btn-outline "
              >
                Open
              </button>
            )}
          </div>
        </td>
      </tr>

      {/* Share link box */}
      {showShare && (
        <div className="absolute right-10 bg-base-300 z-10 p-3 rounded-lg w-80 flex justify-center">
          {isShareFolder ? (
            <span className="loading loading-ring loading-xl"></span>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="input input-bordered input-sm w-full"
                value={shareLink}
                readOnly
              />
              <button
                onClick={() => navigator.clipboard.writeText(shareLink)}
                className="btn btn-sm btn-primary"
              >
                Copy
              </button>
              <button
                onClick={() => setShowShare(false)}
                className="btn btn-sm btn-ghost bg-black text-white"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default TreeItem;
