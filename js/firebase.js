import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  EmailAuthProvider,
  linkWithCredential,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";


/* =====================================================
   UMAMTEK FIREBASE CONFIG
===================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyCU-5U3KL85H7LRsHg9ck-KXo9RuTKqd68",
  authDomain: "umamtek-2cc57.firebaseapp.com",
  projectId: "umamtek-2cc57",
  storageBucket: "umamtek-2cc57.firebasestorage.app",
  messagingSenderId: "868603171659",
  appId: "1:868603171659:web:087f9df552ed09f354cece",
  measurementId: "G-KFYYWYS2TL"
};


/* =====================================================
   INITIALIZE FIREBASE
===================================================== */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

console.log("✅ UMAMTEK Firebase loaded");


/* =====================================================
   HELPERS
===================================================== */

function cleanPhone(phone){

  return String(phone || "")
    .replace(/\D/g, "");

}


function formatPhoneNumber(phone){

  const clean = cleanPhone(phone);

  if(clean.length === 10){

    return "+91" + clean;

  }

  if(clean.length === 12 && clean.startsWith("91")){

    return "+" + clean;

  }

  return "";

}


function phoneToEmail(phone){

  const clean = cleanPhone(phone);

  return clean + "@umamtek.com";

}


function showError(error){

  console.error("Firebase Error:", error);

  const code = error?.code || "";

  const messages = {

    "auth/invalid-phone-number":
      "Invalid mobile number.",

    "auth/too-many-requests":
      "Too many attempts. Please try again later.",

    "auth/quota-exceeded":
      "SMS limit reached. Please try again later.",

    "auth/invalid-verification-code":
      "Incorrect OTP. Please check and try again.",

    "auth/code-expired":
      "OTP expired. Please request a new OTP.",

    "auth/email-already-in-use":
      "This account already exists. Please login.",

    "auth/credential-already-in-use":
      "This mobile number is already linked to another account.",

    "auth/provider-already-linked":
      "This account is already configured.",

    "auth/invalid-credential":
      "Invalid phone number or password.",

    "auth/wrong-password":
      "Wrong phone number or password.",

    "auth/user-not-found":
      "Account not found.",

    "auth/operation-not-allowed":
      "Phone Authentication is not enabled in Firebase.",

    "auth/captcha-check-failed":
      "reCAPTCHA verification failed. Please try again.",

    "auth/missing-phone-number":
      "Please enter your mobile number."

  };

  alert(
    messages[code] ||
    error?.message ||
    "Something went wrong. Please try again."
  );

}


/* =====================================================
   RECAPTCHA
===================================================== */

function clearRecaptcha(){

  try{

    if(window.recaptchaVerifier){

      window.recaptchaVerifier.clear();

    }

  }catch(error){

    console.log("reCAPTCHA clear:", error);

  }

  window.recaptchaVerifier = null;

}


async function setupRecaptcha(){

  const container =
    document.getElementById("recaptcha-container");

  if(!container){

    throw new Error(
      "reCAPTCHA container missing. Add <div id='recaptcha-container'></div>"
    );

  }

  clearRecaptcha();

  container.innerHTML = "";

  window.recaptchaVerifier = new RecaptchaVerifier(
    auth,
    "recaptcha-container",
    {
      size: "normal",

      callback: function(){

        console.log("✅ reCAPTCHA verified");

      },

      "expired-callback": function(){

        console.log("⚠️ reCAPTCHA expired");

      }

    }
  );

  await window.recaptchaVerifier.render();

}


/* =====================================================
   GET OTP FROM SINGLE OR SIX INPUT BOXES
===================================================== */

function getSignupOTP(){

  /* Single input */

  const single =
    document.getElementById("signupOtp");

  if(single){

    return single.value
      .replace(/\D/g, "")
      .slice(0, 6);

  }


  /* Six OTP boxes */

  const boxes =
    document.querySelectorAll(".otp-input");

  if(boxes.length){

    return Array.from(boxes)
      .map(input => input.value.replace(/\D/g, ""))
      .join("")
      .slice(0, 6);

  }

  return "";

}


/* =====================================================
   OTP BOX AUTO MOVE
===================================================== */

