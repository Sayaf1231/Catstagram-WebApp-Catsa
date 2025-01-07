import React, { useEffect, useState } from "react";
import { Imgdb, Namedb } from "../components/firebase_setup";
import { v4 } from "uuid";
import { addDoc, collection, getDocs, query, where, deleteDoc, doc} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { getDownloadURL, uploadBytes, ref } from "firebase/storage";
import "../styling/Feed.css"

function Feed() {
  const navigate = useNavigate();
  const [pdata, setPData] = useState([]);               //the profile data
  const [postimg, setPostImg] = useState("");           //The Post img url Info 
  const [postData, setPostData] = useState([]);         //The Post Object info
  const [posttxt, setPostTxt] = useState("");           //The Post Text Info
  const [loading, setLoading] = useState(false);        //Loading info; so it doenst crash and data flow isnt damaged
  const [imgUploadComplete, setImgUploadComplete] = useState(false);    //img upload status
  const [likeobject, setLikeobject] = useState({});     //Like status info object 

  // Post image upload func
  const handlePostImgUpload = (e) => {
    const file = e.target.files[0];                       //get the 1st doc
    setLoading(true);
    const postImgRef = ref(Imgdb, `PostImgFile/${v4()}`);     //ref wher ethe data will be stored in (v4 generates a unique id)

    uploadBytes(postImgRef, file)                             //upload the image
      .then(snapshot => getDownloadURL(snapshot.ref))         //get the downloadable url for the image
      .then(url => {
        setPostImg(url);
        setImgUploadComplete(true);
        setLoading(false);
        console.log("Post Image uploaded at:", url);
      })
      .catch(error => {
        console.error("Error uploading post image:", error);
        setLoading(false);
      });
  };

  // Handle post creation
  const handlePostInput = async () => { //trim white space from text post
    if (imgUploadComplete || posttxt.trim() !== "") {     //if upload complete
      try {
        const email = localStorage.getItem("email");      //get the cur users email
        const docRef = collection(Namedb, "PostData");    //Get the PostData from firebase storage
        await addDoc(docRef, {                            //initialize/add the post object to the database
          posttxtval: posttxt || null,
          postimgVal: postimg || null,
          u_email: email,
          timestamp: new Date(),
          likes: 0
        });
        setPostTxt("");                                  //reset txt and img 
        setPostImg("");
        setImgUploadComplete(false);
        await fetchPosts();                              //get all the post
      } catch (error) {
        console.log("Error Writing Post Document: ", error);
      }
    }
  };

  // Fetch posts
  const fetchPosts = async () => {
    try {
      const postRef = collection(Namedb, "PostData");           //the PostData collection from the firebase database
      const postSnapshot = await getDocs(postRef);              //get the docs 
      if (!postSnapshot.empty) {                                //if it is empty make a new object for the post
        const postList = postSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPostData(postList);
      } else {
        setPostData([]);                                       //else it is empty
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  // Fetch profile data
  const fetchProfileData = async () => {
    try {
      const profileRef = collection(Namedb, "ProfileData");     //get the data from the ProfileData database
      const profileSnapshot = await getDocs(profileRef);        //get the docs
      const profileList = profileSnapshot.docs.map(doc => ({    //make the data objects
        id: doc.id,
        ...doc.data()
      }));
      setPData(profileList);                                    //set it
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  //fetch like for cur user
  const fetchUserLikes = async (userEmail) => {
    try {
      const likesCollectionRef = collection(Namedb, "Likes");                     //The Like Database collection from firestore database
      const q = query(likesCollectionRef, where("userEmail", "==", userEmail));   //get the specific user Like count
      const querydocs = await getDocs(q);                                         //get the doc
      const userLikes = {};                                                       //user like object initialized
      querydocs.forEach((doc) => {                                                //iterates the doc and makes a mapping
        userLikes[doc.data().postId] = true;                                      //mapping --> is username there then its true
      });
      setLikeobject(userLikes);                                                   //set it to userLikes state
    } catch (error) {
      console.error("Error fetching user likes:", error);
    }
  };

  // handling Like
  const handleLike = async (postId) => {
    const userEmail = localStorage.getItem("email");                  //get the cur user email
    
    try {
      //get the collection info and then do the check
      const likesCollectionRef = collection(Namedb, "Likes");        //get the likes collection
      const q = query(
        likesCollectionRef,                                          //from the likes collection get the user mail collection
        where("userEmail", "==", userEmail),
        where("postId", "==", postId)
      );

      //The result (querydocs) is an object representing the retrieved documents (if any) that satisfy the query criteria
      const querydocs = await getDocs(q);

      //if like was not pressed on press it should be added
      if (querydocs.empty) {
        // Add new like
        await addDoc(likesCollectionRef, {   //to the "Likes" collection
          userEmail,                         //add the userEmail to the object
          postId,                            //add the postID to the object
          timestamp: new Date()              //The time when it as added                   
        });
        
        setLikeobject(prev => ({
          ...prev,
          [postId]: true
        }));
      //if like was already pressed on press it should be removed
      } else {
        // Remove existing like
        const likeDoc = querydocs.docs[0];                        //get the first like in the doc
        await deleteDoc(doc(Namedb, "Likes", likeDoc.id));        //delete if it matches
        
        //get rid of the like info
        setLikeobject(prev => {
          const newState = { ...prev };
          delete newState[postId];
          return newState;
        });
      }
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };


  // Handle logout
  const handleLogout = () => {
    localStorage.clear();           //clear the user info 
    navigate("/SignIn");            //send back to signIn
  };

  // upon DOM loads this executes and gets all the necessary data.
  useEffect(() => {
    const userEmail = localStorage.getItem("email");        //get the current user
    if (userEmail) {                                        //if the email user exist then get likes associated with user
      fetchUserLikes(userEmail);
    }
    fetchProfileData();                                     //get all the profile data
    fetchPosts();                                           //get the post
  }, []);

  return (
    <div className="Feed">
      <h1 className="Feed_header">MEOWZA</h1>
      <img src={require("../styling/Logo.png")} alt="Logo" className="logo" />

      {/* post form box */}
      <div className="Post_info">
        {/* Post Text */}
        <textarea
          className="Post_txt"
          placeholder="What's on your mind today!"
          onChange={(e) => setPostTxt(e.target.value)}
          value={posttxt}
        />
        <br />

        {/* Post Img */}
        <input
          className="Post_Img"
          type="file"
          onChange={handlePostImgUpload}
          disabled={loading}
        />
        <br />

        {/* upload button */}
        <button
          className="PostAdd"
          onClick={handlePostInput}
          disabled={loading || (!imgUploadComplete && posttxt.trim() === "")}
        >
          {loading ? "Uploading..." : "Post!"}
        </button>
      </div>

      {/* Load any post from users */}
      <div className="Posts_display">
        <h2>Recent Posts</h2>
        {postData.map(post => (
          <div key={post.id} className="Post">
            {post.posttxtval && <p>{post.posttxtval}</p>}
            {post.postimgVal && <img src={post.postimgVal} alt="Post" />}
            <p>Posted by: {post.u_email}</p>
            
            <button 
              className="like-button-container"
              onClick={() => handleLike(post.id)}
              aria-label={likeobject[post.id] ? "Unlike post" : "Like post"}
            >
              <img
                src={likeobject[post.id] ? require("../styling/Like.png") : require("../styling/noLike.png")}
                alt={likeobject[post.id] ? "Liked" : "Like"}
                className="like-icon"
              />
              <span className="like-count">{post.likes || 0}</span>
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

      <button className="Logoutbutfeed" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Feed;