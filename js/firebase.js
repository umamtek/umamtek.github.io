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

function getBillBox(data){

  return `
    <div style="
    margin-top:15px;
    padding:15px;
    border-radius:14px;
    background:#fff8d6;
    border:2px solid #f5b301;
    color:#111;
    ">

      <h3 style="color:#111;margin-bottom:10px;">
      Bill Details
      </h3>

      <p style="color:#111;"><strong>Real Rate:</strong> <del>₹${data.realRate || 450}</del></p>

      <p style="color:#111;"><strong>UMAMTEK Offer:</strong> ₹${data.offerRate || data.selectedPrice || 200}</p>

      <p style="color:#111;"><strong>Distance:</strong> ${data.distanceKm || "0"} km approx</p>

      <p style="color:#111;"><strong>Travel Charge:</strong> ₹${data.travelCharge || 0}</p>

      <p style="
      color:#111;
      font-size:18px;
      font-weight:900;
      ">
      Total Payable: ₹${data.totalPayable || data.selectedPrice || 200}
      </p>

      <p style="color:#111;"><strong>Payment Mode:</strong> ${data.paymentMode || "Not Selected"}</p>

      <p style="color:#111;"><strong>Payment Status:</strong> ${data.paymentStatus || "Unpaid"}</p>

    </div>
  `;

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
      updateBillPreview();
      updateTravelCharge();

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

  const paymentMode = document.getElementById("paymentMode")?.value;

if(!paymentMode){
  alert("Please select payment mode: Pay Now or Pay After Work");
  return;
}

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
    workerType: document.getElementById("bookingWorker")?.value || "",
    service: document.getElementById("bookingService")?.value || "",
    otherWorkDetails: document.getElementById("otherWorkDetails")?.value.trim() || "",
realRate: 450,
offerRate: 200,
selectedPrice: 200,
    travelCharge: document.getElementById("travelCharge")?.value || "0",
    distanceKm: document.getElementById("distanceKm")?.value || "",
totalPayable: document.getElementById("totalPayable")?.value || "200",
paymentMode: document.getElementById("paymentMode")?.value || "Not Selected",
    paymentStatus: "Unpaid",
invoiceStatus: "Not Available",
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
        ${getBillBox(data)}

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
onclick="generateInvoice('${bookingDocId}')"
style="padding:10px 16px;font-size:14px;">
Generate Invoice
</button>

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

<button
onclick="setTechnicianETA('${bookingDocId}')"
style="padding:10px 16px;font-size:14px;">
Set ETA
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

  const activeBox = document.getElementById("activeBookingContainer");
  const completedBox = document.getElementById("completedBookingContainer");
  const cancelledBox = document.getElementById("cancelledBookingContainer");

  if(!activeBox || !completedBox || !cancelledBox){
    return;
  }

  const userPhone = localStorage.getItem("umamtekPhone");

  if(!userPhone){
    activeBox.innerHTML = `<div class="card">Please login first</div>`;
    completedBox.innerHTML = "";
    cancelledBox.innerHTML = "";
    return;
  }

  activeBox.innerHTML = `<div class="card">Loading active bookings...</div>`;
  completedBox.innerHTML = `<div class="card">Loading completed history...</div>`;
  cancelledBox.innerHTML = `<div class="card">Loading cancelled bookings...</div>`;

  try{

    const querySnapshot = await getDocs(collection(db, "bookings"));

    activeBox.innerHTML = "";
    completedBox.innerHTML = "";
    cancelledBox.innerHTML = "";

    let activeFound = false;
    let completedFound = false;
    let cancelledFound = false;

    querySnapshot.forEach((docSnap) => {

      const bookingDocId = docSnap.id;
      const data = docSnap.data();

      if(data.userPhone !== userPhone){
        return;
      }

      const canEdit =
      data.editableUntil && new Date(data.editableUntil) > new Date();

      const technicianBox = data.assignedTechnicianName ? `
        <div style="
        margin-top:15px;
        padding:15px;
        border-radius:14px;
        background:#fff8d6;
        border:2px solid #f5b301;
        color:#111;
        ">
          <h3 style="margin-bottom:8px;color:#111;">Assigned Technician</h3>
          <p style="color:#111;"><strong>Name:</strong> ${data.assignedTechnicianName}</p>
          <p style="color:#111;"><strong>Phone:</strong> ${data.assignedTechnicianPhone || ""}</p>
        </div>
      ` : `
        <p style="margin-top:15px;font-weight:700;">Technician not assigned yet</p>
      `;

      const etaBox = data.technicianETA ? `
        <div style="
        margin-top:15px;
        padding:14px 18px;
        border-radius:14px;
        background:#111;
        color:#fff;
        font-weight:800;
        display:inline-block;
        ">
        🚗 Technician arriving in ${data.technicianETA} mins
        </div>
      ` : "";

      const actionBox = canEdit ? `
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:15px;">
          <button onclick="requestBookingChange('${bookingDocId}')">Request Change</button>
          <button onclick="updateCustomerAddress('${bookingDocId}')">Update Address</button>
          <button onclick="cancelCustomerBooking('${bookingDocId}')">Cancel Booking</button>
        </div>
        <p style="margin-top:10px;font-size:13px;font-weight:700;color:#d60000;">
        You can edit this booking for 180 seconds after booking.
        </p>
      ` : `
        <p style="margin-top:15px;font-size:13px;font-weight:700;">Edit window closed.</p>
      `;

      const reviewButton = data.status === "Completed" ? `
        <a href="review.html" class="primary-btn" style="display:inline-block;margin-top:15px;text-decoration:none;">
        Give Review ⭐
        </a>
      ` : "";

      const invoiceButton =
(data.status === "Completed" && data.paymentStatus === "Paid") ? `
  <button onclick="generateInvoice('${bookingDocId}')" style="margin-top:15px;">
  Download Invoice
  </button>
` : `
  <p style="margin-top:15px;font-weight:700;">
  Invoice will be available after service completion and payment confirmation.
  </p>
`;

      const card = `
        <div class="card">

          <h2 style="margin-bottom:15px;">${data.bookingId || "Booking"}</h2>

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
            <div class="timeline-step ${data.status === "Work Started" ? "active" : ""}">Work Started</div>
            <div class="timeline-step ${data.status === "Completed" ? "active" : ""}">Completed</div>
          </div>

          <p>
            <strong>Status:</strong>
            <span style="background:#f5b301;color:#111;padding:6px 12px;border-radius:10px;font-weight:700;">
              ${data.status || "Pending"}
            </span>
          </p>

          ${technicianBox}
          ${etaBox}

          <a href="${data.mapLink || "#"}" target="_blank" class="primary-btn" style="display:inline-block;margin-top:15px;text-decoration:none;">
          Open Live Location
          </a>

          ${
            data.technicianMapLink
            ? `<a href="${data.technicianMapLink}" target="_blank" class="primary-btn" style="display:inline-block;margin-top:15px;margin-left:10px;text-decoration:none;">Track Technician 🚗</a>`
            : `<p style="margin-top:15px;font-weight:700;">Technician tracking not started yet</p>`
          }

          ${actionBox}
          ${reviewButton}
          ${invoiceButton}

        </div>
      `;

      if(data.status === "Completed"){
        completedFound = true;
        completedBox.innerHTML += card;
      }else if(data.status === "Cancelled" || data.status === "Rejected by Technician"){
        cancelledFound = true;
        cancelledBox.innerHTML += card;
      }else{
        activeFound = true;
        activeBox.innerHTML += card;
      }

    });

    if(!activeFound){
      activeBox.innerHTML = `<div class="card">No active bookings</div>`;
    }

    if(!completedFound){
      completedBox.innerHTML = `<div class="card">No completed history</div>`;
    }

    if(!cancelledFound){
      cancelledBox.innerHTML = `<div class="card">No cancelled bookings</div>`;
    }

  }catch(error){

    activeBox.innerHTML = `<div class="card">${error.message}</div>`;
    completedBox.innerHTML = "";
    cancelledBox.innerHTML = "";

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

  if(document.getElementById("activeBookingContainer")){
    window.loadMyBookings();
  }

  if(document.getElementById("profileContainer")){
    window.loadProfilePage();
  }

}, 1200);

