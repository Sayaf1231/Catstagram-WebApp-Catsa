import React, { useEffect, useState } from "react";
import { Imgdb, Namedb } from "../components/firebase_setup";
import { v4 } from "uuid";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { getDownloadURL, uploadBytes, ref } from "firebase/storage";

function Feed() {
  console.log("This is the feed");
  const navigate = useNavigate();

  const [pdata, setPData] = useState([]);  // state to hold profile data

  const [postimg, setPostImg] = useState("");   // To get the pic, posted
  const [postData, setPostData] = useState([]); // state to hold post Data
  const [posttxt, setPostTxt] = useState("");   // to get a normal text post

  const [loading, setLoading] = useState(false); // To track loading status
  const [imgUploadComplete, setImgUploadComplete] = useState(false); // Track image upload status

  // Handles uploading the Post Image
  //this is mostly a copy of the same I have in Home.js file
  const handlePostImgUpload = (e) => {
    const file = e.target.files[0];
    setLoading(true);
    const postImgRef = ref(Imgdb, `PostImgFile/${v4()}`); //unique path for the firebase storage

    uploadBytes(postImgRef, file)
      .then(snapshot => getDownloadURL(snapshot.ref))     //getting the uploaded post
      .then(url => {
        setPostImg(url);                                  //set PostImg 
        setImgUploadComplete(true);                       //set the upload status
        setLoading(false);                                //Done loadin
        console.log("Post Image uploaded at:", url);
      })
      .catch(error => {
        console.error("Error uploading post image:", error);
        setLoading(false);          // Stop loading in case of error
      });
  };

  // Handles uploading the post (text or image)
  const handlePostInput = async () => {
    if (imgUploadComplete || posttxt.trim() !== "") { // Check if there's a post text or image
      try {
        const email = localStorage.getItem("email");
        const docRef = collection(Namedb, "PostData");      //get the data from PostData dateset
        await addDoc(docRef, {
          posttxtval: posttxt || null, // Post text or empty
          postimgVal: postimg || null, // Post image or empty
          u_email: email, // user (eventually want this to be so that the Profile name is this)
          timestamp: new Date() // timestamp to sort according to timestamp
        });
        console.log("Post Document successfully written!");
        fetchPosts(); // Fetch posts after adding a new one
        setPostTxt(""); // Clear the txt
        setPostImg(""); // clear the img
        setImgUploadComplete(false); // reset img upload status
      } catch (error) {
        console.log("Error Writing Post Document: ", error);
      }
    } else {
      console.log("Please wait for image to get uploaded or enter text.");
    }
  };

  // Fetch posts data from the "PostData" collection
  const fetchPosts = async () => {
    const postRef = collection(Namedb, "PostData"); //get the postData collection
    const postSnapshot = await getDocs(postRef);    //get get the docs
    const postList = postSnapshot.docs.map(doc => ({   //Map it and set an unique Id
      id: doc.id,
      ...doc.data()
    }));
    setPostData(postList);
    return postList;
  };

  // Fetch profile data
  const getProfileData = async () => {   
    const profileRef = collection(Namedb, "ProfileData");  //get the profileData Collection
    const profileSnapshot = await getDocs(profileRef);     //get the docs
    const profileList = profileSnapshot.docs.map(doc => ({   //map it with a unique id
      id: doc.id,
      ...doc.data()
    }));
    setPData(profileList);
    return profileList;
  };

  // Fetch profile and post data when the component mounts
  useEffect(() => {
    getProfileData();
    fetchPosts(); // Fetch all posts
  }, []);

  console.log(postData, "postData");

  // Handle log out
  const handleLogout = () => {
    localStorage.clear();
    navigate("/SignIn");
  };

  return (
    <div className="Feed">
      <h1 className="Feed_header"> Catsa Feed </h1>

      <div className="Post_info">
        <textarea
          className="Post_txt"
          placeholder="What's on your mind today!"
          onChange={(e) => setPostTxt(e.target.value)}
          value={posttxt}
        /><br />

        <input
          className="Post_Img"
          type="file"
          onChange={handlePostImgUpload}
          disabled={loading}
        /><br />

        <button
          className="PostAdd"
          onClick={handlePostInput}
          disabled={loading || (!imgUploadComplete && posttxt.trim() === "")}>
          {loading ? "Uploading..." : "Post"}
        </button>
      </div>

      <div className="Posts_display">
        <h2>Recent Posts</h2>
        {postData.map(post => (
          <div key={post.id} className="Post">
            {post.posttxtval && <p>{post.posttxtval}</p>}
            {post.postimgVal && <img src={post.postimgVal} alt="Post" />}
            <p>Posted by: {post.u_email}</p>
          </div>
        ))}
      </div>

      <div className="Profile_info">
        <h2>Profile Information</h2>
        {pdata.map(profile => (
          <div key={profile.id}>
            <p>Profile Name: {profile.txtval}</p>
            <img src={profile.imgUrl} alt="Profile" />
          </div>
        ))}
      </div>

      <button
        className="Logoutbut"
        onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Feed;