document.addEventListener("input", function(event){

  if(!event.target.classList.contains("otp-input")){

    return;

  }

  event.target.value =
    event.target.value.replace(/\D/g, "").slice(0, 1);

  const boxes =
    Array.from(document.querySelectorAll(".otp-input"));

  const index =
    boxes.indexOf(event.target);

  if(
    event.target.value &&
    index >= 0 &&
    boxes[index + 1]
  ){

    boxes[index + 1].focus();

  }

});


/* =====================================================
   OTP BOX BACKSPACE
===================================================== */

document.addEventListener("keydown", function(event){

  if(
    event.key !== "Backspace" ||
    !event.target.classList.contains("otp-input")
  ){

    return;

  }

  if(event.target.value){

    return;

  }

  const boxes =
    Array.from(document.querySelectorAll(".otp-input"));

  const index =
    boxes.indexOf(event.target);

  if(index > 0){

    boxes[index - 1].focus();

  }

});


/* =====================================================
   SEND SIGNUP OTP
===================================================== */

window.sendSignupOTPForPasswordAccount =
async function(){

  try{

    const name =
      document.getElementById("signupName")
      ?.value.trim();

    const phone =
      document.getElementById("signupPhone")
      ?.value.trim();

    const password =
      document.getElementById("signupPassword")
      ?.value;

    const clean =
      cleanPhone(phone);

    if(!name){

      alert("Please enter your name.");

      return;

    }

    if(clean.length !== 10){

      alert("Please enter a valid 10 digit mobile number.");

      return;

    }

    if(!password){

      alert("Please enter a password.");

      return;

    }

    if(password.length < 6){

      alert("Password must be at least 6 characters.");

      return;

    }


    /* Check Firestore account */

    const userRef =
      doc(db, "users", clean);

    const userSnap =
      await getDoc(userRef);

    if(userSnap.exists()){

      alert(
        "This mobile number is already registered. Please login."
      );

      window.location.href = "login.html";

      return;

    }


    /* Setup reCAPTCHA */

    await setupRecaptcha();


    /* Send Firebase OTP */

    const formattedPhone =
      formatPhoneNumber(phone);

    if(!formattedPhone){

      alert("Invalid mobile number.");

      return;

    }


    window.confirmationResult =
      await signInWithPhoneNumber(
        auth,
        formattedPhone,
        window.recaptchaVerifier
      );


    /* Save signup data temporarily */

    sessionStorage.setItem(
      "umamtekSignupName",
      name
    );

    sessionStorage.setItem(
      "umamtekSignupPhone",
      clean
    );

    sessionStorage.setItem(
      "umamtekSignupPassword",
      password
    );


    alert(
      "✅ OTP sent successfully to +91 " + clean
    );


    /* Optional */

    const otpSection =
      document.getElementById("otpSection");

    if(otpSection){

      otpSection.style.display = "block";

    }

  }
  catch(error){

    clearRecaptcha();

    showError(error);

  }

};


/* =====================================================
   CREATE ACCOUNT AFTER OTP
===================================================== */