window.assignTechnician = async function(bookingDocId){

  try{

    const staffSnapshot =
    await getDocs(collection(db, "staff"));

    if(staffSnapshot.empty){
      alert("No staff registered. Please add staff first.");
      window.location.href = "staff-registry.html";
      return;
    }

    let staffList = [];
    let message = "Select technician number:\n\n";

    let index = 1;

    staffSnapshot.forEach((docSnap) => {

      const staff = docSnap.data();

      if(staff.status === "Active" || staff.status === "Busy" || staff.status === "Offline"){

        staffList.push(staff);

        message +=
        index + ". " +
        staff.name + " - " +
        staff.skill + " - " +
        staff.area + " - " +
        staff.phone + "\n";

        index++;

      }

    });

    const selectedNumber =
    prompt(message);

    if(!selectedNumber){
      return;
    }

    const selectedStaff =
    staffList[Number(selectedNumber) - 1];

    if(!selectedStaff){
      alert("Invalid technician selected");
      return;
    }

    const bookingRef =
    doc(db, "bookings", bookingDocId);

    await updateDoc(bookingRef, {

      assignedTechnicianName:
      selectedStaff.name,

      assignedTechnicianPhone:
      selectedStaff.phone,

      assignedTechnicianSkill:
      selectedStaff.skill,

      assignedTechnicianArea:
      selectedStaff.area,

      assignedAt:
      new Date().toISOString(),

      status:
      "Accepted"

    });

    alert("Technician assigned successfully");

    window.location.reload();

  }catch(error){

    alert(error.message);

  }

};
window.setTechnicianETA = async function(bookingDocId){

  const etaMinutes =
  prompt("Enter technician arrival time in minutes");

  if(!etaMinutes){
    return;
  }

  try{

    const bookingRef =
    doc(db, "bookings", bookingDocId);

    await updateDoc(bookingRef, {

      technicianETA:
      etaMinutes,

      etaUpdatedAt:
      new Date().toISOString()

    });

    alert("ETA updated successfully");

    window.location.reload();

  }catch(error){

    alert(error.message);

  }

};

