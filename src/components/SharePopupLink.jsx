import { memo } from "react";
import { useDropboxStore } from "../store/useDropboxStore";

function SharePopupLink({ item, onClose }) {
  const { isShareFolder } = useDropboxStore();
  return (
    <div className="absolute bottom-[100px] right-10 bg-base-300 z-10 p-3 rounded-lg w-lg flex justify-center">
      {isShareFolder ? (
        <span className="loading loading-ring loading-xl"></span>
      ) : (
        <div className="h-32 w-full p-2 flex flex-col justify-center">
          <h3 className="text-lg font-semibold text-gray-800">Copy link to</h3>
          <p className="text-sm text-gray-600 truncate mb-2">{item.name}</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="input input-bordered input-sm w-full"
              value={item.link}
              readOnly
            />
            <button
              onClick={() => navigator.clipboard.writeText(item.link)}
              className="btn btn-sm btn-primary"
            >
              Copy
            </button>
            <button
              onClick={onClose}
              className="btn btn-sm btn-ghost bg-black text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(SharePopupLink);
