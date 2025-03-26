// App.jsx

import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { auth, requestPermissionAndGetToken } from "./components/firebase"; // Make sure to import the correct function

import Login from "./components/login";
import SignUp from "./components/register";
import Profile from "./components/profile";
import MyProfile from "./components/MyProfile"; // Import MyProfile component
import LCD from "./components/lcd"; // Import LCD component
import MyBill from "./components/MyBill"; // Import MyBill component (make sure to create this component)

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [user, setUser] = useState(null); // Set initial value of user to null

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setUser(authUser); // Set user when authentication state changes
    });

    return () => {
      unsubscribe(); // Clean up listener on component unmount
    };
  }, []); // Empty dependency array ensures this effect runs only once

  // Call the requestPermissionAndGetToken function (you can trigger this based on user action, e.g., on button click)
  useEffect(() => {
    if (user) {
      requestPermissionAndGetToken().then((token) => {
        if (token) {
          console.log("User's FCM Token:", token);
          // You can send this token to your backend server here
        }
      });
    }
  }, [user]); // Run whenever the `user` state changes

  return (
    <Router>
      <div className="App">
        <div className="auth-wrapper">
          <div className="auth-inner">
            <Routes>
              {/* Redirect user to Profile if logged in, otherwise show Login */}
              <Route
                path="/"
                element={user ? <Navigate to="/profile" /> : <Login />}
              />

              {/* Authentication routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<SignUp />} />

              {/* Protected routes (Require authentication) */}
              <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
              <Route path="/my-profile" element={user ? <MyProfile /> : <Navigate to="/login" />} />
              <Route path="/lcd" element={user ? <LCD /> : <Navigate to="/login" />} />
              
              {/* New route for MyBill page */}
              <Route path="/my-bill" element={user ? <MyBill /> : <Navigate to="/login" />} />
            </Routes>
            <ToastContainer />
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
