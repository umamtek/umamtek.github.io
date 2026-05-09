import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

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

function cleanPhoneForWhatsApp(phone){
  phone = String(phone || "").replace(/\D/g, "");

  if(phone.startsWith("91") && phone.length === 12){
    return phone;
  }

  if(phone.length === 10){
    return "91" + phone;
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
  const phone = document.getElementById("loginPhone").value;
  const role = document.getElementById("loginRole") ? document.getElementById("loginRole").value : "customer";

  if(!otp){
    alert("Please enter OTP");
    return;
  }

  window.confirmationResult.confirm(otp)
  .then((result) => {
    alert("Login successful");

    localStorage.setItem("umamtekLoggedIn", "true");
    localStorage.setItem("umamtekPhone", phone);
    localStorage.setItem("umamtekRole", role || "customer");

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

/* BOOKING FORM */

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

    status: "Pending",

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

/* ADMIN BOOKING LOAD */

window.loadBookings = async function(){

  const bookingContainer =
  document.getElementById("bookingContainer");

  if(!bookingContainer){
    return;
  }

  bookingContainer.innerHTML =
  "<p>Loading bookings...</p>";

  try{

    const querySnapshot =
    await getDocs(collection(db, "bookings"));

    bookingContainer.innerHTML = "";

    querySnapshot.forEach((doc) => {

      const data = doc.data();

      const whatsappPhone = cleanPhoneForWhatsApp(data.phone);

      bookingContainer.innerHTML += `

      <div class="card">

        <h3>${data.name || "No Name"}</h3>

        <p><strong>Phone:</strong> ${data.phone || ""}</p>

        <p><strong>Service:</strong> ${data.service || ""}</p>

        <p><strong>Address:</strong> ${data.address || ""}</p>

        <p><strong>Date:</strong> ${data.date || ""}</p>

        <p><strong>Time:</strong> ${data.time || ""}</p>

        <p><strong>Details:</strong> ${data.details || ""}</p>

        <div style="display:flex;gap:10px;margin-top:15px;flex-wrap:wrap;">

          <a
          href="https://wa.me/${whatsappPhone}"
          target="_blank"
          class="primary-btn"
          style="padding:10px 16px;font-size:14px;">
          WhatsApp
          </a>

          <a
          href="tel:${data.phone || ""}"
          class="secondary-btn"
          style="padding:10px 16px;font-size:14px;color:#111;border-color:#111;">
          Call
          </a>

          <span
          style="
          background:#f5b301;
          color:#111;
          padding:10px 16px;
          border-radius:10px;
          font-weight:700;
          font-size:14px;">
          ${data.status || "Pending"}
          </span>

        </div>

      </div>

      `;

    });

  }catch(error){

    bookingContainer.innerHTML =
    `<p>${error.message}</p>`;

  }

};