window.createPhonePasswordAccount =
async function(){

  try{

    const otp =
      getSignupOTP();

    const name =
      sessionStorage.getItem(
        "umamtekSignupName"
      ) ||
      document.getElementById("signupName")
        ?.value.trim();

    const phone =
      sessionStorage.getItem(
        "umamtekSignupPhone"
      ) ||
      cleanPhone(
        document.getElementById("signupPhone")
          ?.value.trim()
      );

    const password =
      sessionStorage.getItem(
        "umamtekSignupPassword"
      ) ||
      document.getElementById("signupPassword")
        ?.value;


    /* Validation */

    if(!name){

      alert("Please enter your name.");

      return;

    }

    if(phone.length !== 10){

      alert("Invalid mobile number.");

      return;

    }

    if(!password || password.length < 6){

      alert(
        "Password must contain at least 6 characters."
      );

      return;

    }

    if(otp.length !== 6){

      alert("Please enter the complete 6 digit OTP.");

      return;

    }

    if(!window.confirmationResult){

      alert(
        "Please click Send OTP first."
      );

      return;

    }


    /* =================================================
       VERIFY PHONE OTP
    ================================================= */

    const result =
      await window.confirmationResult.confirm(otp);


    const phoneUser =
      result.user;


    console.log(
      "✅ Phone verified:",
      phoneUser.uid
    );


    /* =================================================
       LINK EMAIL + PASSWORD TO SAME USER
    ================================================= */

    const email =
      phoneToEmail(phone);


    const credential =
      EmailAuthProvider.credential(
        email,
        password
      );


    try{

      await linkWithCredential(
        phoneUser,
        credential
      );

    }
    catch(error){

      if(
        error.code ===
        "auth/provider-already-linked"
      ){

        console.log(
          "Email/password already linked."
        );

      }
      else{

        throw error;

      }

    }


    /* =================================================
       SAVE USER PROFILE
    ================================================= */

    await setDoc(
      doc(db, "users", phone),
      {

        uid: phoneUser.uid,

        name: name,

        phone: phone,

        emailLogin: email,

        role: "customer",

        phoneVerified: true,

        accountStatus: "active",

        createdAt:
          new Date().toISOString()

      },
      {
        merge: true
      }
    );


    /* =================================================
       LOCAL SESSION
    ================================================= */

    localStorage.setItem(
      "umamtekLoggedIn",
      "true"
    );

    localStorage.setItem(
      "umamtekUser",
      name
    );

    localStorage.setItem(
      "umamtekPhone",
      phone
    );

    localStorage.setItem(
      "umamtekRole",
      "customer"
    );


    /* Clear temporary signup */

    sessionStorage.removeItem(
      "umamtekSignupName"
    );

    sessionStorage.removeItem(
      "umamtekSignupPhone"
    );

    sessionStorage.removeItem(
      "umamtekSignupPassword"
    );


    clearRecaptcha();


    alert(
      "🎉 UMAMTEK account created successfully!"
    );


    window.location.href =
      "index.html";

  }
  catch(error){

    showError(error);

  }

};


/* =====================================================
   LOGIN
===================================================== */

window.loginWithPhonePassword =
async function(){

  try{

    const phone =
      document.getElementById("loginPhone")
      ?.value.trim();

    const password =
      document.getElementById("loginPassword")
      ?.value;


    const clean =
      cleanPhone(phone);


    if(clean.length !== 10){

      alert(
        "Please enter a valid 10 digit mobile number."
      );

      return;

    }

    if(!password){

      alert("Please enter your password.");

      return;

    }


    /* Firestore user */

    const userRef =
      doc(db, "users", clean);

    const userSnap =
      await getDoc(userRef);


    if(!userSnap.exists()){

      alert(
        "Account not found. Please signup first."
      );

      window.location.href =
        "signup.html";

      return;

    }


    const email =
      phoneToEmail(clean);


    /* Firebase login */

    const result =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );


    const userData =
      userSnap.data();


    /* Save session */

    localStorage.setItem(
      "umamtekLoggedIn",
      "true"
    );

    localStorage.setItem(
      "umamtekUser",
      userData.name || "User"
    );

    localStorage.setItem(
      "umamtekPhone",
      clean
    );

    localStorage.setItem(
      "umamtekRole",
      userData.role || "customer"
    );


    console.log(
      "✅ Login:",
      result.user.uid
    );


    alert(
      "✅ Login successful!"
    );


    window.location.href =
      "index.html";

  }
  catch(error){

    showError(error);

  }

};


/* =====================================================
   LOGOUT
===================================================== */

window.logoutUser =
async function(){

  try{

    await signOut(auth);

  }
  catch(error){

    console.error(error);

  }


  localStorage.removeItem(
    "umamtekLoggedIn"
  );

  localStorage.removeItem(
    "umamtekUser"
  );

  localStorage.removeItem(
    "umamtekPhone"
  );

  localStorage.removeItem(
    "umamtekRole"
  );


  alert(
    "Logged out successfully."
  );


  window.location.href =
    "login.html";

};


/* =====================================================
   FORGOT PASSWORD
===================================================== */

window.forgotPasswordWithPhone =
function(){

  const phone =
    prompt(
      "Enter your registered mobile number"
    );


  if(!phone){

    return;

  }


  const clean =
    cleanPhone(phone);


  if(clean.length !== 10){

    alert(
      "Please enter a valid 10 digit mobile number."
    );

    return;

  }


  const message =
`UMAMTEK Password Reset Request

Registered Mobile Number: ${clean}

Please help me reset my UMAMTEK account password.`;


  const url =
    "https://wa.me/919065760751?text=" +
    encodeURIComponent(message);


  window.open(
    url,
    "_blank"
  );

};


/* =====================================================
   PAGE LOAD
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  function(){

    console.log(
      "🚀 UMAMTEK Auth System Ready"
    );

  }
);