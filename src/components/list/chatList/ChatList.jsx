import { useState } from "react";
import "./chatList.css";
import AddUser from "./addUser/AddUser";
import { useUserStore } from "../../../lib/userStore";
import { useEffect } from "react";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";

const ChatList = () => {
  const [addMode, setAddMode] = useState(false);
  const [chats, setChats] = useState([]);
  const [inputSearch, setInputSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();

  useEffect(() => {
    if (!currentUser?.id) return;

    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        if (!res.exists()) {
          setChats([]);
          setLoading(false);
          return;
        }

        const items = res.data().chats || [];

        if (items.length === 0) {
          setChats([]);
          setLoading(false);
          return;
        }

        try {
          const promises = items.map(async (item) => {
            // Fix the typo from reciverId to receiverId
            const receiverId = item.receiverId || item.reciverId;
            const userDocRef = doc(db, "users", receiverId);
            const userDocSnap = await getDoc(userDocRef);
            
            if (userDocSnap.exists()) {
              const user = userDocSnap.data();
              return { ...item, user };
            }
            return null;
          });

          const chatData = await Promise.all(promises);
          const validChats = chatData.filter(chat => chat !== null);
          setChats(validChats.sort((a, b) => b.updatedAt - a.updatedAt));
        } catch (error) {
          console.log("Error loading chats:", error);
          setChats([]);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => {
      unSub();
    };
  }, [currentUser?.id]);

  const handleSelect = async (chat) => {
    if (!chat || !chat.chatId) return;

    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );

    if (chatIndex === -1) return;

    userChats[chatIndex].isSeen = true;

    const userChatRef = doc(db, "userchats", currentUser.id);

    try {
      await updateDoc(userChatRef, {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user);
    } catch (error) {
      console.log("Select chat error:", error);
    }
  };

  const filteredChats = chats.filter((c) =>
    c?.user?.username?.toLowerCase().includes(inputSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="chatList scrollbar-hide">
        <div className="search">
          <div className="searchBar">
            <img src="./search.png" alt="search-image" />
            <input
              type="text"
              placeholder="Loading chats..."
              disabled
            />
          </div>
          <img src="./plus.png" alt="plus-icon" className="add" style={{ opacity: 0.5 }} />
        </div>
        <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
          Loading your chats...
        </div>
      </div>
    );
  }

  return (
    <div className="chatList scrollbar-hide">
      {/* Search */}
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="search-image" />
          <input
            type="text"
            placeholder="Search chats..."
            value={inputSearch}
            onChange={(e) => setInputSearch(e.target.value)}
          />
        </div>
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          alt="add-user-icon"
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
          title={addMode ? "Close" : "Add new chat"}
        />
      </div>

      {/* Chat List */}
      {chats.length === 0 && !addMode ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          <img src="./chat.png" alt="no-chats" style={{ opacity: 0.5, marginBottom: "10px" }} />
          <p>No chats yet</p>
          <p style={{ fontSize: "12px" }}>Click the + button to start a conversation</p>
        </div>
      ) : filteredChats.length > 0 ? (
        filteredChats.map((chat) => (
          <div
            key={chat.chatId}
            className={`item ${chatId === chat.chatId ? 'active' : ''}`}
            onClick={() => handleSelect(chat)}
            style={{
              backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",
            }}
          >
            <img
              src={
                chat.user?.blocked?.includes(currentUser.id)
                  ? "./avatar.png"
                  : chat.user?.avatar || "./avatar.png"
              }
              alt="user-avatar"
            />
            <div className="texts">
              <span>
                {chat.user?.blocked?.includes(currentUser.id)
                  ? "User"
                  : chat.user?.username || "Unknown User"}
              </span>
              <p>{chat.lastMessage || "No messages yet"}</p>
            </div>
          </div>
        ))
      ) : (
        <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
          <p>No chats match "{inputSearch}"</p>
        </div>
      )}

      {addMode && <AddUser setAddMode={setAddMode} />}
    </div>
  );
};

export default ChatList;