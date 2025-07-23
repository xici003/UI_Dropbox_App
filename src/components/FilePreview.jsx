import { useDropboxStore } from "../store/useDropboxStore";

function FilePreview() {
  const { previewUrl, setPreviewUrl } = useDropboxStore();
  return (
    <div className="h-full bg-base-200 shadow-lg border-l flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-bold text-lg">File Preview</h3>
        <button
          onClick={() => setPreviewUrl("")}
          className="btn btn-sm btn-ghost"
        >
          Close
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        <iframe
          src={previewUrl}
          className="w-full h-full border-none"
          allowFullScreen
        />
      </div>
    </div>
  );
}

export default FilePreview;
