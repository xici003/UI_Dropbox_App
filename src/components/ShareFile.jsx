import { useState } from "react";
import { Share, ArrowLeft, UserRoundPlus } from "lucide-react";
import { useDropboxStore } from "../store/useDropboxStore";
import AddPeopleModal from "./AddPeopleModal";

function ShareFile({ contactName }) {
  const { items, getShareLink } = useDropboxStore();
  const [currentPath, setCurrentPath] = useState("/");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAddPeopleModal, setShowAddPeopleModal] = useState(false); // New state for add people modal
  const [shareLink, setShareLink] = useState("");

  const findFolderByPath = (items, path) => {
    if (path === "/") return items;
    const segments = path.split("/").filter(Boolean);

    let current = items;
    for (const segment of segments) {
      const next = current.find(
        (item) => item.name === segment && item.tag === "folder"
      );
      if (!next) return [];
      current = next.children || [];
    }
    return current;
  };

  const currentItems = findFolderByPath(items, currentPath);

  const goBack = () => {
    const segments = currentPath.split("/").filter(Boolean);
    segments.pop(); // remove last
    setCurrentPath("/" + segments.join("/"));
  };

  const handleShare = async () => {
    try {
      const link = await getShareLink(contactName, selectedFile.path);
      setShareLink(link);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="share-section">
      <button
        className="add-btn"
        onClick={() => document.getElementById("my_modal_1").showModal()}
      >
        <Share size={20} />
        <span>Share</span>
      </button>

      <dialog id="my_modal_1" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Choose a file to share</h3>

          {/* Search bar */}
          <label className="input w-full rounded-lg  border-gray-500 mt-4 mb-4">
            <svg
              className="h-[1em] opacity-50"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <g
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2.5"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </g>
            </svg>
            <input type="search" required placeholder="Search" />
          </label>

          {/* Back button */}
          {currentPath !== "/" && (
            <button
              onClick={goBack}
              className="flex items-center gap-2 mb-4 text-blue-600"
            >
              <ArrowLeft size={18} />
              Back
            </button>
          )}

          {/* List Items */}
          <div className="space-y-2">
            {currentItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-white rounded-xl shadow hover:bg-gray-100 transition cursor-pointer"
                onClick={() => {
                  if (item.tag === "folder") {
                    setCurrentPath(
                      currentPath === "/"
                        ? `/${item.name}`
                        : `${currentPath}/${item.name}`
                    );
                  } else {
                    setSelectedFile(item);
                  }
                }}
              >
                {item.tag === "file" ? (
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-blue-600"
                    checked={selectedFile?.path === item.path}
                    onChange={() =>
                      setSelectedFile(
                        selectedFile?.path === item.path ? null : item
                      )
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="text-yellow-500 text-xl">📁</span>
                )}

                <span className="text-gray-800 font-medium">{item.name}</span>
              </div>
            ))}
          </div>

          <div className="modal-action">
            <form method="dialog">
              <button className="btn border border-gray-500 rounded-lg px-4 py-2 text-gray-800 hover:bg-gray-200 mr-4">
                Cancel
              </button>
              <button
                type="button"
                className="btn bg-black hover:bg-gray-300 hover:text-black text-white rounded-lg"
                disabled={!selectedFile}
                onClick={() => {
                  const modal = document.getElementById("my_modal_1");
                  if (modal) modal.close();

                  setShowShareModal(true);
                  handleShare();
                }}
              >
                Choose
              </button>
            </form>
          </div>
        </div>
      </dialog>

      {/* Share Modal */}
      {showShareModal && (
        <dialog id="share_modal" className="modal modal-open">
          <div className="modal-box bg-[#f7f5f2]">
            <h3 className="font-bold text-lg mb-4">Share file</h3>
            <p className="text-gray-700 mb-4">
              You selected: <strong>{selectedFile?.name}</strong>
            </p>
            {/* Add People button */}
            <button
              className="btn border border-gray-300 rounded-lg w-full mt-4 mb-4 flex items-center justify-center"
              onClick={() => setShowAddPeopleModal(true)}
            >
              <UserRoundPlus size={18} /> Add People
            </button>

            <div className="flex flex-col gap-2">
              <input
                readOnly
                value={shareLink}
                className="input input-bordered w-full"
              />
              <button className="btn bg-black hover:bg-gray-300 hover:text-black text-white rounded-lg w-full">
                Copy link
              </button>
            </div>

            <div className="modal-action">
              <button
                className="btn"
                onClick={() => {
                  setShowShareModal(false);
                  setSelectedFile(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* Add People Modal */}
      {showAddPeopleModal && (
        <AddPeopleModal
          selectedFile={selectedFile}
          setShowAddPeopleModal={setShowAddPeopleModal}
        />
      )}
    </div>
  );
}

export default ShareFile;
