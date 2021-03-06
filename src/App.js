import React, { useState } from 'react';
import './App.css';
import * as firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';
firebase.initializeApp(firebaseConfig);

function App() {
  const googleProvider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();

  const [newUser, setNewUser] = useState(false);
  const [user, setUser] = useState({
    isSignedIn: false,
    name: '',
    email: '',
    password: '',
    photo: '',
    error: ''
  })
  const handleSignIn = () => {
    // console.log('clicked')
    firebase.auth().signInWithPopup(googleProvider)
      .then(res => {
        //console.log(res) >>o/p : {user: P, credential: Hg, additionalUserInfo: ng, operationType: "signIn"}
        const { displayName, email, photoURL } = res.user;
        const signedInUser = {
          isSignedIn: true,
          name: displayName,
          email: email,
          photo: photoURL
        }
        setUser(signedInUser);
        // console.log(displayName, email, photoURL);
      })
      .catch(error => {
        console.log(error);
        console.log(error.message);
      })
  }
  const handleFbSignIn=() =>{
    firebase.auth().signInWithPopup(fbProvider)
    .then(function(result) {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      console.log('fb user after sign in',user)
      // ...
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
  }
  const handleSignOut = () => {
    // console.log('Sign out clicked');
    firebase.auth().signOut()
      .then(res => {
        const signedOutUser = {
          isSignedIn: false,
          name: '',
          email: '',
          photo: '',
          error: '',
          success: false
        }
        setUser(signedOutUser);
        console.log(res)
      })
      .catch(err => {
        console.log(err)
      })
  }
  const handleBlur = (e) => {
    // console.log(e.target.name,e.target.value);
    // debugger;
    let isFieldValid = true;
    if (e.target.name === 'email') {
      // const isEmailValid = /\S+@\S+\.\S+/.test(e.target.value);
      // console.log(isEmailValid);
      isFieldValid = /\S+@\S+\.\S+/.test(e.target.value);
    }
    if (e.target.name === 'password') {
      const isPasswordValid = e.target.value.length > 6;
      const passwordHasNumber = /\d{1}/.test(e.target.value);
      // console.log(isPasswordValid && passwordHasNumber);
      isFieldValid = isPasswordValid && passwordHasNumber;

    }
    if (isFieldValid) {
      const newUserInfo = { ...user };
      newUserInfo[e.target.name] = e.target.value;
      setUser(newUserInfo);
    }
    //  lowercase /[a-z]/.test('ASIMAa') 
    // uppercase /[A-Z]/.test('asimaA')
    // special character /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test('asimaa~')

  }
  //submit event handler
  const handleSubmit = (e) => {
    console.log(user.email, user.password);
    if (newUser && user.email && user.password) {
      // console.log('submitting')
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then(res => {
          // console.log(res);
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
          updateUserName(user.name)
        })
        .catch(error => {
          // Handle Errors here.
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
          // var errorCode = error.code;
          // var errorMessage = error.message;
          // console.log(errorCode, errorMessage)
          // ...
        });
    }
    if (!newUser && user.email && user.password) {
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
          console.log('sign in user info',res.user)
        })
        .catch(error => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }
    e.preventDefault();
  }
  const updateUserName = name => {
    const user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name
    }).then(function () {
      console.log('user name updated successfully!')
    }).catch(function (error) {
      console.log(error)
    });
  }
  return (
    <div className="App">
      {
        user.isSignedIn ? <button onClick={handleSignOut}>Sign Out</button>
          : <button onClick={handleSignIn}>Sign In</button>
      }
      <br/>
      <button onClick={handleFbSignIn}>Sign in Using Facebook</button>
      {
        user.isSignedIn && <div>
          <p>Welcome, {user.name}</p>
          <p>your Email : {user.email}</p>
          <img src={user.photo} alt="" />
        </div>
      }
      <h1>Our Own Authentication</h1>
      {/* <h2>Name:{user.name}</h2>
      <h2>Email:{user.email}</h2>
      <h2>Password:{user.password}</h2> */}
      <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id="" />
      <label htmlFor="newUser">New User Sign Up</label>
      <form onSubmit={handleSubmit}>
        {newUser && <input type="text" onBlur={handleBlur} name="name" placeholder="Your Name" />}
        <br />
        <input type="text" onBlur={handleBlur} name="email" placeholder="Your Email address" required />
        <br />
        <input type="password" onBlur={handleBlur} name="password" placeholder="Your Password" required />
        <br />
        <input type="submit" value={newUser? 'Sign Up': 'Sign In'} />
      </form>
      <p style={{ color: 'red' }}>{user.error}</p>
      {
        user.success && <p style={{ color: 'green' }}>User {newUser ? 'created' : 'Logged in '} successfully!</p>
      }
    </div>
  );
}

export default App;
