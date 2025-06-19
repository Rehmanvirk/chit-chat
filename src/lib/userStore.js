import { create } from "zustand";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,
  
  fetchUserInfo: async (uid) => {
    console.log("fetchUserInfo called with UID:", uid); // Debug log
    if (!uid) {
      console.log("No UID, setting currentUser to null"); // Debug log
      return set({ currentUser: null, isLoading: false });
    }

    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      console.log("Firestore doc exists:", docSnap.exists(), "Data:", docSnap.data()); // Debug log

      if (docSnap.exists()) {
        set({ currentUser: docSnap.data(), isLoading: false });
      } else {
        console.log("No user document found in Firestore"); // Debug log
        set({ currentUser: null, isLoading: false });
      }
    } catch (error) {
      console.error("fetchUserInfo error:", error.message); // Debug log
      set({ currentUser: null, isLoading: false });
    }
  },
}));