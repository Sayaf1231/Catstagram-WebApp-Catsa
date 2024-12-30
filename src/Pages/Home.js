import React, { useState } from "react";
import { Imgdb, Namedb } from "../components/firebase_setup";
import { v4 } from "uuid";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { addDoc, collection } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

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
        const docRef = collection(Namedb, "ProfileData");
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
    localStorage.clear();
    navigate("/SignIn");
  };

  return (
    <div>
      <h1>This is a placeholder Homepage for Catsa!!!!</h1>
      <section className="upload">

        <input 
          className="ProfileName" 
          placeholder="Enter Name" 
          onChange={(e) => setTxt(e.target.value)}   //js sets setTxt to the entered text
          value={Txt}
        />
        <br/><br/>
        
        <input 
          className="ProfilePic" 
          type="file" 
          onChange={handleimgUpload} 
          disabled={loading}                        // Disable file input when loading
        />
        <br/><br/>
        
        <button 
          className="profileAdd" 
          onClick={handleinput}
          disabled={!imgUploadComplete || Txt.trim() === "" || loading}      // Disable until ready
        >
          {loading ? "Uploading..." : "Done!"} {/* Show loading state */}
        </button>
        <br/>
      </section>
      
      <button 
        className="Logoutbut" 
        onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Home;
