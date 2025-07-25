import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

export const useContactStore = create(
  persist((set, get) => ({
    contactId: null,
    contactDetails: null,
    isFetching: false,
    error: null,
    setContactIdFromUrl: () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("contactId");
      if (id) {
        set({ contactId: id });
        return id;
      } else {
        console.warn("No contactId found in URL");
        return null;
      }
    },
    fetchContactDetails: async () => {
      try {
        set({ isFetching: true });
        const response = await axios.get(
          `http://localhost:3000/contact/${get().contactId}`,
          {
            withCredentials: true,
          }
        );

        set({ contactDetails: response.data.data, isFetching: false });
      } catch (error) {
        console.error(
          "Failed to fetch contact:",
          error.response?.data || error.message
        );
        set({
          error: error.response?.data || error.message,
          isFetching: false,
        });
      }
    },
  }))
);