window.loadStaffBookings = async function(){

  const activeBox = document.getElementById("staffBookingContainer");
  const historyBox = document.getElementById("staffHistoryContainer");

  if(!activeBox || !historyBox) return;

  activeBox.innerHTML = `<div class="card">Loading active jobs...</div>`;
  historyBox.innerHTML = `<div class="card">Loading history...</div>`;

  try{

    const querySnapshot = await getDocs(collection(db, "bookings"));

    activeBox.innerHTML = "";
    historyBox.innerHTML = "";

    let total = 0;
    let active = 0;
    let completed = 0;

    querySnapshot.forEach((docSnap) => {

      const bookingDocId = docSnap.id;
      const data = docSnap.data();

      const staffPhone = localStorage.getItem("umamtekStaffPhone");

if(
  data.assignedTechnicianPhone &&
  data.assignedTechnicianPhone.replace(/\D/g, "") === staffPhone
){
        total++;

        const isDone = data.status === "Completed" || data.status === "Cancelled";

        if(isDone){
          completed++;
        }else{
          active++;
        }

        const whatsappPhone = cleanPhoneForWhatsApp(data.phone);

        const card = `
        <div class="card">

          <h3>${data.bookingId || "Job"}</h3>

          <span class="staff-badge">${data.status || "Pending"}</span>

          ${data.technicianETA ? `
          <p><strong>ETA:</strong> ${data.technicianETA} mins</p>
          ` : ""}

          <p><strong>Customer:</strong> ${data.name || ""}</p>
          <p><strong>Phone:</strong> ${data.phone || ""}</p>
          <p><strong>Service:</strong> ${data.service || ""}</p>
          <p><strong>Address:</strong> ${data.address || ""}</p>
          <p><strong>PIN:</strong> ${data.pinCode || ""}</p>
          <p><strong>Visit:</strong> ${data.date || ""} ${data.time || ""}</p>
          <p><strong>Details:</strong> ${data.details || ""}</p>

          <div class="action-row">

            <a href="${data.mapLink || "#"}" target="_blank" class="primary-btn">
            Navigate
            </a>

            <a href="tel:${data.phone || ""}" class="primary-btn">
            Call
            </a>

            <a href="https://wa.me/${whatsappPhone}" target="_blank" class="primary-btn">
            WhatsApp
            </a>

            <button onclick="updateBookingStatus('${bookingDocId}', 'Accepted')">
            Accept
            </button>

            <button onclick="updateBookingStatus('${bookingDocId}', 'Rejected by Technician')">
            Reject
            </button>

            <button onclick="updateTechnicianLocation('${bookingDocId}')">
            Update Location
            </button>

            <button onclick="updateBookingStatus('${bookingDocId}', 'On The Way')">
            On The Way
            </button>

            <button onclick="updateBookingStatus('${bookingDocId}', 'Work Started')">
            Start Work
            </button>

            <button onclick="markPaymentReceivedAndComplete('${bookingDocId}')">
Payment Received & Work Done
</button>

          </div>

        </div>
        `;

        if(isDone){
          historyBox.innerHTML += card;
        }else{
          activeBox.innerHTML += card;
        }

      }

    });

    document.getElementById("totalJobs").innerText = total;
    document.getElementById("activeJobs").innerText = active;
    document.getElementById("completedJobs").innerText = completed;

    if(active === 0){
      activeBox.innerHTML = `<div class="card">No active jobs</div>`;
    }

    if(completed === 0){
      historyBox.innerHTML = `<div class="card">No completed history</div>`;
    }

  }catch(error){

    activeBox.innerHTML = `<div class="card">${error.message}</div>`;
    historyBox.innerHTML = `<div class="card">${error.message}</div>`;

  }

};

