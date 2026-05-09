import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

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

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  setDoc
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

function cleanPhone(phone){
  return String(phone || "").replace(/\D/g, "");
}

function formatPhoneNumber(phone){
  const clean = cleanPhone(phone);

  if(clean.length === 10){
    return "+91" + clean;
  }

  if(clean.length === 12 && clean.startsWith("91")){
    return "+" + clean;
  }

  return phone;
}

function phoneToEmail(phone){
  const clean = cleanPhone(phone);
  return clean + "@umamtek.com";
}

function cleanPhoneForWhatsApp(phone){
  const clean = cleanPhone(phone);

  if(clean.startsWith("91") && clean.length === 12){
    return clean;
  }

  if(clean.length === 10){
    return "91" + clean;
  }

  return clean;
}

/* SIGNUP — OTP FIRST TIME ONLY */

window.sendSignupOTPForPasswordAccount = async function(){

  try{

    const name = document.getElementById("signupName").value;
    const phone = document.getElementById("signupPhone").value;
    const role = "customer";
    const password = document.getElementById("signupPassword").value;

    const clean = cleanPhone(phone);

    if(!name || !phone || !role || !password){
      alert("Please fill all signup details");
      return;
    }

    if(clean.length !== 10){
      alert("Please enter valid 10 digit mobile number");
      return;
    }

    if(password.length < 6){
      alert("Password must be at least 6 characters");
      return;
    }

    const userRef = doc(db, "users", clean);
    const userSnap = await getDoc(userRef);

    if(userSnap.exists()){
      alert("Account already registered. Please login.");
      window.location.href = "login.html";
      return;
    }

    const recaptchaBox =
    document.getElementById("recaptcha-container");

    if(!recaptchaBox){
      alert("reCAPTCHA container missing");
      return;
    }

    recaptchaBox.innerHTML = "";

    window.recaptchaVerifier =
    new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "normal"
      }
    );

    await window.recaptchaVerifier.render();

    window.confirmationResult =
    await signInWithPhoneNumber(
      auth,
      formatPhoneNumber(phone),
      window.recaptchaVerifier
    );

    alert("OTP sent successfully");

  }catch(error){

    alert("OTP Error: " + error.message);

  }

};

window.createPhonePasswordAccount = async function(){

  const otp = document.getElementById("signupOtp").value;

  const name = document.getElementById("signupName").value;
  const phone = document.getElementById("signupPhone").value;
  const role = "customer";
  const password = document.getElementById("signupPassword").value;

  const clean = cleanPhone(phone);
  const email = phoneToEmail(phone);

  if(!otp){
    alert("Please enter OTP");
    return;
  }

  if(!window.confirmationResult){
    alert("Please click Send OTP first.");
    return;
  }

  try{

    await window.confirmationResult.confirm(otp);

    const userRef = doc(db, "users", clean);
    const userSnap = await getDoc(userRef);

    if(userSnap.exists()){
      alert("Account already registered. Please login.");
      window.location.href = "login.html";
      return;
    }

    await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "users", clean), {
      name: name,
      phone: clean,
      role: role,
      emailLogin: email,
      createdAt: new Date().toISOString()
    });

    localStorage.setItem("umamtekLoggedIn", "true");
    localStorage.setItem("umamtekUser", name);
    localStorage.setItem("umamtekPhone", clean);
    localStorage.setItem("umamtekRole", role);

    alert("Account created successfully");
    window.location.href = "index.html";

  }catch(error){

    if(error.code === "auth/email-already-in-use"){
      alert("Account already registered. Please login.");
      window.location.href = "login.html";
      return;
    }

    alert(error.message);

  }

};

/* LOGIN — PHONE + PASSWORD */

