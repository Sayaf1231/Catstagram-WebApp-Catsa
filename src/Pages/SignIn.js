import React, { useEffect, useState } from "react";
import { auth, Namedb, provider } from "../components/firebase_setup";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import "../styling/SignIn.css";

function SignIn() {
  const [isLoading, setisLoading] = useState(false);
  const navigate = useNavigate();

  // Sign in with Google and check if profile exists
  const handleSignIn = async () => {
    setisLoading(true);
    try { //try and catch for error handling
      const result = await signInWithPopup(auth, provider);
      const u_email = result.user.email;
      localStorage.setItem("email", u_email);

      //Check if the user already has a profile in Firestore
      //getting the profile info from the firebase, checking if the email already exist
      const Pcol = collection(Namedb, "ProfileData");
      const profileQuery = query(Pcol, where("u_email", "==", u_email));
      const Pdata = await getDocs(profileQuery);

      if (!Pdata.empty) {
        // Profile exists, navigate to Feed
        navigate("/feed");
      } else {
        // No profile, navigate to Home for profile setup
        navigate("/Home");
      }
    } catch (error) {
      console.error("Sign-in failed", error);
      setisLoading(false);
    }
  };

  // Check localStorage for the existing email and verify profile on page load

  useEffect(() => {
    const email = localStorage.getItem("email");
    const checkIfProfileExists = async (email) => {
      try {
        const Pcol = collection(Namedb, "ProfileData");
        const profileQuery = query(Pcol, where("u_email", "==", email));
        const Pdata = await getDocs(profileQuery);
  
        if (!Pdata.empty) {
          navigate("/feed"); // Redirect to Feed if profile exists
        } else {
          navigate("/Home"); // If no profile, send to Home to create one
        }
      } catch (error) {
        console.error("Failed to check profile", error);
        localStorage.removeItem("email");
      }
    };

    if (email) {
      checkIfProfileExists(email);
    }
  }, [navigate]);  //having the [] mean its only does it once


  return (
    <div className="form">
      <img src={require("../styling/Logo.png")} alt="Logo" className="logo" />
      <h1 className="title">Welcome to Catsa</h1>

    <img src={require("../styling/login.png")}alt="Icon" className="icon" />
            
      <button 
      className="login-button" 
      onClick={handleSignIn}
      disabled={isLoading}
      >
         {isLoading ? "Continue" : "Sign In With Google"}
      </button>
    </div>
  );
}

export default SignIn;
