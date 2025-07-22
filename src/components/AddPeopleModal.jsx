import { UserRoundPlus } from "lucide-react";
import { useState } from "react";
import { useDropboxStore } from "../store/useDropboxStore";

function AddPeopleModal({ selectedFile, setShowAddPeopleModal }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [permission, setPermission] = useState("editor");

  const { addPeopleToSharedFolder } = useDropboxStore();
  const handleAddPeople = async () => {
    if (!selectedFile) return;
    try {
      await addPeopleToSharedFolder(
        selectedFile.id,
        email,
        permission,
        message
      );
      setShowAddPeopleModal(false);
    } catch (err) {
      console.error("Error adding people to shared folder:", err);
    }
  };

  return (
    <dialog id="add_people_modal" className="modal modal-open">
      <div className="modal-box bg-[#f7f5f2]">
        <h3 className="font-bold text-lg mb-4">Add People to Share</h3>
        <p className="text-gray-700 mb-4">{selectedFile?.name}</p>

        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Add an email or name"
            className="input w-full rounded-lg border-gray-500 pl-8 pr-4 py-2"
          />
          <span className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400 pl-2">
            <UserRoundPlus size={18} />
          </span>
        </div>
        <div className="relative mb-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a message or note"
            className="textarea w-full rounded-lg border-gray-500 py-2 mt-4"
            rows="4"
          />
        </div>

        {/* Permissions Selector */}
        <div className="mb-4">
          <label
            htmlFor="permission-select"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            People added
          </label>
          <select
            id="permission-select"
            className="select select-bordered w-full rounded-lg border-gray-500 py-2"
            value={permission}
            onChange={(e) => setPermission(e.target.value)}
          >
            <option value="editor">Can edit</option>
            <option value="viewer">Can view</option>
          </select>
        </div>

        <div className="flex justify-end gap-4">
          <button
            className="btn btn-outline"
            onClick={() => setShowAddPeopleModal(false)}
          >
            Cancel
          </button>
          <button
            className="btn bg-black hover:bg-gray-300 hover:text-black text-white px-10 rounded-lg"
            disabled={!email}
            onClick={handleAddPeople}
          >
            Share
          </button>
        </div>
      </div>
    </dialog>
  );
}

export default AddPeopleModal;
