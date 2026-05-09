import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCU-5U3KL85H7LRsHg9ck-KXo9RuTKqd68",
  authDomain: "umamtek-2cc57.firebaseapp.com",
  projectId: "umamtek-2cc57",
  storageBucket: "umamtek-2cc57.firebasestorage.app",
  messagingSenderId: "868603171659",
  appId: "1:868603171659:web:087f9df552ed09f354cece",
  measurementId: "G-KFYYWYS2TL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function formatPhoneNumber(phone){
  phone = phone.trim();

  if(phone.startsWith("+91")){
    return phone;
  }

  if(phone.length === 10){
    return "+91" + phone;
  }

  return phone;
}

function setupRecaptcha(){
  if(!window.recaptchaVerifier){
    window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "normal"
    });
  }
}

/* LOGIN OTP */

window.sendLoginOTP = function(){

  const phoneInput = document.getElementById("loginPhone");
  const phoneNumber = formatPhoneNumber(phoneInput.value);

  if(!phoneNumber){
    alert("Please enter your phone number");
    return;
  }

  setupRecaptcha();

  signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)
  .then((confirmationResult) => {
    window.confirmationResult = confirmationResult;
    alert("OTP sent successfully");
  })
  .catch((error) => {
    alert(error.message);
  });

};

window.verifyLoginOTP = function(){

  const otp = document.getElementById("loginOtp").value;

  if(!otp){
    alert("Please enter OTP");
    return;
  }

  window.confirmationResult.confirm(otp)
  .then((result) => {
    alert("Login successful");
    localStorage.setItem("umamtekLoggedIn", "true");
    window.location.href = "index.html";
  })
  .catch((error) => {
    alert("Invalid OTP");
  });

};

/* SIGNUP OTP */

window.sendSignupOTP = function(){

  const phoneInput = document.getElementById("signupPhone");
  const phoneNumber = formatPhoneNumber(phoneInput.value);

  if(!phoneNumber){
    alert("Please enter your phone number");
    return;
  }

  setupRecaptcha();

  signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)
  .then((confirmationResult) => {
    window.confirmationResult = confirmationResult;
    alert("OTP sent successfully");
  })
  .catch((error) => {
    alert(error.message);
  });

};

window.verifySignupOTP = function(){

  const otp = document.getElementById("signupOtp").value;

  if(!otp){
    alert("Please enter OTP");
    return;
  }

  window.confirmationResult.confirm(otp)
  .then((result) => {
    alert("Account created successfully");

    localStorage.setItem("umamtekUser", document.getElementById("signupName").value);
    localStorage.setItem("umamtekPhone", document.getElementById("signupPhone").value);
    localStorage.setItem("umamtekRole", document.getElementById("signupRole").value);
    localStorage.setItem("umamtekLoggedIn", "true");
    window.location.href = "index.html";
  })
  .catch((error) => {
    alert("Invalid OTP");
  });

};

window.submitBooking = async function(event){

  event.preventDefault();

  const bookingData = {

    name: document.getElementById("bookingName").value,

    phone: document.getElementById("bookingPhone").value,

    service: document.getElementById("bookingService").value,

    address: document.getElementById("bookingAddress").value,

    date: document.getElementById("bookingDate").value,

    time: document.getElementById("bookingTime").value,

    details: document.getElementById("bookingDetails").value,

    createdAt: new Date().toISOString()

  };

  try{

    await addDoc(collection(db, "bookings"), bookingData);

    alert("Booking request submitted successfully");

    window.location.reload();

  }catch(error){

    alert(error.message);

  }

};