window.loadOfficialPanel = async function(){

  const container = document.getElementById("officialBookingContainer");
  const history = document.getElementById("officialHistoryContainer");

  if(!container || !history) return;

  container.innerHTML = `<div class="card">Loading bookings...</div>`;
  history.innerHTML = `<div class="card">Loading history...</div>`;

  try{

    const querySnapshot = await getDocs(collection(db, "bookings"));

    container.innerHTML = "";
    history.innerHTML = "";

    let total = 0;
    let pending = 0;
    let active = 0;
    let completed = 0;

    querySnapshot.forEach((docSnap) => {

      const bookingDocId = docSnap.id;
      const data = docSnap.data();

      total++;

      const status = data.status || "Pending";

      if(status === "Pending") pending++;

      if(
        status === "Accepted" ||
        status === "On The Way" ||
        status === "Work Started"
      ){
        active++;
      }

      if(
        status === "Completed" ||
        status === "Cancelled" ||
        status === "Rejected by Technician" ||
        status === "Fake / Spam"
      ){
        completed++;
      }

      const whatsappPhone = cleanPhoneForWhatsApp(data.phone);

      const card = `
      <div class="card">

        <h3>${data.bookingId || "Booking"}</h3>

        <span class="official-badge">
        ${status}
        </span>

        ${data.priorityBooking ? `
        <span class="official-badge" style="background:#d60000;color:#fff;">
        PRIORITY
        </span>
        ` : ""}

        <p><strong>Customer:</strong> ${data.name || ""}</p>
        <p><strong>Phone:</strong> ${data.phone || ""}</p>
        <p><strong>Login Phone:</strong> ${data.userPhone || ""}</p>
        <p><strong>Service:</strong> ${data.service || ""}</p>
        <p><strong>Address:</strong> ${data.address || ""}</p>
        <p><strong>PIN:</strong> ${data.pinCode || ""}</p>
        <p><strong>Expected Visit:</strong> ${data.date || ""} ${data.time || ""}</p>
        <p><strong>Details:</strong> ${data.details || ""}</p>

        ${data.assignedTechnicianName ? `
        <p><strong>Technician:</strong> ${data.assignedTechnicianName}</p>
        <p><strong>Technician Phone:</strong> ${data.assignedTechnicianPhone || ""}</p>
        ` : `
        <p><strong>Technician:</strong> Not assigned</p>
        `}

        ${data.technicianETA ? `
        <p><strong>ETA:</strong> ${data.technicianETA} mins</p>
        ` : ""}

        ${data.customerAction ? `
        <p><strong>Customer Action:</strong> ${data.customerAction}</p>
        ` : ""}

        ${data.customerChangeRequest ? `
        <p><strong>Change Request:</strong> ${data.customerChangeRequest}</p>
        ` : ""}

        <div class="official-actions">

          <a href="tel:${data.phone || ""}" class="primary-btn">
          Call
          </a>

          <a href="https://wa.me/${whatsappPhone}" target="_blank" class="primary-btn">
          WhatsApp
          </a>

          <a href="${data.mapLink || "#"}" target="_blank" class="primary-btn">
          Map
          </a>

          <button onclick="updateBookingStatus('${bookingDocId}', 'Verified')">
          Verify
          </button>

          <button onclick="assignTechnician('${bookingDocId}')">
          Assign
          </button>

          <button onclick="setTechnicianETA('${bookingDocId}')">
          ETA
          </button>

          <button onclick="markPriorityBooking('${bookingDocId}')">
          Priority
          </button>

          <button onclick="updateBookingStatus('${bookingDocId}', 'Fake / Spam')">
          Reject Spam
          </button>

        </div>

      </div>
      `;

      if(
        status === "Completed" ||
        status === "Cancelled" ||
        status === "Rejected by Technician" ||
        status === "Fake / Spam"
      ){
        history.innerHTML += card;
      }else{
        container.innerHTML += card;
      }

    });

    document.getElementById("officialTotal").innerText = total;
    document.getElementById("officialPending").innerText = pending;
    document.getElementById("officialActive").innerText = active;
    document.getElementById("officialCompleted").innerText = completed;

    if(container.innerHTML.trim() === ""){
      container.innerHTML = `<div class="card">No active bookings</div>`;
    }

    if(history.innerHTML.trim() === ""){
      history.innerHTML = `<div class="card">No completed history</div>`;
    }

  }catch(error){

    container.innerHTML = `<div class="card">${error.message}</div>`;
    history.innerHTML = `<div class="card">${error.message}</div>`;

  }

};

