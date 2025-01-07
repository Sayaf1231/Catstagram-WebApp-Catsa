import React, { useEffect, useState } from "react";
import { Imgdb, Namedb } from "../components/firebase_setup";
import { v4 } from "uuid";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { getDownloadURL, uploadBytes, ref } from "firebase/storage";
import "../styling/Feed.css"

function Feed() {
  console.log("This is the feed");
  const navigate = useNavigate();

  const [pdata, setPData] = useState([]);  // state to hold profile data

  const [postimg, setPostImg] = useState("");   // To get the pic, posted
  const [postData, setPostData] = useState([]); // state to hold post Data
  const [posttxt, setPostTxt] = useState("");   // to get a normal text post

  const [loading, setLoading] = useState(false); // To track loading status
  const [imgUploadComplete, setImgUploadComplete] = useState(false); // Track image upload status

  const [likeobject,setLikeobject] = useState({}); //To track likes (keep post id with 0 or 1)


  //Handles uploading the Post Image
  //this is mostly a copy of the same I have in Home.js file
  const handlePostImgUpload = (e) => {
    const file = e.target.files[0];
    setLoading(true);
    const postImgRef = ref(Imgdb, `PostImgFile/${v4()}`); // unique path in Firebase Storage using v4()

    uploadBytes(postImgRef, file) //uploads the file to firebase storage
      .then(snapshot => getDownloadURL(snapshot.ref))     //getting the uploaded post/ metadata about the uploaded file
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
          timestamp: new Date(), // timestamp to sort according to timestamp
          likes: 0   //number of likes
        });
        console.log("Post Document successfully written!");
        setPostTxt(""); // Clear the txt
        setPostImg(""); // clear the img
        setImgUploadComplete(false); // reset img upload status
        await fetchPosts(); // Fetch posts after adding a new one
      } catch (error) {
        console.log("Error Writing Post Document: ", error);
      }
    } else {
      console.log("Please wait for image to get uploaded or enter text.");
    }
  };

  // Fetch posts data from the "PostData" collection
  const fetchPosts = async () => {
    try {
      const postRef = collection(Namedb, "PostData");
      const postSnapshot = await getDocs(postRef);
      if (!postSnapshot.empty) {
        const postList = postSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPostData(postList);

        // Initialize like states for new posts
        const initialLikes = {};
        postList.forEach((post) => {
          if (!likeobject[post.id]) initialLikes[post.id] = "<3";
        });
        setLikeobject({ ...likeobject, ...initialLikes });
      } else {
        console.log("No posts found in the PostData collection.");
        setPostData([]);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };


  // Fetch profile data
  const getProfileData = async () => {   
    const profileRef = collection(Namedb, "ProfileData");  //get the profileData Collection
    const profileSnapshot = await getDocs(profileRef);     //get the docs
    const profileList = profileSnapshot.docs.map(doc => ({   //map it with a unique id
      id: doc.id,
      ...doc.data()
    }));
    setPData(profileList);   //gets the profile data object
    return profileList;
  };


  console.log(postData, "postData");

  // get the past like data; after hat only alter the post that has been liked
  const handleLike = (postId) => {
    setLikeobject((prevStates) => ({
      ...prevStates,
      [postId]: prevStates[postId] === "<3" ? "</3" : "<3",
    }));
  };
  
  // Handle log out
  const handleLogout = () => {
    localStorage.clear();
    navigate("/SignIn");
  };


  // Fetch profile and post data when the component mounts
  useEffect(() => {
    getProfileData();
    fetchPosts(); // Fetch all posts
  }, []);

//bit more difficult here so need a proper apporoach

/* 1st need to understand that post photo are separately and they all
should be similar size regardless of input size
they all need to have  below  */
  return (
    <div className="Feed">
      <h1 className="Feed_header"> Catsa Feed </h1>

      {/* This is to have the text post box*/}
      <div className="Post_info">
        {/* text box */}
        <textarea
          className="Post_txt"
          placeholder="What's on your mind today!"
          onChange={(e) => setPostTxt(e.target.value)}
          value={posttxt}
        /><br />

        {/* img upload box */}
        <input
          className="Post_Img"
          type="file"
          onChange={handlePostImgUpload}
          disabled={loading}
        /><br />

        {/* when done and then time to GOOOOOO */}
        <button
          className="PostAdd"
          onClick={handlePostInput}
          disabled={loading || (!imgUploadComplete && posttxt.trim() === "")}>
          {loading ? "Uploading..." : "Post!"}
        </button>
      </div>

      {/* showing the users/display for page */}
      <div className="Posts_display">
        <img src={require("../styling/Logo.png")} alt="Logo" className="logo" />
        <h2>Recent Posts</h2>
        {postData.map(post => (
          <div key={post.id} className="Post">
            {post.posttxtval && <p>{post.posttxtval}</p>}
            {post.postimgVal && <img src={post.postimgVal} alt="Post" />}     
            {/* potentianl security risk */}       
            <p>Posted by: {post.u_email}</p>  
            
            {/* like button under every post */}
            <button
              className="like-button"
              onClick={() => handleLike(post.id)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 36 36"
                width="36px"
                height="36px"
              >
            </svg>
            {/* <img
                src={likeobject[post.id] === 1 ? require("../styling/Like.png") : require("../styling/noLike.png")}
                alt={likeobject[post.id] === 1 ? "Liked" : "Like"}
            /> */}
            <span className="<3">
              {likeobject[post.id] === "<3"  ? "<3" : ""}
            </span>
            <span className="</3">
              {likeobject[post.id] === "</3"  ? "</3" : ""}
            </span>
              </button>
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
        className="Logoutbutfeed"
        onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Feed;
