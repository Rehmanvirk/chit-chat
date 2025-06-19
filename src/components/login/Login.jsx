import React from "react";
import "./login.css";
import { useState } from "react";
import { toast } from "react-hot-toast";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useUserStore } from "../../lib/userStore";

const Login = () => {
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isLoading: storeLoading } = useUserStore();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: [],
      });

      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar: "",
        id: res.user.uid,
        blocked: [],
      });

      toast.success("Account created! You can login now!");
      setShowRegister(false);
    } catch (error) {
      console.error("Register error:", error.code, error.message); // Debug log
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.target);
      const { email, password } = Object.fromEntries(formData);
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Login successful"); // Debug log
    } catch (error) {
      let errorMessage;
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No user found with this email.";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address.";
          break;
        case "auth/invalid-credential":
          errorMessage = "Email or Password not matched";
          break;
        default:
          errorMessage = "An error occurred. Please try again.";
      }
      console.error("Login error:", error.code, error.message); // Debug log
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      {!showRegister && (
        <div className="item">
          <h2>Welcome back,</h2>
          <form onSubmit={handleLogin}>
            <input type="text" placeholder="Email" name="email" disabled={loading || storeLoading} />
            <input type="password" placeholder="Password" name="password" disabled={loading || storeLoading} />
            <button disabled={loading || storeLoading}>
              {loading || storeLoading ? "Loading" : "Sign In"}
            </button>
          </form>
          <p>
            Doesnt have an Account?{" "}
            <span onClick={() => setShowRegister(true)}>Register</span>
          </p>
        </div>
      )}
      {showRegister && (
        <div className="item">
          <h2>Create an Account</h2>
          <form onSubmit={handleRegister}>
            <div className="avatar-placeholder">
              <img src="./avatar.png" alt="Default Avatar" />
              <span>Default Avatar</span>
            </div>
            <input type="text" placeholder="Username" name="username" disabled={loading || storeLoading} />
            <input type="text" placeholder="Email" name="email" disabled={loading || storeLoading} />
            <input type="password" placeholder="Password" name="password" disabled={loading || storeLoading} />
            <button disabled={loading || storeLoading}>
              {loading || storeLoading ? "Loading" : "Sign Up"}
            </button>
          </form>
          <p>
            Already have an Account?{" "}
            <span onClick={() => setShowRegister(false)}>Login</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default Login;