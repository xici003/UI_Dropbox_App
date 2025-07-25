import { memo } from "react";
import { useState } from "react";
import { FileText, Folder, FolderPen, Link, Trash2 } from "lucide-react";
import { useDropboxStore } from "../store/useDropboxStore";

const TreeItem = ({ item, contactName, setShareItem }) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(item.name);

  const {
    renameItem,
    deleteItem,
    getShareLink,
    getPreview,
    setPreviewUrl,
    listFolder,
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
    try {
      const link = await getShareLink(contactName, item.path);
      setShareItem({
        name: item.name,
        path: item.path,
        link,
        isFolder: item.tag === "folder",
        contactName,
      });
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
                isFolder ? "curs or-pointer hover:underline" : ""
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
              aria-label="Share Link"
            >
              <Link size={16} />
            </button>
            <button
              onClick={() => setIsRenaming(true)}
              className="btn btn-xs btn-outline"
              aria-label="Rename Folder or File"
            >
              <FolderPen size={16} />
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-xs btn-outline btn-error"
              aria-label="Delete Folder or File"
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
    </>
  );
};

export default memo(TreeItem);