window.loginWithPhonePassword = async function(){

  const phone = document.getElementById("loginPhone").value;
  const password = document.getElementById("loginPassword").value;
  const role = "customer";

  const clean = cleanPhone(phone);
  const email = phoneToEmail(phone);

  if(!phone || !password){
    alert("Please enter phone number and password");
    return;
  }

  if(clean.length !== 10){
    alert("Please enter valid 10 digit mobile number");
    return;
  }

  try{

    const userRef = doc(db, "users", clean);
    const userSnap = await getDoc(userRef);

    if(!userSnap.exists()){
      alert("Account not found. Please signup first.");
      window.location.href = "signup.html";
      return;
    }

    await signInWithEmailAndPassword(auth, email, password);

    const userData = userSnap.data();

    localStorage.setItem("umamtekLoggedIn", "true");
    localStorage.setItem("umamtekUser", userData.name || "User");
    localStorage.setItem("umamtekPhone", clean);
    localStorage.setItem("umamtekRole", role || userData.role || "customer");

    alert("Login successful");
    window.location.href = "index.html";

  }catch(error){

    if(error.code === "auth/wrong-password" || error.code === "auth/invalid-credential"){
      alert("Wrong phone number or password");
      return;
    }

    alert(error.message);

  }

};

/* FORGOT PASSWORD */

window.forgotPasswordWithPhone = function(){

  const phone = prompt("Enter your registered mobile number");

  if(!phone){
    return;
  }

  const message =
`Password Reset Request

Registered Mobile Number: ${phone}

Please help me reset my UMAMTEK account password.`;

  const url =
`https://wa.me/919065760751?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank");

};

/* LIVE CUSTOMER LOCATION */

window.getCustomerLocation = function(){

  const status =
  document.getElementById("locationStatus");

  if(!navigator.geolocation){

    status.innerHTML =
    "Geolocation not supported";

    return;
  }

  status.innerHTML =
  "Fetching live location...";

  navigator.geolocation.getCurrentPosition(

    function(position){

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      document.getElementById("bookingLatitude").value = lat;

      document.getElementById("bookingLongitude").value = lng;

      document.getElementById("bookingMapLink").value =
      `https://maps.google.com/?q=${lat},${lng}`;

      status.innerHTML =
      "✅ Live location added successfully";

    },

    function(error){

      status.innerHTML =
      "❌ Location permission denied";

    }

  );

};

/* BOOKING FORM */

window.submitBooking = async function(event){

  event.preventDefault();

  const mapLink =
document.getElementById("bookingMapLink").value;

if(!mapLink){

  alert("Please add your live location");

  return;
}
  const bookingId =
  "AEA" + Math.floor(1000 + Math.random() * 9000);

  const now = new Date();

  const bookingDate =
  now.toLocaleDateString("en-GB");

  const bookingTime =
  now.toLocaleTimeString([], {
  hour: '2-digit',
  minute: '2-digit'
});
 const bookingData = {

    bookingId: bookingId,

    bookingCreatedDate: bookingDate,

    bookingCreatedTime: bookingTime,
   
    name: document.getElementById("bookingName").value,

    phone: document.getElementById("bookingPhone").value,

    service: document.getElementById("bookingService").value,

    address: document.getElementById("bookingAddress").value,

    date: document.getElementById("bookingDate").value,

    time: document.getElementById("bookingTime").value,

    details: document.getElementById("bookingDetails").value,
    
    pinCode: document.getElementById("bookingPin").value,

    latitude: document.getElementById("bookingLatitude").value,

    longitude: document.getElementById("bookingLongitude").value,

    mapLink: document.getElementById("bookingMapLink").value,

    userPhone: localStorage.getItem("umamtekPhone") || "",

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

    querySnapshot.forEach((docSnap) => {

      const bookingDocId = docSnap.id;

      const data = docSnap.data();

      const whatsappPhone = cleanPhoneForWhatsApp(data.phone);

      bookingContainer.innerHTML += `

      <div class="card">

        <h3>${data.name || "No Name"}</h3>

        <p><strong>Booking ID:</strong> ${data.bookingId || ""}</p>

        <p><strong>Booked On:</strong> ${data.bookingCreatedDate || ""} ${data.bookingCreatedTime || ""}</p>

        <p><strong>Phone:</strong> ${data.phone || ""}</p>

        <p><strong>Service:</strong> ${data.service || ""}</p>

        <p><strong>Address:</strong> ${data.address || ""}</p>

        <p><strong>PIN Code:</strong> ${data.pinCode || ""}</p>

        <p>
        <strong>Location:</strong>
        <a href="${data.mapLink || "#"}" target="_blank">
        Open Google Map
       </a>
       </p>

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

          <select
onchange="updateBookingStatus('${bookingDocId}', this.value)"
style="
padding:10px;
border-radius:10px;
font-weight:700;
border:2px solid #f5b301;
background:#fff8d6;
">

<option value="Pending"
${data.status === "Pending" ? "selected" : ""}>
Pending
</option>

<option value="Accepted"
${data.status === "Accepted" ? "selected" : ""}>
Accepted
</option>

<option value="On The Way"
${data.status === "On The Way" ? "selected" : ""}>
On The Way
</option>

<option value="Completed"
${data.status === "Completed" ? "selected" : ""}>
Completed
</option>

<option value="Cancelled"
${data.status === "Cancelled" ? "selected" : ""}>
Cancelled
</option>

</select>

        </div>

      </div>

      `;

    });

  }catch(error){

    bookingContainer.innerHTML =
    `<p>${error.message}</p>`;

  }

};

