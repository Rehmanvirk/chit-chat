import { auth } from "../../../lib/firebase";
import { useUserStore } from "../../../lib/userStore";
import "./userInfo.css";

const UserInfo = () => {
  const { currentUser } = useUserStore();

  // Handle avatar fallback more explicitly
  const getAvatarSrc = () => {
    // If user has an avatar URL (from external source or base64), use it
    if (currentUser.avatar) {
      return currentUser.avatar;
    }
    // Otherwise, use local fallback image
    return "./avatar.png";
  };

  return (
    <div className="userInfo">
      <div className="user">
        <img
          src={getAvatarSrc()}
          alt="user-image"
          onError={(e) => {
            // If avatar fails to load, fallback to local image
            e.target.src = "./avatar.png";
          }}
        />
        <div>
          <h2>{currentUser.username}</h2>
          <button className="logout" onClick={() => auth.signOut()}>
            Logout
          </button>
        </div>
      </div>
      <div className="icons">
        <img src="./more.png" alt="more" />
        <img src="./video.png" alt="video" />
        <img src="./edit.png" alt="edit" />
      </div>
    </div>
  );
};

export default UserInfo;