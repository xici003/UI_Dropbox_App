import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useDropboxStore } from "../store/useDropboxStore.js";
import { useContactStore } from "../store/useContactStore";

import "../App.css";
import TreeItem from "./TreeItem.jsx";
import Toast from "./Toast";
import FilePreview from "./FilePreview";
import Header from "./Header";
import FolderActions from "./FolderActions";
import SharePopupLink from "./SharePopupLink";

function Dashboard() {
  const {
    items,
    getFolderItems,
    listFolder,
    createFolder,
    loading,
    message,
    setMessage,
    currentPath,
    goBack,
    previewUrl,
  } = useDropboxStore();
  const { isFetching, contactDetails } = useContactStore();

  const [contactName, setContactName] = useState("");
  const [shareItem, setShareItem] = useState(null);

  useEffect(() => {
    if (contactDetails?.properties) {
      const name = `${contactDetails.properties.firstname} ${contactDetails.properties.lastname}`;
      setContactName(name);
    }
  }, [contactDetails]);

  useEffect(() => {
    const ensureContactFolder = async () => {
      if (!contactName) return;

      try {
        const rootItems = await getFolderItems("/");

        const folderExists = rootItems.some(
          (item) => item.name === contactName && item[".tag"] === "folder"
        );

        if (!folderExists) {
          console.log(`Folder '${contactName}' not found. Creating...`);
          await createFolder(contactName);
        }

        await listFolder(contactName);
      } catch (error) {
        console.error("Error ensuring and fetching folder:", error);
      }
    };

    ensureContactFolder();
  }, [contactName]);

  return (
    <div
      className={`grid gap-4 ${
        previewUrl ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1"
      }`}
    >
      <div className="md:col-span-2 app-container">
        {/* Name contact and logout */}
        {isFetching ? (
          <div className="skeleton h-6 w-1/2 mb-4 rounded"></div>
        ) : (
          <Header contactName={contactName} />
        )}

        <FolderActions contactName={contactName} />

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
                      setShareItem={setShareItem}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Toast message={message} onClose={() => setMessage("")} />
      </div>

      {previewUrl && (
        <div className="md:col-span-1 p-4 border border-base-300 rounded-xl shadow">
          <FilePreview />
        </div>
      )}

      {/* Share Link File Popup */}
      {shareItem && (
        <SharePopupLink item={shareItem} onClose={() => setShareItem(null)} />
      )}
    </div>
  );
}

export default Dashboard;