window.markPriorityBooking = async function(bookingDocId){

  try{

    await updateDoc(doc(db, "bookings", bookingDocId), {
      priorityBooking: true,
      priorityFee: 49,
      priorityMarkedAt: new Date().toISOString()
    });

    alert("Booking marked as priority");

    window.location.reload();

  }catch(error){
    alert(error.message);
  }

};

window.generateInvoice = async function(bookingDocId){

  try{

    const bookingRef = doc(db, "bookings", bookingDocId);
    const bookingSnap = await getDoc(bookingRef);

    if(!bookingSnap.exists()){
      alert("Booking not found");
      return;
    }

    const data = bookingSnap.data();

    const invoiceWindow = window.open("", "_blank");

    invoiceWindow.document.write(`
      <html>
      <head>
        <title>UMAMTEK Invoice</title>
        <style>
          body{
            font-family:Arial, sans-serif;
            padding:30px;
            color:#111;
          }
          .invoice-box{
            max-width:800px;
            margin:auto;
            border:2px solid #111;
            padding:30px;
          }
          .header{
            display:flex;
            justify-content:space-between;
            border-bottom:2px solid #f5b301;
            padding-bottom:15px;
            margin-bottom:25px;
          }
          h1{
            color:#f5b301;
            margin:0;
          }
          table{
            width:100%;
            border-collapse:collapse;
            margin-top:20px;
          }
          td,th{
            border:1px solid #ddd;
            padding:12px;
            text-align:left;
          }
          .total{
            font-size:20px;
            font-weight:bold;
            text-align:right;
            margin-top:25px;
          }
          .btn{
            margin-top:25px;
            padding:12px 18px;
            background:#f5b301;
            border:none;
            font-weight:bold;
            cursor:pointer;
          }
        </style>
      </head>

      <body>

      <div class="invoice-box">

        <div class="header">
          <div>
            <h1>UMAMTEK</h1>
            <p>Your Project Our Priority</p>
          </div>
          <div>
            <strong>Invoice</strong><br>
            Booking ID: ${data.bookingId || ""}<br>
            Date: ${new Date().toLocaleDateString("en-GB")}
          </div>
        </div>

        <h3>Customer Details</h3>
        <p><strong>Name:</strong> ${data.name || ""}</p>
        <p><strong>Phone:</strong> ${data.phone || ""}</p>
        <p><strong>Address:</strong> ${data.address || ""}</p>
        <p><strong>PIN:</strong> ${data.pinCode || ""}</p>

        <h3>Service Details</h3>

        <table>
          <tr>
            <th>Service</th>
            <th>Status</th>
            <th>Technician</th>
            <th>Amount</th>
          </tr>

          <tr>
            <td>${data.service || ""}</td>
            <td>${data.status || "Pending"}</td>
            <td>${data.assignedTechnicianName || "Not assigned"}</td>
            <td>₹${data.totalPayable || data.selectedPrice || 200}</td>
          </tr>
        </table>

        <p class="total">Total Amount: ₹${data.totalPayable || data.selectedPrice || 200}</p>

        <p style="margin-top:30px;">
        Note: Final pricing will be updated after UMAMTEK rate card launch.
        </p>

        <button class="btn" onclick="window.print()">Print / Download PDF</button>

      </div>

      </body>
      </html>
    `);

    invoiceWindow.document.close();

  }catch(error){
    alert(error.message);
  }

};

