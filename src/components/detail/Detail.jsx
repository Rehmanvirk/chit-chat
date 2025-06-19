import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useChatStore } from "../../lib/chatStore";
import { auth, db } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";
import "./detail.css";

const Detail = () => {
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } =
    useChatStore();
  const { currentUser } = useUserStore();
  
  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id);
    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (error) {
      console.log("User Block Error", error);
    }
  };

  return (
    <div className="detail">
      <div className="user">
        <img src={user?.avatar || "./avatar.png"} alt="user-img" />
        <h2>{user?.username}</h2>
        <p>Active chat participant</p>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="./arrowUp.png" alt="arrow-img" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Privacy & help</span>
            <img src="./arrowUp.png" alt="arrow-img" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Media</span>
            <img src="./arrowDown.png" alt="arrow-img" />
          </div>
          <div className="media-disabled">
            <div className="disabled-message">
              <img src="./img.png" alt="media-icon" style={{ opacity: 0.5 }} />
              <span>Media sharing is currently unavailable</span>
              <p>File and photo sharing features are disabled</p>
            </div>
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="./arrowUp.png" alt="arrow-img" />
          </div>
          <div className="files-disabled">
            <div className="disabled-message">
              <img src="./attachment.png" alt="file-icon" style={{ opacity: 0.5 }} />
              <span>File sharing is currently unavailable</span>
            </div>
          </div>
        </div>
        <div className="buttons">
          <button onClick={handleBlock}>
            {isCurrentUserBlocked
              ? "You are Blocked"
              : isReceiverBlocked
              ? "User Blocked"
              : "Block User"}
          </button>
          <button className="logout" onClick={() => auth.signOut()}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Detail;