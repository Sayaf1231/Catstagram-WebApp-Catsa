import React, { useState } from "react";
import { Imgdb, Namedb } from "../components/firebase_setup";
import { v4 } from "uuid";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { addDoc, collection } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../styling/Home.css"


function Home() {
  const [Txt, setTxt] = useState("");   // For text input
  const [img, setimg] = useState("");   // For image URL
  const [imgUploadComplete, setImgUploadComplete] = useState(false); // Track image upload status
  const [loading, setLoading] = useState(false); // To track loading status
  const navigate = useNavigate();

  // Image upload handler
  const handleimgUpload = (e) => {
    const file = e.target.files[0];  //get the first file
    setLoading(true); // Start loading
    const imgRef = ref(Imgdb, `ImgsFile/${v4()}`); // Unique path in Firebase Storage (named by me) using uuid

    uploadBytes(imgRef, file)
      .then(snapshot => getDownloadURL(snapshot.ref))   //this whole thing is a promise chain, it uploads the img to the storage 
      .then(url => {                   //and then gets the downloadable link for the img
        setimg(url);                   // Set the image URL
        setImgUploadComplete(true);    // Set upload status to complete
        setLoading(false);             // Stop loading
        console.log("Image uploaded and available at:", url);   //this is to js like debug
      })
      .catch(error => {             //if it doesnt rather than crashing it js gives a error
        console.error("Error uploading image:", error);
        setLoading(false);          // Stop loading in case of error
      });
  };

  // Profile data submission handler
  //only should proceed once a img and text is added
  const handleinput = async () => {
    if (imgUploadComplete && Txt.trim() !== "") {  // Check if image is uploaded and name is provided 
      try {                                        //the Txt.trim js kinda makes sure if there is a text after getting rid of whitespace
        const email = localStorage.getItem("email");
        const docRef = collection(Namedb, "ProfileData"); //the user profile name, profile pic and the email is stored in firebase database
        await addDoc(docRef, {
          txtval: Txt,      // Save text input
          imgUrl: img,      // Save image URL from Firebase Storage
          u_email: email    // The user gmail
        });
        console.log("Document successfully written!");
        navigate("/feed"); // Move to the feed page right after upload is done
      } catch (error) {
        console.error("Error writing document: ", error);
      }
    } else {
      console.log("Please wait for image upload to complete and enter a name.");
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.clear();   //clear user local storage info and go back to Signin
    navigate("/SignIn");
  };

  return (
    <div className="home-container">
            {/*logo*/}
            <img src={require("../styling/Logo.png")} alt="Logo" className="logo" />

            {/* Form box */}
            <div className="form">
                <h1 className="title">
                    Welcome to Catsa
                </h1>

                {/* Name Input */}
                <input
                    className="ProfileName"
                    placeholder="Enter Name"
                    onChange={(e) => setTxt(e.target.value)}
                    value={Txt}
                />

                {/* File Upload */}
                <label className="custum-file-upload">
                    <div className="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M12 2L16.5 6.5L15.08 7.92L13 5.83V13H11V5.83L8.92 7.92L7.5 6.5L12 2M5 18V21H19V18H5Z" />
                        </svg>
                    </div>
                    <div className="text">
                        <span>{loading ? "Uploading..." : "Upload profile Photo"}</span>
                    </div>
                    <input type="file" onChange={handleimgUpload} disabled={loading} />
                </label>

                {/* Upload Complete Message */}
                {imgUploadComplete && <p className="upload-complete">Upload Complete!</p>}

                {/* Upload Button */}
                <button
                    className="profileAdd"
                    onClick={handleinput}
                    disabled={!imgUploadComplete || Txt.trim() === "" || loading}
                >
                    {loading ? "Uploading..." : "Done!"}
                </button>

                {/* Logout Button */}
                <button className="LogoutbutHome" onClick={handleLogout}>
                    Back
                </button>
            </div>
        </div>
  );
}

export default Home;
