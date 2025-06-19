import React from "react";
import "./addUser.css";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { useState } from "react";
import { useUserStore } from "../../../../lib/userStore";

const AddUser = ({ setAddMode }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const { currentUser } = useUserStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    if (!username?.trim()) return;

    setLoading(true);
    setSearchPerformed(true);
    
    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username.trim()));
      const querySnapShot = await getDocs(q);

      if (!querySnapShot.empty) {
        const foundUser = querySnapShot.docs[0].data();
        // Don't allow adding yourself
        if (foundUser.id === currentUser.id) {
          setUser(null);
        } else {
          setUser(foundUser);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.log("Search Error", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!user) return;

    setLoading(true);
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");
    
    try {
      const newChatRef = doc(chatRef);
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(userChatsRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });

      await updateDoc(doc(userChatsRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now(),
        }),
      });

      setAddMode(false);
    } catch (error) {
      console.log("Add User Error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input 
          type="text" 
          placeholder="Username" 
          name="username" 
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>
      
      {searchPerformed && !loading && !user && (
        <div className="no-user">
          <p>No user found or you cannot add yourself</p>
        </div>
      )}
      
      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || "./avatar.png"} alt="avatar" />
            <span>{user.username}</span>
          </div>
          <button onClick={handleAdd} disabled={loading}>
            {loading ? "Adding..." : "Add User"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AddUser;