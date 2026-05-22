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

console.log("UMAMTEK firebase.js v503 loaded successfully");

/* =====================================================
   HELPERS
===================================================== */

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

function safeText(value){
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function calculateDistanceKmFallback(lat1, lng1, lat2, lng2){
  const R = 6371;
  const dLat = (Number(lat2) - Number(lat1)) * Math.PI / 180;
  const dLng = (Number(lng2) - Number(lng1)) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(Number(lat1) * Math.PI / 180) *
    Math.cos(Number(lat2) * Math.PI / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateTechnicianDistanceETAFallback(customerLat, customerLng, technicianLat, technicianLng){
  const distance = calculateDistanceKmFallback(
    customerLat,
    customerLng,
    technicianLat,
    technicianLng
  );

  return {
    distanceKm: distance.toFixed(2),
    etaMinutes: Math.ceil((distance / 20) * 60)
  };
}

function getTechnicianETAInfo(data){
  if(
    window.calculateTechnicianDistanceETA &&
    data.latitude &&
    data.longitude &&
    data.technicianLatitude &&
    data.technicianLongitude
  ){
    return window.calculateTechnicianDistanceETA(
      data.latitude,
      data.longitude,
      data.technicianLatitude,
      data.technicianLongitude
    );
  }

  if(
    data.latitude &&
    data.longitude &&
    data.technicianLatitude &&
    data.technicianLongitude
  ){
    return calculateTechnicianDistanceETAFallback(
      data.latitude,
      data.longitude,
      data.technicianLatitude,
      data.technicianLongitude
    );
  }

  return null;
}

function getBillBox(data){

  const products = Array.isArray(data.productsUsed) ? data.productsUsed : [];

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

      ${
        products.length > 0
        ? `
          <div style="margin-top:12px;">
            <p style="color:#111;font-weight:900;margin-bottom:6px;">Products Used:</p>
            ${
              products.map((item, index) => `
                <p style="color:#111;margin:5px 0;">
                  ${index + 1}. ${safeText(item.name)}
                  — Qty: ${item.qty || 1} ${safeText(item.unit)}
                  — Rate: ₹${item.rate || 60}
                  — Total: ₹${item.price || 0}
                  ${item.hsnSac ? `— HSN/SAC: ${safeText(item.hsnSac)}` : ""}
                </p>
              `).join("")
            }
          </div>

          <p style="color:#111;">
          <strong>Product Total:</strong> ₹${data.productTotal || 0}
          </p>
        `
        : `
          <p style="color:#111;">
          <strong>Product Total:</strong> ₹0
          </p>
        `
      }

      <p style="color:#111;font-size:18px;font-weight:900;">
      Total Payable: ₹${data.totalPayable || data.selectedPrice || 200}
      </p>

      <p style="color:#111;"><strong>Payment Mode:</strong> ${data.paymentMode || "Not Selected"}</p>

      <p style="color:#111;"><strong>Payment Status:</strong> ${data.paymentStatus || "Unpaid"}</p>

    </div>
  `;

}

/* =====================================================
   SIGNUP OTP
===================================================== */

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

/* =====================================================
   CREATE ACCOUNT
===================================================== */

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

/* =====================================================
   LOGIN
===================================================== */

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

/* =====================================================
   FORGOT PASSWORD
===================================================== */

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

/* =====================================================
   LOGOUT
===================================================== */

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

/* =====================================================
   CUSTOMER LIVE LOCATION
===================================================== */

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

      if(window.updateBillPreview){
        window.updateBillPreview();
      }

      if(window.updateTravelCharge){
        window.updateTravelCharge();
      }

    },

    function(){
      status.innerHTML = "❌ Location permission denied";
    }

  );

};

/* =====================================================
   SUBMIT BOOKING
===================================================== */

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

  const bookingSnapshot = await getDocs(collection(db, "bookings"));
  const nextBookingNumber = bookingSnapshot.size + 1;
  const bookingId = "AEA-" + String(nextBookingNumber).padStart(2, "0");

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
    paymentMode: paymentMode,
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
    window.location.href = "my-bookings.html";

  }catch(error){
    alert(error.message);
  }

};

/* =====================================================
   ADMIN LOAD BOOKINGS
===================================================== */

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

        <h3>${safeText(data.name) || "No Name"}</h3>

        <p><strong>Booking ID:</strong> ${data.bookingId || ""}</p>
        <p><strong>Booked On:</strong> ${data.bookingCreatedDate || ""} ${data.bookingCreatedTime || ""}</p>
        <p><strong>Customer Phone:</strong> ${data.phone || ""}</p>
        <p><strong>Login Phone:</strong> ${data.userPhone || ""}</p>
        <p><strong>Worker:</strong> ${data.workerType || ""}</p>
        <p><strong>Service:</strong> ${safeText(data.service)}</p>

        ${data.otherWorkDetails ? `
          <p><strong>Other Work:</strong> ${safeText(data.otherWorkDetails)}</p>
        ` : ""}

        <p><strong>Address:</strong> ${safeText(data.address)}</p>
        <p><strong>PIN Code:</strong> ${data.pinCode || ""}</p>

        <p>
          <strong>Location:</strong>
          <a href="${data.mapLink || "#"}" target="_blank">
            Open Google Map
          </a>
        </p>

        <p><strong>Expected Date:</strong> ${data.date || ""}</p>
        <p><strong>Expected Time:</strong> ${data.time || ""}</p>
        <p><strong>Details:</strong> ${safeText(data.details)}</p>

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

        ${data.assignedTechnicianName ? `
          <p><strong>Technician:</strong> ${safeText(data.assignedTechnicianName)}</p>
          <p><strong>Technician Phone:</strong> ${data.assignedTechnicianPhone || ""}</p>
        ` : `
          <p><strong>Technician:</strong> Not assigned</p>
        `}

        ${data.customerAction ? `
          <p><strong>Customer Action:</strong> ${safeText(data.customerAction)}</p>
        ` : ""}

        ${data.customerChangeRequest ? `
          <p><strong>Change Request:</strong> ${safeText(data.customerChangeRequest)}</p>
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

          <button onclick="generateInvoice('${bookingDocId}')" style="padding:10px 16px;font-size:14px;">
            Generate Invoice
          </button>

          <button onclick="updateTechnicianLocation('${bookingDocId}')" style="padding:10px 16px;font-size:14px;">
            Update My Location
          </button>

          <button onclick="assignTechnician('${bookingDocId}')" style="padding:10px 16px;font-size:14px;">
            Assign Technician
          </button>

          <button onclick="setTechnicianETA('${bookingDocId}')" style="padding:10px 16px;font-size:14px;">
            Set ETA
          </button>

          <button onclick="showProductAddBox('${bookingDocId}')">
          Add Product
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
            <option value="Verified" ${data.status === "Verified" ? "selected" : ""}>Verified</option>
            <option value="Accepted" ${data.status === "Accepted" ? "selected" : ""}>Accepted</option>
            <option value="On The Way" ${data.status === "On The Way" ? "selected" : ""}>On The Way</option>
            <option value="Work Started" ${data.status === "Work Started" ? "selected" : ""}>Work Started</option>
            <option value="Completed" ${data.status === "Completed" ? "selected" : ""}>Completed</option>
            <option value="Cancelled" ${data.status === "Cancelled" ? "selected" : ""}>Cancelled</option>

          </select>

        </div>

      </div>

      `;

    });

  }catch(error){
    console.error(error);
    bookingContainer.innerHTML = `<p>${error.message}</p>`;
  }

};

/* =====================================================
   CUSTOMER MY BOOKINGS
===================================================== */

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
    let customerNotifications = [];

    querySnapshot.forEach((docSnap) => {

      const bookingDocId = docSnap.id;
      const data = docSnap.data();

      if(data.userPhone !== userPhone){
        return;
      }

      customerNotifications.push({
        bookingId: data.bookingId || "Booking",
        status: data.status || "Pending",
        technician: data.assignedTechnicianName || "",
        eta: data.technicianETA || "",
        paymentStatus: data.paymentStatus || "Unpaid"
      });

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
          <p style="color:#111;"><strong>Name:</strong> ${safeText(data.assignedTechnicianName)}</p>
          <p style="color:#111;"><strong>Phone:</strong> ${data.assignedTechnicianPhone || ""}</p>
          <p style="color:#111;"><strong>Skill:</strong> ${safeText(data.assignedTechnicianSkill)}</p>
          <p style="color:#111;"><strong>Area:</strong> ${safeText(data.assignedTechnicianArea)}</p>
        </div>
      ` : `
        <p style="margin-top:15px;font-weight:700;">Technician not assigned yet</p>
      `;

      const liveInfo = getTechnicianETAInfo(data);

      const liveDistanceBox = liveInfo ? `
        <div style="
        margin-top:15px;
        padding:16px;
        border-radius:16px;
        background:#111;
        color:#fff;
        border:2px solid #f5b301;
        box-shadow:0 15px 35px rgba(0,0,0,0.25);
        ">

          <h3 style="color:#f5b301;margin-bottom:10px;">
          🚗 Technician Live Tracking
          </h3>

          <p style="color:#fff;">
          Technician is approx <strong>${liveInfo.distanceKm} km</strong> away from your location.
          </p>

          <p style="color:#fff;">
          Estimated Arrival: <strong>${liveInfo.etaMinutes} mins</strong>
          </p>

          <a
          href="https://www.google.com/maps/dir/${data.technicianLatitude},${data.technicianLongitude}/${data.latitude},${data.longitude}"
          target="_blank"
          class="primary-btn"
          style="display:inline-block;margin-top:12px;text-decoration:none;">
          Open Live Route Map 🗺️
          </a>

          <p style="color:#ccc;font-size:13px;">
          ETA is estimated based on live location. Road traffic ETA will be added later.
          </p>

        </div>
      ` : "";

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
          <p><strong>Worker:</strong> ${data.workerType || ""}</p>
          <p><strong>Service:</strong> ${safeText(data.service)}</p>

          ${data.otherWorkDetails ? `
            <p><strong>Other Work:</strong> ${safeText(data.otherWorkDetails)}</p>
          ` : ""}

          <p><strong>Address:</strong> ${safeText(data.address)}</p>
          <p><strong>PIN Code:</strong> ${data.pinCode || ""}</p>
          <p><strong>Expected Visit:</strong> ${data.date || ""} ${data.time || ""}</p>
          <p><strong>Details:</strong> ${safeText(data.details)}</p>

          ${getBillBox(data)}

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
          ${liveDistanceBox}
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

    localStorage.setItem(
      "umamtekNotifications",
      JSON.stringify(customerNotifications)
    );

    localStorage.setItem(
      "umamtekNotificationCount",
      customerNotifications.length
    );

    const notificationCount =
    document.getElementById("notificationCount");

    if(notificationCount){
      notificationCount.innerText = customerNotifications.length;
    }

  }catch(error){

    console.error(error);
    activeBox.innerHTML = `<div class="card">${error.message}</div>`;
    completedBox.innerHTML = "";
    cancelledBox.innerHTML = "";

  }

};

/* =====================================================
   STATUS / LOCATION / CUSTOMER ACTIONS
===================================================== */

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
      window.location.reload();

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

/* =====================================================
   PROFILE PAGE
===================================================== */

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
      <h2>${safeText(userName) || "User"}</h2>
      <p><strong>Mobile:</strong> ${userPhone}</p>
      <p><strong>Total Bookings:</strong> ${totalBookings}</p>
      <button onclick="logoutUser()" class="primary-btn" style="margin-top:25px;">Logout</button>
    `;

  }catch(error){
    profileContainer.innerHTML = error.message;
  }

};

/* =====================================================
   ASSIGN TECHNICIAN
===================================================== */

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

      staffList.push(staff);

      message +=
      index + ". " +
      (staff.name || "") + " - " +
      (staff.skill || "") + " - " +
      (staff.area || "") + " - " +
      (staff.status || "") + " - " +
      (staff.phone || "") + "\n";

      index++;

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
      selectedStaff.name || "",

      assignedTechnicianPhone:
      selectedStaff.phone || "",

      assignedTechnicianSkill:
      selectedStaff.skill || "",

      assignedTechnicianArea:
      selectedStaff.area || "",

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

/* =====================================================
   STAFF PANEL
===================================================== */

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

    const staffPhone = cleanPhone(localStorage.getItem("umamtekStaffPhone"));

    querySnapshot.forEach((docSnap) => {

      const bookingDocId = docSnap.id;
      const data = docSnap.data();

      const assignedPhone = cleanPhone(data.assignedTechnicianPhone);

      if(assignedPhone && assignedPhone === staffPhone){

        total++;

        const isDone =
        data.status === "Completed" ||
        data.status === "Cancelled" ||
        data.status === "Rejected by Technician";

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

          <p><strong>Customer:</strong> ${safeText(data.name)}</p>
          <p><strong>Phone:</strong> ${data.phone || ""}</p>
          <p><strong>Worker:</strong> ${data.workerType || ""}</p>
          <p><strong>Service:</strong> ${safeText(data.service)}</p>

          ${data.otherWorkDetails ? `
            <p><strong>Other Work:</strong> ${safeText(data.otherWorkDetails)}</p>
          ` : ""}

          <p><strong>Address:</strong> ${safeText(data.address)}</p>
          <p><strong>PIN:</strong> ${data.pinCode || ""}</p>
          <p><strong>Visit:</strong> ${data.date || ""} ${data.time || ""}</p>
          <p><strong>Details:</strong> ${safeText(data.details)}</p>

          ${getBillBox(data)}

          <div class="action-row" style="display:flex;gap:10px;flex-wrap:wrap;margin-top:15px;">

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

            <button onclick="showProductAddBox('${bookingDocId}')">
            Add Product
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

    const totalJobs = document.getElementById("totalJobs");
    const activeJobs = document.getElementById("activeJobs");
    const completedJobs = document.getElementById("completedJobs");

    if(totalJobs) totalJobs.innerText = total;
    if(activeJobs) activeJobs.innerText = active;
    if(completedJobs) completedJobs.innerText = completed;

    if(active === 0){
      activeBox.innerHTML = `<div class="card">No active jobs</div>`;
    }

    if(completed === 0){
      historyBox.innerHTML = `<div class="card">No completed history</div>`;
    }

  }catch(error){

    console.error(error);
    activeBox.innerHTML = `<div class="card">${error.message}</div>`;
    historyBox.innerHTML = `<div class="card">${error.message}</div>`;

  }

};

/* =====================================================
   OFFICIAL PANEL
===================================================== */

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
        status === "Verified" ||
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

        <p><strong>Customer:</strong> ${safeText(data.name)}</p>
        <p><strong>Phone:</strong> ${data.phone || ""}</p>
        <p><strong>Login Phone:</strong> ${data.userPhone || ""}</p>
        <p><strong>Worker:</strong> ${data.workerType || ""}</p>
        <p><strong>Service:</strong> ${safeText(data.service)}</p>

        ${data.otherWorkDetails ? `
          <p><strong>Other Work:</strong> ${safeText(data.otherWorkDetails)}</p>
        ` : ""}

        <p><strong>Address:</strong> ${safeText(data.address)}</p>
        <p><strong>PIN:</strong> ${data.pinCode || ""}</p>
        <p><strong>Expected Visit:</strong> ${data.date || ""} ${data.time || ""}</p>
        <p><strong>Details:</strong> ${safeText(data.details)}</p>

        ${getBillBox(data)}

        ${data.assignedTechnicianName ? `
        <p><strong>Technician:</strong> ${safeText(data.assignedTechnicianName)}</p>
        <p><strong>Technician Phone:</strong> ${data.assignedTechnicianPhone || ""}</p>
        ` : `
        <p><strong>Technician:</strong> Not assigned</p>
        `}

        ${data.technicianETA ? `
        <p><strong>ETA:</strong> ${data.technicianETA} mins</p>
        ` : ""}

        ${data.customerAction ? `
        <p><strong>Customer Action:</strong> ${safeText(data.customerAction)}</p>
        ` : ""}

        ${data.customerChangeRequest ? `
        <p><strong>Change Request:</strong> ${safeText(data.customerChangeRequest)}</p>
        ` : ""}

        <div class="official-actions" style="display:flex;gap:10px;flex-wrap:wrap;margin-top:15px;">

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

          <button onclick="showProductAddBox('${bookingDocId}')">
          Add Product
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

    const officialTotal = document.getElementById("officialTotal");
    const officialPending = document.getElementById("officialPending");
    const officialActive = document.getElementById("officialActive");
    const officialCompleted = document.getElementById("officialCompleted");

    if(officialTotal) officialTotal.innerText = total;
    if(officialPending) officialPending.innerText = pending;
    if(officialActive) officialActive.innerText = active;
    if(officialCompleted) officialCompleted.innerText = completed;

    if(container.innerHTML.trim() === ""){
      container.innerHTML = `<div class="card">No active bookings</div>`;
    }

    if(history.innerHTML.trim() === ""){
      history.innerHTML = `<div class="card">No completed history</div>`;
    }

  }catch(error){

    console.error(error);
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

/* =====================================================
   INVOICE
===================================================== */

window.generateInvoice = async function(bookingDocId){

  try{

    const bookingRef = doc(db, "bookings", bookingDocId);
    const bookingSnap = await getDoc(bookingRef);

    if(!bookingSnap.exists()){
      alert("Booking not found");
      return;
    }

    const data = bookingSnap.data();
    const products = Array.isArray(data.productsUsed) ? data.productsUsed : [];

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
            max-width:850px;
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
            gap:20px;
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
            vertical-align:top;
          }
          th{
            background:#fff4c8;
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
          @media print{
            .btn{
              display:none;
            }
          }
        </style>
      </head>

      <body>

      <div class="invoice-box">

        <div class="header">

          <div style="display:flex;align-items:center;gap:15px;">
            <img src="logo.png" style="width:110px;height:70px;object-fit:contain;">
            <div>
              <h1>UMAMTEK</h1>
              <p>Your Project Our Priority</p>
              <p style="font-size:13px;margin-top:5px;">
                Bhagalpur, Bihar | Phone: 9065760751
              </p>
            </div>
          </div>

          <div style="text-align:right;">
            <strong>Service Invoice</strong><br>
            Booking ID: ${data.bookingId || ""}<br>
            Invoice Date: ${new Date().toLocaleDateString("en-GB")}<br>
            Payment Status: ${data.paymentStatus || "Unpaid"}
          </div>

        </div>

        <h3>Customer Details</h3>
        <p><strong>Name:</strong> ${safeText(data.name)}</p>
        <p><strong>Phone:</strong> ${data.phone || ""}</p>
        <p><strong>Address:</strong> ${safeText(data.address)}</p>
        <p><strong>PIN:</strong> ${data.pinCode || ""}</p>

        <h3>Service Details</h3>

        <table>
          <tr>
            <th>Description</th>
            <th>Amount</th>
          </tr>

          <tr>
            <td>Service: ${safeText(data.service)}</td>
            <td>₹${data.selectedPrice || data.offerRate || 200}</td>
          </tr>

          <tr>
            <td>Real / Market Rate</td>
            <td><del>₹${data.realRate || 450}</del></td>
          </tr>

          <tr>
            <td>UMAMTEK Offer Rate</td>
            <td>₹${data.offerRate || 200}</td>
          </tr>

          <tr>
            <td>Distance from UMAMTEK Base</td>
            <td>${data.distanceKm || "0"} km approx</td>
          </tr>

          <tr>
            <td>Travel Charge</td>
            <td>₹${data.travelCharge || 0}</td>
          </tr>

          ${
            products.length > 0
            ? products.map((item, index) => `
              <tr>
                <td>
                  Product ${index + 1}: ${safeText(item.name)}
                  <br>
                  Qty: ${item.qty || 1} ${safeText(item.unit)}
                  <br>
                  Rate: ₹${item.rate || 60}
                  <br>
                  HSN/SAC: ${safeText(item.hsnSac)}
                  <br>
                  GST: ${item.gstPercent || 18}% Included
                </td>
                <td>₹${item.price || 0}</td>
              </tr>
            `).join("")
            : `
              <tr>
                <td>Products Used</td>
                <td>₹0</td>
              </tr>
            `
          }

          <tr>
            <td>Product Total</td>
            <td>₹${data.productTotal || 0}</td>
          </tr>

          <tr>
            <td>Payment Mode</td>
            <td>${data.paymentMode || "Not Selected"}</td>
          </tr>

          <tr>
            <td>Payment Status</td>
            <td>${data.paymentStatus || "Unpaid"}</td>
          </tr>

          <tr>
            <td>Status</td>
            <td>${data.status || "Pending"}</td>
          </tr>

          <tr>
            <td>Technician</td>
            <td>${safeText(data.assignedTechnicianName) || "Not assigned"}</td>
          </tr>
        </table>

        <p class="total">Total Amount: ₹${data.totalPayable || data.selectedPrice || 200}</p>

        <p style="margin-top:30px;">
        Note: Thank you for choosing UMAMTEK. This invoice includes service charge, product/material charges, travel charge and payment status as per booking record.
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

/* =====================================================
   REVIEW
===================================================== */

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

/* =====================================================
   STAFF REGISTRY
===================================================== */

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

        <h3>${safeText(data.name)}</h3>

        <p><strong>Phone:</strong> ${data.phone || ""}</p>
        <p><strong>Skill:</strong> ${safeText(data.skill)}</p>
        <p><strong>Area:</strong> ${safeText(data.area)}</p>
        <p><strong>Status:</strong> ${safeText(data.status)}</p>

      </div>
      `;

    });

  }catch(error){
    console.error(error);
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

/* =====================================================
   PRODUCT REGISTRY
===================================================== */

window.addProductItem = async function(event){

  event.preventDefault();

  const name = document.getElementById("productName")?.value.trim() || "";
  const category = document.getElementById("productCategory")?.value || "";
  const unit = document.getElementById("productUnit")?.value.trim() || "pcs";
  const price = Number(document.getElementById("productPrice")?.value || 60);
  const hsnSac = document.getElementById("productHsnSac")?.value.trim() || "";
  const gst = document.getElementById("productGst")?.value || "18";
  const stock = Number(document.getElementById("productStock")?.value || 0);
  const description = document.getElementById("productDescription")?.value.trim() || "";
  const status = document.getElementById("productStatus")?.value || "Available";

  if(!name || !category || !unit || !price){
    alert("Please fill all required product details");
    return;
  }

  try{

    const productId =
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

    await setDoc(doc(db, "products", productId), {
      productId: productId,
      brand: "Anchor Penta",
      name: name,
      category: category,
      unit: unit,
      price: price,
      hsnSac: hsnSac,
      gstIncluded: true,
      gstPercent: gst,
      stock: stock,
      description: description,
      status: status,
      createdAt: new Date().toISOString()
    });

    alert("Product added successfully");

    window.location.reload();

  }catch(error){
    alert(error.message);
  }

};

window.loadProductRegistry = async function(){

  const container = document.getElementById("productRegistryContainer");

  if(!container){
    return;
  }

  container.innerHTML = `<div class="card">Loading products...</div>`;

  try{

    const querySnapshot = await getDocs(collection(db, "products"));

    container.innerHTML = "";

    if(querySnapshot.empty){
      container.innerHTML = `<div class="card">No products added yet</div>`;
      return;
    }

    querySnapshot.forEach((docSnap) => {

      const data = docSnap.data();

      container.innerHTML += `
      <div class="card">

        <h3>${safeText(data.name)}</h3>

        <p><strong>Brand:</strong> ${safeText(data.brand) || "Anchor Penta"}</p>
        <p><strong>Category:</strong> ${safeText(data.category)}</p>
        <p><strong>Unit:</strong> ${safeText(data.unit)}</p>
        <p><strong>Price:</strong> ₹${data.price || 0}</p>
        <p><strong>GST:</strong> ${data.gstPercent || 18}% Included</p>
        <p><strong>HSN/SAC:</strong> ${safeText(data.hsnSac)}</p>
        <p><strong>Stock:</strong> ${data.stock || 0}</p>
        <p><strong>Status:</strong> ${safeText(data.status)}</p>

        ${data.description ? `
        <p><strong>Details:</strong> ${safeText(data.description)}</p>
        ` : ""}

      </div>
      `;

    });

  }catch(error){
    console.error(error);
    container.innerHTML = `<div class="card">${error.message}</div>`;
  }

};

/* =====================================================
   SEARCH PRODUCT AND ADD TO BOOKING
===================================================== */

window.searchAndAddProductToBooking = async function(bookingDocId){

  const searchText = prompt("Enter product name to search");

  if(!searchText){
    return;
  }

  try{

    const productSnapshot = await getDocs(collection(db, "products"));

    let matchedProducts = [];

    productSnapshot.forEach((docSnap) => {

      const product = docSnap.data();

      if(
        product.name &&
        product.name.toLowerCase().includes(searchText.toLowerCase()) &&
        product.status !== "Hidden"
      ){
        matchedProducts.push(product);
      }

    });

    if(matchedProducts.length === 0){
      alert("No product found. Please add product in Product Registry first.");
      return;
    }

    let message = "Select product number:\n\n";

    matchedProducts.slice(0, 20).forEach((item, index) => {
      message +=
      `${index + 1}. ${item.name} | ₹${item.price || 60} | HSN/SAC: ${item.hsnSac || ""}\n`;
    });

    const selectedNumber = prompt(message);

    if(!selectedNumber){
      return;
    }

    const selectedProduct = matchedProducts[Number(selectedNumber) - 1];

    if(!selectedProduct){
      alert("Invalid product selected");
      return;
    }

    const qtyInput = prompt(
      `Enter quantity for ${selectedProduct.name}\nUnit: ${selectedProduct.unit || "pcs"}`
    );

    if(!qtyInput){
      return;
    }

    const qty = Number(qtyInput);

    if(!qty || qty <= 0){
      alert("Please enter valid quantity");
      return;
    }

    const productRate = Number(selectedProduct.price || 60);
    const productTotalAmount = productRate * qty;

    const bookingRef = doc(db, "bookings", bookingDocId);
    const bookingSnap = await getDoc(bookingRef);

    if(!bookingSnap.exists()){
      alert("Booking not found");
      return;
    }

    const bookingData = bookingSnap.data();

    const oldProducts = Array.isArray(bookingData.productsUsed)
    ? bookingData.productsUsed
    : [];

    const newProduct = {
      productId: selectedProduct.productId || "",
      brand: selectedProduct.brand || "Anchor Penta",
      name: selectedProduct.name || "",
      category: selectedProduct.category || "",
      hsnSac: selectedProduct.hsnSac || "",
      gstIncluded: true,
      gstPercent: selectedProduct.gstPercent || 18,
      unit: selectedProduct.unit || "pcs",
      qty: qty,
      rate: productRate,
      price: productTotalAmount,
      addedAt: new Date().toISOString()
    };

    const updatedProducts = [...oldProducts, newProduct];

    const productTotal = updatedProducts.reduce((sum, item) => {
      return sum + Number(item.price || 0);
    }, 0);

    const serviceCharge = Number(bookingData.selectedPrice || bookingData.offerRate || 200);
    const travelCharge = Number(bookingData.travelCharge || 0);

    const finalTotal = serviceCharge + travelCharge + productTotal;

    await updateDoc(bookingRef, {
      productsUsed: updatedProducts,
      productTotal: productTotal,
      totalPayable: finalTotal,
      invoiceStatus: "Updated",
      billUpdatedAt: new Date().toISOString()
    });

    alert(
      `Product added successfully\n\n${selectedProduct.name}\nQty: ${qty}\nAmount: ₹${productTotalAmount}\n\nNew Total: ₹${finalTotal}`
    );

    window.location.reload();

  }catch(error){

    alert(error.message);

  }

};

/* =====================================================
   AUTO PAGE LOADER
===================================================== */

window.umamtekAutoLoad = function(){

  try{

    if(document.getElementById("bookingContainer") && window.loadBookings){
      window.loadBookings();
    }

    if(document.getElementById("activeBookingContainer") && window.loadMyBookings){
      window.loadMyBookings();
    }

    if(document.getElementById("profileContainer") && window.loadProfilePage){
      window.loadProfilePage();
    }

    if(document.getElementById("staffBookingContainer") && window.loadStaffBookings){
      window.loadStaffBookings();
    }

    if(document.getElementById("officialBookingContainer") && window.loadOfficialPanel){
      window.loadOfficialPanel();
    }

    if(document.getElementById("staffRegistryContainer") && window.loadStaffRegistry){
      window.loadStaffRegistry();
    }

    if(document.getElementById("productRegistryContainer") && window.loadProductRegistry){
      window.loadProductRegistry();
    }

  }catch(error){
    console.error("UMAMTEK auto load error:", error);
  }

};

setTimeout(window.umamtekAutoLoad, 1200);
