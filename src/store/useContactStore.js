import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

export const useContactStore = create(
  persist((set, get) => ({
    contactId: null,
    contactDetails: null,
    error: null,
    setContactIdFromUrl: () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("contactId");
      set({ contactId: id });
    },
    fetchContactDetails: async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/contact/${get().contactId}`,
          {
            withCredentials: true,
          }
        );

        set({ contactDetails: response.data.data });
      } catch (error) {
        console.error(
          "Failed to fetch contact:",
          error.response?.data || error.message
        );
        set({ error: error.response?.data || error.message });
      }
    },
  }))
);