window.submitReview = async function(event){

  event.preventDefault();

  const userPhone = localStorage.getItem("umamtekPhone");

  if(!userPhone){
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  const reviewData = {
    bookingId: document.getElementById("reviewBookingId").value.trim(),
    userPhone: userPhone,
    workQuality: document.getElementById("workQuality").value,
    timingRating: document.getElementById("timingRating").value,
    behaviourRating: document.getElementById("behaviourRating").value,
    overallRating: document.getElementById("overallRating").value,
    comment: document.getElementById("reviewComment").value.trim(),
    createdAt: new Date().toISOString()
  };

  if(!reviewData.bookingId || !reviewData.comment){
    alert("Please fill all review details");
    return;
  }

  try{

    await addDoc(collection(db, "reviews"), reviewData);

    alert("Thank you for your review");

    window.location.href = "my-bookings.html";

  }catch(error){

    alert(error.message);

  }

};

window.addStaffMember = async function(event){

  event.preventDefault();

  const name = document.getElementById("staffRegName").value.trim();
  const phone = document.getElementById("staffRegPhone").value.replace(/\D/g, "");
  const skill = document.getElementById("staffRegSkill").value;
  const area = document.getElementById("staffRegArea").value.trim();
  const status = document.getElementById("staffRegStatus").value;

  if(!name || !phone || !skill || !area){
    alert("Please fill all staff details");
    return;
  }

  if(phone.length !== 10){
    alert("Please enter valid 10 digit mobile number");
    return;
  }

  try{

    await setDoc(doc(db, "staff", phone), {
      name: name,
      phone: phone,
      skill: skill,
      area: area,
      status: status,
      createdAt: new Date().toISOString()
    });

    alert("Staff added successfully");

    window.location.reload();

  }catch(error){
    alert(error.message);
  }

};

window.loadStaffRegistry = async function(){

  const container = document.getElementById("staffRegistryContainer");

  if(!container){
    return;
  }

  container.innerHTML = `<div class="card">Loading staff...</div>`;

  try{

    const querySnapshot = await getDocs(collection(db, "staff"));

    container.innerHTML = "";

    if(querySnapshot.empty){
      container.innerHTML = `<div class="card">No staff registered yet</div>`;
      return;
    }

    querySnapshot.forEach((docSnap) => {

      const data = docSnap.data();

      container.innerHTML += `
      <div class="card">

        <h3>${data.name || ""}</h3>

        <p><strong>Phone:</strong> ${data.phone || ""}</p>
        <p><strong>Skill:</strong> ${data.skill || ""}</p>
        <p><strong>Area:</strong> ${data.area || ""}</p>
        <p><strong>Status:</strong> ${data.status || ""}</p>

      </div>
      `;

    });

  }catch(error){
    container.innerHTML = `<div class="card">${error.message}</div>`;
  }

};

window.markPaymentReceivedAndComplete = async function(bookingDocId){

  const confirmPayment =
  confirm("Confirm: Payment received and work completed?");

  if(!confirmPayment){
    return;
  }

  try{

    await updateDoc(doc(db, "bookings", bookingDocId), {
      status: "Completed",
      paymentStatus: "Paid",
      invoiceStatus: "Available",
      completedAt: new Date().toISOString(),
      paymentReceivedAt: new Date().toISOString()
    });

    alert("Work completed and payment marked as received");

    window.location.reload();

  }catch(error){

    alert(error.message);

  }

};
