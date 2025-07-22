import { create } from "zustand";
import axios from "axios";
import { buildTreeFromEntries } from "../utils/buildTreeFromEntries";

export const useDropboxStore = create((set, get) => ({
  items: [],
  loading: false,
  isLoadingUpload: false,
  isShareFolder: false,
  message: "",
  currentPath: "",
  pathHistory: [],
  setMessage: (msg) => set({ message: msg }),
  getFolderItems: async (path) => {
    try {
      const response = await axios.post(
        `http://localhost:3000/dropbox/list-folder`,
        { path },
        { withCredentials: true }
      );

      return response.data.data.entries;
    } catch (error) {
      console.error("Error getting folder items:", error);
      return [];
    }
  },

  listFolder: async (path) => {
    set({ loading: true });
    try {
      const response = await axios.post(
        `http://localhost:3000/dropbox/list-folder`,
        { path },
        { withCredentials: true }
      );

      const entries = response.data.data.entries;
      const filtered = entries.filter(
        (entry) => entry.path_lower !== `/${path.toLowerCase()}`
      );

      const tree = buildTreeFromEntries(filtered, `/${path}`);

      set((state) => ({
        items: tree,
        currentPath: path,
        pathHistory: [...state.pathHistory, path],
        loading: false,
      }));
    } catch (error) {
      const errMsg =
        error.response?.data?.message +
          (error.response?.data?.error
            ? `: ${error.response.data.error}`
            : "") || error.message;
      console.log(errMsg);
      set({ loading: false });
    }
  },

  uploadFileOrFolder: async (formData) => {
    set({ isLoadingUpload: true });
    try {
      const response = await axios.post(
        "http://localhost:3000/dropbox/upload-file",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      set({
        isLoadingUpload: false,
        message: response.data.message,
      });
    } catch (error) {
      console.error("Upload failed:", error);
    }
  },

  createFolder: async (path) => {
    set({ isCreatingFolder: true });
    try {
      const response = await axios.post(
        "http://localhost:3000/dropbox/create-folder",
        { path: `/${path}` },
        { withCredentials: true }
      );
      set({ loading: false, message: response.data.message });
    } catch (error) {
      const errMsg =
        error.response?.data?.message +
          (error.response?.data?.error
            ? `: ${error.response.data.error}`
            : "") || error.message;
      set({ isCreatingFolder: false, message: ` ${errMsg}` });
    }
  },
  deleteItemFromTree: (deletedItem) => {
    const deleteRecursively = (items) => {
      return items
        .filter((i) => i.path !== deletedItem.path)
        .map((i) =>
          i.children ? { ...i, children: deleteRecursively(i.children) } : i
        );
    };

    const newItems = deleteRecursively(get().items);
    set({ items: newItems });
  },

  renameItemInTree: (renamedItem, newName) => {
    const updateItems = (items) =>
      items.map((item) => {
        if (item.path === renamedItem.path) {
          const updatedPath = item.path.replace(/[^/]+$/, newName);
          return {
            ...item,
            name: newName,
            path: updatedPath,
          };
        }

        if (item.children) {
          return { ...item, children: updateItems(item.children) };
        }

        return item;
      });

    const newItems = updateItems(get().items);
    set({ items: newItems });
  },
  renameItem: async (contactName, oldPath, newName) => {
    const from_path = `/${contactName}${oldPath}`;

    const pathParts = oldPath.split("/");
    pathParts[pathParts.length - 1] = newName;
    const new_path = pathParts.join("/");
    const to_path = `/${contactName}${new_path}`;
    console.log(to_path);
    try {
      const response = await axios.post(
        "http://localhost:3000/dropbox/rename-file",
        { from_path, to_path },
        { withCredentials: true }
      );
      set({ message: response.data.message });
      get().renameItemInTree({ path: oldPath }, newName);
    } catch (err) {
      console.error(err);
    }
  },

  deleteItem: async (contactName, deleteItem) => {
    const fullPath = `/${contactName}${deleteItem}`;
    try {
      const res = await axios.post(
        "http://localhost:3000/dropbox/delete-file",
        { path: fullPath },
        { withCredentials: true }
      );
      set({ message: res.data.message });

      get().deleteItemFromTree({ path: deleteItem });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error?.summary ||
        err.message;
      console.error(msg);
    }
  },

  getShareLink: async (contactName, pathItem) => {
    const path = `/${contactName}${pathItem}`;
    try {
      set({ isShareFolder: true });
      const res = await axios.post(
        "http://localhost:3000/dropbox/share-link",
        { path },
        { withCredentials: true }
      );
      set({ isShareFolder: false });
      return res.data.url;
    } catch (err) {
      console.error(err);
      set({ isShareFolder: false });
      throw new Error("Failed to get share link");
    }
  },
  addPeopleToSharedFolder: async (
    sharedFolderId,
    email,
    accessLevel,
    message
  ) => {
    try {
      set({ isShareFolder: true });

      const addPeopleResponse = await axios.post(
        "http://localhost:3000/dropbox/add-people-to-shared-file",
        { email, sharedFolderId, accessLevel, message },
        { withCredentials: true }
      );

      set({ isShareFolder: false, message: addPeopleResponse.data.message });
    } catch (err) {
      console.error("Error adding people to shared folder:", err);
      set({ isShareFolder: false });
      throw new Error("Failed to add people to shared folder");
    }
  },
  goBack: async () => {
    const { pathHistory } = get();
    if (pathHistory.length <= 1) return; // Check root

    const newHistory = [...pathHistory];
    newHistory.pop(); // remove current
    const previousPath = newHistory[newHistory.length - 1];

    await get().listFolder(previousPath);
    set({ pathHistory: newHistory });
  },
}));
