import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
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

/* SIGNUP OTP */

window.sendSignupOTPForPasswordAccount = async function(){

  try{

    const name = document.getElementById("signupName")?.value.trim();
    const phone = document.getElementById("signupPhone")?.value.trim();
    const password = document.getElementById("signupPassword")?.value;
    const role = "customer";

    const clean = cleanPhone(phone);

    if(!name || !phone || !password){
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

    const recaptchaBox = document.getElementById("recaptcha-container");

    if(!recaptchaBox){
      alert("reCAPTCHA container missing");
      return;
    }

    recaptchaBox.innerHTML = "";

    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "normal"
      }
    );

    await window.recaptchaVerifier.render();

    window.confirmationResult = await signInWithPhoneNumber(
      auth,
      formatPhoneNumber(phone),
      window.recaptchaVerifier
    );

    alert("OTP sent successfully");

  }catch(error){
    alert("OTP Error: " + error.message);
  }

};

/* CREATE ACCOUNT */

window.createPhonePasswordAccount = async function(){

  const otp = document.getElementById("signupOtp")?.value.trim();
  const name = document.getElementById("signupName")?.value.trim();
  const phone = document.getElementById("signupPhone")?.value.trim();
  const password = document.getElementById("signupPassword")?.value;
  const role = "customer";

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

/* LOGIN */

window.loginWithPhonePassword = async function(){

  const phone = document.getElementById("loginPhone")?.value.trim();
  const password = document.getElementById("loginPassword")?.value;

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
    localStorage.setItem("umamtekRole", userData.role || "customer");

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

/* LOGOUT */

window.logoutUser = async function(){

  try{
    await signOut(auth);
  }catch(error){
    console.log(error.message);
  }

  localStorage.removeItem("umamtekLoggedIn");
  localStorage.removeItem("umamtekUser");
  localStorage.removeItem("umamtekPhone");
  localStorage.removeItem("umamtekRole");

  alert("Logged out successfully");
  window.location.href = "login.html";

};

/* CUSTOMER LIVE LOCATION */

window.getCustomerLocation = function(){

  const status = document.getElementById("locationStatus");

  if(!status){
    alert("Location status box missing");
    return;
  }

  if(!navigator.geolocation){
    status.innerHTML = "Geolocation not supported";
    return;
  }

  status.innerHTML = "Fetching live location...";

  navigator.geolocation.getCurrentPosition(

    function(position){

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      document.getElementById("bookingLatitude").value = lat;
      document.getElementById("bookingLongitude").value = lng;
      document.getElementById("bookingMapLink").value =
      `https://maps.google.com/?q=${lat},${lng}`;

      status.innerHTML = "✅ Live location added successfully";

    },

    function(){
      status.innerHTML = "❌ Location permission denied";
    }

  );

};

/* SUBMIT BOOKING */

window.submitBooking = async function(event){

  event.preventDefault();

  const userPhone = localStorage.getItem("umamtekPhone");

  if(!userPhone){
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  const mapLink = document.getElementById("bookingMapLink")?.value;

  if(!mapLink){
    alert("Please add your live location");
    return;
  }

  const bookingId = "AEA" + Math.floor(1000 + Math.random() * 9000);

  const now = new Date();

  const bookingDate = now.toLocaleDateString("en-GB");

  const bookingTime = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  const bookingData = {
    bookingId: bookingId,
    bookingCreatedDate: bookingDate,
    bookingCreatedTime: bookingTime,

    name: document.getElementById("bookingName")?.value.trim() || "",
    phone: document.getElementById("bookingPhone")?.value.trim() || "",
    service: document.getElementById("bookingService")?.value || "",
    address: document.getElementById("bookingAddress")?.value.trim() || "",
    date: document.getElementById("bookingDate")?.value || "",
    time: document.getElementById("bookingTime")?.value || "",
    details: document.getElementById("bookingDetails")?.value.trim() || "",
    pinCode: document.getElementById("bookingPin")?.value.trim() || "",

    latitude: document.getElementById("bookingLatitude")?.value || "",
    longitude: document.getElementById("bookingLongitude")?.value || "",
    mapLink: mapLink,

    userPhone: userPhone,
    status: "Pending",

    editableUntil: new Date(Date.now() + 180000).toISOString(),
    createdAt: new Date().toISOString()
  };

  if(!bookingData.name || !bookingData.phone || !bookingData.service || !bookingData.address){
    alert("Please fill all required booking details");
    return;
  }

  try{

    await addDoc(collection(db, "bookings"), bookingData);

    alert("Booking request submitted successfully");
    window.location.reload();

  }catch(error){
    alert(error.message);
  }

};

/* ADMIN LOAD BOOKINGS */

window.loadBookings = async function(){

  const bookingContainer = document.getElementById("bookingContainer");

  if(!bookingContainer){
    return;
  }

  bookingContainer.innerHTML = "<p>Loading bookings...</p>";

  try{

    const querySnapshot = await getDocs(collection(db, "bookings"));

    bookingContainer.innerHTML = "";

    if(querySnapshot.empty){
      bookingContainer.innerHTML = "<p>No bookings found</p>";
      return;
    }

    querySnapshot.forEach((docSnap) => {

      const bookingDocId = docSnap.id;
      const data = docSnap.data();

      const whatsappPhone = cleanPhoneForWhatsApp(data.phone);

      bookingContainer.innerHTML += `

      <div class="card">

        <h3>${data.name || "No Name"}</h3>

        <p><strong>Booking ID:</strong> ${data.bookingId || ""}</p>
        <p><strong>Booked On:</strong> ${data.bookingCreatedDate || ""} ${data.bookingCreatedTime || ""}</p>
        <p><strong>Customer Phone:</strong> ${data.phone || ""}</p>
        <p><strong>Login Phone:</strong> ${data.userPhone || ""}</p>
        <p><strong>Service:</strong> ${data.service || ""}</p>
        <p><strong>Address:</strong> ${data.address || ""}</p>
        <p><strong>PIN Code:</strong> ${data.pinCode || ""}</p>

        <p>
          <strong>Location:</strong>
          <a href="${data.mapLink || "#"}" target="_blank">
            Open Google Map
          </a>
        </p>

        <p><strong>Expected Date:</strong> ${data.date || ""}</p>
        <p><strong>Expected Time:</strong> ${data.time || ""}</p>
        <p><strong>Details:</strong> ${data.details || ""}</p>

        <p>
          <strong>Status:</strong>
          <span style="
            background:#f5b301;
            color:#111;
            padding:6px 12px;
            border-radius:10px;
            font-weight:700;
            display:inline-block;
            margin-top:6px;">
            ${data.status || "Pending"}
          </span>
        </p>

        ${data.customerAction ? `
          <p><strong>Customer Action:</strong> ${data.customerAction}</p>
        ` : ""}

        ${data.customerChangeRequest ? `
          <p><strong>Change Request:</strong> ${data.customerChangeRequest}</p>
        ` : ""}

        ${data.customerActionAt ? `
          <p><strong>Customer Action Time:</strong> ${new Date(data.customerActionAt).toLocaleString()}</p>
        ` : ""}

        ${data.technicianMapLink ? `
          <p>
            <strong>Technician Location:</strong>
            <a href="${data.technicianMapLink}" target="_blank">
              Track Technician
            </a>
          </p>
        ` : `
          <p><strong>Technician Location:</strong> Not updated yet</p>
        `}

        <div style="display:flex;gap:10px;margin-top:15px;flex-wrap:wrap;">

          <a
            href="https://wa.me/${whatsappPhone}"
            target="_blank"
            class="primary-btn"
            style="padding:10px 16px;font-size:14px;text-decoration:none;">
            WhatsApp
          </a>

          <a
            href="tel:${data.phone || ""}"
            class="secondary-btn"
            style="padding:10px 16px;font-size:14px;color:#111;border-color:#111;text-decoration:none;">
            Call
          </a>

          <button
            onclick="updateTechnicianLocation('${bookingDocId}')"
            style="padding:10px 16px;font-size:14px;">
            Update My Location
          </button>
          <button
onclick="assignTechnician('${bookingDocId}')"
style="padding:10px 16px;font-size:14px;">
Assign Technician
</button>

          <select
            onchange="updateBookingStatus('${bookingDocId}', this.value)"
            style="
              padding:10px;
              border-radius:10px;
              font-weight:700;
              border:2px solid #f5b301;
              background:#fff8d6;">

            <option value="Pending" ${data.status === "Pending" ? "selected" : ""}>Pending</option>
            <option value="Accepted" ${data.status === "Accepted" ? "selected" : ""}>Accepted</option>
            <option value="On The Way" ${data.status === "On The Way" ? "selected" : ""}>On The Way</option>
            <option value="Completed" ${data.status === "Completed" ? "selected" : ""}>Completed</option>
            <option value="Cancelled" ${data.status === "Cancelled" ? "selected" : ""}>Cancelled</option>

          </select>

        </div>

      </div>

      `;

    });

  }catch(error){
    bookingContainer.innerHTML = `<p>${error.message}</p>`;
  }

};

/* CUSTOMER MY BOOKINGS */

window.loadMyBookings = async function(){

  const bookingContainer = document.getElementById("myBookingContainer");
  if(!bookingContainer) return;

  const userPhone = localStorage.getItem("umamtekPhone");

  if(!userPhone){
    bookingContainer.innerHTML = `<div class="card">Please login first</div>`;
    return;
  }

  try{

    const querySnapshot = await getDocs(collection(db, "bookings"));
    bookingContainer.innerHTML = "";

    let found = false;

    querySnapshot.forEach((docSnap) => {

      const bookingDocId = docSnap.id;
      const data = docSnap.data();

      const canEdit =
      data.editableUntil && new Date(data.editableUntil) > new Date();

      if(data.userPhone === userPhone){

        found = true;

        bookingContainer.innerHTML += `
        <div class="card">

          <h2>${data.bookingId || "Booking"}</h2>

          <p><strong>Booked On:</strong> ${data.bookingCreatedDate || ""} ${data.bookingCreatedTime || ""}</p>
          <p><strong>Service:</strong> ${data.service || ""}</p>
          <p><strong>Address:</strong> ${data.address || ""}</p>
          <p><strong>PIN Code:</strong> ${data.pinCode || ""}</p>
          <p><strong>Expected Visit:</strong> ${data.date || ""} ${data.time || ""}</p>
          <p><strong>Details:</strong> ${data.details || ""}</p>

          <div class="timeline">
            <div class="timeline-step ${data.status === "Pending" ? "active" : ""}">Pending</div>
            <div class="timeline-step ${data.status === "Accepted" ? "active" : ""}">Accepted</div>
            <div class="timeline-step ${data.status === "On The Way" ? "active" : ""}">On The Way</div>
            <div class="timeline-step ${data.status === "Completed" ? "active" : ""}">Completed</div>
          </div>

          <p>
            <strong>Status:</strong>
            <span style="background:#f5b301;color:#111;padding:6px 12px;border-radius:10px;font-weight:700;">
              ${data.status || "Pending"}
            </span>
          </p>

          <a href="${data.mapLink || "#"}" target="_blank" class="primary-btn" style="display:inline-block;margin-top:15px;text-decoration:none;">
            Open Live Location
          </a>

          ${
            data.technicianMapLink
            ? `<a href="${data.technicianMapLink}" target="_blank" class="primary-btn" style="display:inline-block;margin-top:15px;margin-left:10px;text-decoration:none;">Track Technician 🚗</a>`
            : `<p style="margin-top:15px;font-weight:700;">Technician tracking not started yet</p>`
          }

          ${
            canEdit
            ? `
            <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:15px;">
              <button onclick="requestBookingChange('${bookingDocId}')">Request Change</button>
              <button onclick="updateCustomerAddress('${bookingDocId}')">Update Address</button>
              <button onclick="cancelCustomerBooking('${bookingDocId}')">Cancel Booking</button>
            </div>
            <p style="margin-top:10px;font-size:13px;font-weight:700;color:#d60000;">
              You can edit this booking for 180 seconds after booking.
            </p>`
            : `<p style="margin-top:15px;font-size:13px;font-weight:700;">Edit window closed.</p>`
          }

        </div>`;
      }

    });

    if(!found){
      bookingContainer.innerHTML = `<div class="card">No bookings found</div>`;
    }

  }catch(error){
    bookingContainer.innerHTML = `<div class="card">${error.message}</div>`;
  }

};

window.updateBookingStatus = async function(bookingDocId, newStatus){

  try{
    await updateDoc(doc(db, "bookings", bookingDocId), {
      status: newStatus
    });

    alert("Booking status updated to " + newStatus);
    window.location.reload();

  }catch(error){
    alert(error.message);
  }

};

window.updateTechnicianLocation = async function(bookingDocId){

  if(!navigator.geolocation){
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(async function(position){

    try{

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      await updateDoc(doc(db, "bookings", bookingDocId), {
        technicianLatitude: lat,
        technicianLongitude: lng,
        technicianMapLink: `https://maps.google.com/?q=${lat},${lng}`,
        technicianTrackingUpdatedAt: new Date().toISOString()
      });

      alert("Technician live location updated");

    }catch(error){
      alert(error.message);
    }

  }, function(){
    alert("Location permission denied");
  });

};

window.cancelCustomerBooking = async function(bookingDocId){

  try{
    await updateDoc(doc(db, "bookings", bookingDocId), {
      status: "Cancelled",
      customerAction: "Cancelled by customer",
      customerActionAt: new Date().toISOString()
    });

    alert("Booking cancelled successfully");
    window.location.reload();

  }catch(error){
    alert(error.message);
  }

};

window.requestBookingChange = async function(bookingDocId){

  const changeRequest = prompt("Write what you want to change in your booking");
  if(!changeRequest) return;

  try{
    await updateDoc(doc(db, "bookings", bookingDocId), {
      customerChangeRequest: changeRequest,
      customerAction: "Change requested",
      customerActionAt: new Date().toISOString()
    });

    alert("Change request submitted");
    window.location.reload();

  }catch(error){
    alert(error.message);
  }

};

window.updateCustomerAddress = async function(bookingDocId){

  const newAddress = prompt("Enter your updated full address");
  if(!newAddress) return;

  const newPin = prompt("Enter updated PIN code");
  if(!newPin) return;

  try{
    await updateDoc(doc(db, "bookings", bookingDocId), {
      address: newAddress,
      pinCode: newPin,
      customerAction: "Address updated",
      customerActionAt: new Date().toISOString()
    });

    alert("Address updated successfully");
    window.location.reload();

  }catch(error){
    alert(error.message);
  }

};

window.loadProfilePage = async function(){

  const profileContainer = document.getElementById("profileContainer");
  if(!profileContainer) return;

  const userName = localStorage.getItem("umamtekUser");
  const userPhone = localStorage.getItem("umamtekPhone");

  if(!userPhone){
    profileContainer.innerHTML = `Please login first`;
    return;
  }

  try{

    const bookingsSnapshot = await getDocs(collection(db, "bookings"));
    let totalBookings = 0;

    bookingsSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if(data.userPhone === userPhone){
        totalBookings++;
      }
    });

    profileContainer.innerHTML = `
      <h2>${userName || "User"}</h2>
      <p><strong>Mobile:</strong> ${userPhone}</p>
      <p><strong>Total Bookings:</strong> ${totalBookings}</p>
      <button onclick="logoutUser()" class="primary-btn" style="margin-top:25px;">Logout</button>
    `;

  }catch(error){
    profileContainer.innerHTML = error.message;
  }

};

setTimeout(function(){
  if(document.getElementById("myBookingContainer")){
    window.loadMyBookings();
  }

  if(document.getElementById("profileContainer")){
    window.loadProfilePage();
  }
}, 1200);
