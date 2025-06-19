import List from "./components/list/List";
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";
import { RotatingLines } from "react-loader-spinner";

function App() {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();
  const [initializing, setInitializing] = useState(true); // New state for auth initialization

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed, UID:", user ? user.uid : null); // Debug log
      fetchUserInfo(user?.uid).finally(() => {
        console.log("Auth initialization complete"); // Debug log
        setInitializing(false); // Mark initialization complete
      });
    });

    return () => {
      console.log("Unsubscribing auth listener"); // Debug log
      unSub();
    };
  }, [fetchUserInfo]);

  console.log("App render - currentUser:", currentUser, "isLoading:", isLoading, "initializing:", initializing); // Debug log

  if (initializing || isLoading) {
    return (
      <div className="loading">
        Loading...
        <RotatingLines
          visible={true}
          height="96"
          width="96"
          color="grey"
          strokeWidth="5"
          animationDuration="0.75"
          ariaLabel="rotating-lines-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
      </div>
    );
  }

  return (
    <div className="container">
      {currentUser ? (
        <>
          <List />
          {chatId && <Chat />}
          {chatId && <Detail />}
        </>
      ) : (
        <Login />
      )}
      <Notification />
    </div>
  );
}

export default App;