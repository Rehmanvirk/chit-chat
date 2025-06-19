import React, { useRef, useEffect, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";

const Chat = () => {
  const [chat, setChat] = useState({});
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const endRef = useRef(null);
  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
  };

  const handleSend = async () => {
    if (text.trim() === "") return;

    try {
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text: text.trim(),
          createdAt: new Date(),
        }),
      });

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        const userChatRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();

          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );
          
          if (chatIndex !== -1) {
            userChatsData.chats[chatIndex].lastMessage = text.trim();
            userChatsData.chats[chatIndex].isSeen =
              id === currentUser.id ? true : false;
            userChatsData.chats[chatIndex].updatedAt = Date.now();

            await updateDoc(userChatRef, {
              chats: userChatsData.chats,
            });
          }
        }
      });
    } catch (error) {
      console.log("Chat Send Error", error);
    }
    
    setText("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="user-image" />
          <div className="texts">
            <span>{user?.username}</span>
            <p>Online</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="phone" />
          <img src="video.png" alt="video" />
          <img src="./info.png" alt="info" />
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((message, index) => (
          <div
            key={`${message?.createdAt}-${index}`}
            className={
              message.senderId === currentUser?.id ? "message own" : "message"
            }
          >
            <div className="texts">
              {/* Legacy image support - display existing images if they exist */}
              {message.img && <img src={message.img} alt="chat-image" />}
              <p>{message.text}</p>
              {/* Uncomment if you want to show timestamps */}
              {/* <span>{new Date(message.createdAt?.toDate()).toLocaleTimeString()}</span> */}
            </div>
          </div>
        ))}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          {/* Removed image upload functionality */}
          <div className="icon-placeholder" title="Image sharing unavailable">
            <img src="./img.png" alt="img-icon" style={{ opacity: 0.5 }} />
          </div>
          <div className="icon-placeholder" title="Camera unavailable">
            <img src="./camera.png" alt="camera" style={{ opacity: 0.5 }} />
          </div>
          <div className="icon-placeholder" title="Voice message unavailable">
            <img src="./mic.png" alt="mic" style={{ opacity: 0.5 }} />
          </div>
        </div>
        <input
          type="text"
          placeholder={
            isCurrentUserBlocked || isReceiverBlocked
              ? "You can not send a message"
              : "Type a message..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        <div className="emoji">
          <img
            src="./emoji.png"
            alt="emoji"
            onClick={() => setOpen((prev) => !prev)}
          />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button
          disabled={isCurrentUserBlocked || isReceiverBlocked || text.trim() === ""}
          className="sendButton"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;