/* LOAD CUSTOMER BOOKINGS */

window.loadMyBookings = async function(){

  const bookingContainer =
  document.getElementById("myBookingContainer");

  if(!bookingContainer){
    return;
  }

  const userPhone =
  localStorage.getItem("umamtekPhone");

  if(!userPhone){

    bookingContainer.innerHTML = `
    <div class="card">
      Please login first
    </div>
    `;

    return;
  }

  bookingContainer.innerHTML = `
  <div class="card">
    Loading your bookings...
  </div>
  `;

  try{

    const querySnapshot =
    await getDocs(collection(db, "bookings"));

    bookingContainer.innerHTML = "";

    let found = false;

    querySnapshot.forEach((docSnap) => {

      const data = docSnap.data();

      if(data.userPhone === userPhone){

        found = true;

        bookingContainer.innerHTML += `

        <div class="card">

          <h2 style="margin-bottom:15px;">
          ${data.bookingId || "Booking"}
          </h2>

          <p>
          <strong>Booked On:</strong>
          ${data.bookingCreatedDate || ""}
          ${data.bookingCreatedTime || ""}
          </p>

          <p>
          <strong>Service:</strong>
          ${data.service || ""}
          </p>

          <p>
          <strong>Address:</strong>
          ${data.address || ""}
          </p>

          <p>
          <strong>PIN Code:</strong>
          ${data.pinCode || ""}
          </p>

          <p>
          <strong>Status:</strong>

          <span style="
          background:#f5b301;
          color:#111;
          padding:6px 12px;
          border-radius:10px;
          font-weight:700;
          display:inline-block;
          margin-top:6px;
          ">
          ${data.status || "Pending"}
          </span>

          </p>

          <a
          href="${data.mapLink || "#"}"
          target="_blank"
          class="primary-btn"
          style="
          display:inline-block;
          margin-top:15px;
          text-decoration:none;
          ">
          Open Live Location
          </a>

        </div>

        `;

      }

    });

    if(!found){

      bookingContainer.innerHTML = `
      <div class="card">
        No bookings found 😄
      </div>
      `;

    }

  }catch(error){

    bookingContainer.innerHTML = `
    <div class="card">
      ${error.message}
    </div>
    `;

  }

};

window.updateBookingStatus = async function(bookingDocId, newStatus){

  try{

    const bookingRef = doc(db, "bookings", bookingDocId);

    await updateDoc(bookingRef, {
      status: newStatus
    });

    alert("Booking status updated to " + newStatus);

    window.location.reload();

  }catch(error){

    alert(error.message);

  }

};
