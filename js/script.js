function toggleMenu(){
  const navLinks = document.getElementById("navLinks");
  navLinks.classList.toggle("active");
}

function toggleDarkMode(){
  document.body.classList.toggle("dark-mode");

  if(document.body.classList.contains("dark-mode")){
    localStorage.setItem("theme","dark");
  }else{
    localStorage.setItem("theme","light");
  }
}

function openQuotePopup(){
  document.getElementById("quotePopup").classList.add("active");
}

function closeQuotePopup(){
  document.getElementById("quotePopup").classList.remove("active");
}

function sendQuoteWhatsApp(){

  const name = document.getElementById("qName").value;
  const phone = document.getElementById("qPhone").value;
  const work = document.getElementById("qWork").value;
  const location = document.getElementById("qLocation").value;

  const message =
`Quotation Request

Name: ${name}
Phone: ${phone}
Work Type: ${work}
Location: ${location}`;

  const url =
`https://wa.me/919065760751?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank");
}

function sendContactForm(event){

  event.preventDefault();

  const name = document.getElementById("contactName").value;
  const phone = document.getElementById("contactPhone").value;
  const message = document.getElementById("contactMessage").value;

  const whatsappMessage =
`New Enquiry From Website

Name: ${name}
Phone: ${phone}

Message:
${message}`;

  const whatsappURL =
`https://wa.me/919065760751?text=${encodeURIComponent(whatsappMessage)}`;

  window.open(whatsappURL, "_blank");
}

function sendCareerForm(event){

  event.preventDefault();

  const name = document.getElementById("careerName").value;
  const phone = document.getElementById("careerPhone").value;
  const skill = document.getElementById("careerSkill").value;
  const experience = document.getElementById("careerExperience").value;

  const whatsappMessage =
`New Career Application

Name: ${name}
Phone: ${phone}
Skill: ${skill}
Experience: ${experience}`;

  const whatsappURL =
`https://wa.me/919065760751?text=${encodeURIComponent(whatsappMessage)}`;

  window.open(whatsappURL, "_blank");
}

function sendComplaintForm(event){

  event.preventDefault();

  const name = document.getElementById("complaintName").value;
  const phone = document.getElementById("complaintPhone").value;
  const complaint = document.getElementById("complaintMessage").value;

  const whatsappMessage =
`New Customer Complaint

Name: ${name}
Phone: ${phone}

Complaint:
${complaint}`;

  const whatsappURL =
`https://wa.me/919065760751?text=${encodeURIComponent(whatsappMessage)}`;

  window.open(whatsappURL, "_blank");
}

function updateLoginUI(){

  const navActions = document.querySelector(".nav-actions");
  const navLinks = document.getElementById("navLinks");

  if(!navActions || !navLinks){
    return;
  }

  if(localStorage.getItem("umamtekLoggedIn") === "true"){

    const allLinks = navLinks.querySelectorAll("a");

    allLinks.forEach(link => {
      if(link.getAttribute("href") === "login.html" || link.getAttribute("href") === "signup.html"){
        link.parentElement.style.display = "none";
      }
    });

    const userName = localStorage.getItem("umamtekUser") || "User";

    navActions.innerHTML = `
      <button class="dark-btn" onclick="toggleDarkMode()">🌙</button>
      <button class="notification-btn" onclick="toggleNotifications()">
🔔
<span id="notificationCount">0</span>
</button>

      <div class="profile-dropdown">
        <button class="profile-btn" onclick="toggleProfileDropdown()">
          Hi, ${userName} 👋 ▼
        </button>

        <div class="profile-menu" id="profileMenu">
         <a href="profile.html">My Profile</a>
         <a href="booking.html">Book Service</a>
         <a href="my-bookings.html">My Bookings</a>
         <button onclick="logoutUser()">Logout</button>
</div>
      </div>
    `;

  }

}

function toggleProfileDropdown(){
  const profileMenu = document.getElementById("profileMenu");
  profileMenu.classList.toggle("active");
}

function logoutUser(){

  localStorage.removeItem("umamtekLoggedIn");
  localStorage.removeItem("umamtekUser");
  localStorage.removeItem("umamtekPhone");
  localStorage.removeItem("umamtekRole");

  window.location.href = "login.html";
}

window.onload = function(){

  if(localStorage.getItem("theme") === "dark"){
    document.body.classList.add("dark-mode");
  }

  const loader = document.getElementById("loader");

  if(loader){
    setTimeout(() => {
      loader.classList.add("hide");
    }, 1200);
  }

  updateLoginUI();
};

function toggleNotifications(){

  const oldBox = document.getElementById("notificationBox");

  if(oldBox){
    oldBox.remove();
    return;
  }

  const box = document.createElement("div");

  box.id = "notificationBox";

  function toggleNotifications(){

  const oldBox = document.getElementById("notificationBox");

  if(oldBox){
    oldBox.remove();
    return;
  }

  const box = document.createElement("div");

  box.id = "notificationBox";

  box.innerHTML = `
    <div class="notification-panel">
      <h3>Notifications</h3>
      <p>🔔 Your booking updates will appear here.</p>
      <p>🚗 Track technician from My Bookings.</p>
      <p>✅ Check status updates anytime.</p>
    </div>
  `;

  document.body.appendChild(box);

}

  document.body.appendChild(box);

}

function toggleAIChat(){

  const box = document.getElementById("aiChatBox");

  if(box){
    box.classList.toggle("active");
  }

}

function aiReply(type){

  const chatBody = document.getElementById("aiChatBody");

  let reply = "";

  if(type === "electrician"){
    reply = "Electrician service ke liye aap house wiring, fault repair, switch board, meter related work ya emergency repair book kar sakte hain.";
  }

  if(type === "cctv"){
    reply = "CCTV installation ke liye UMAMTEK camera setup, DVR/NVR, wiring aur maintenance support provide karega.";
  }

  if(type === "wiring"){
    reply = "House wiring, commercial wiring, renovation wiring aur new construction electrical work ke liye booking kar sakte hain.";
  }

  if(type === "booking"){
    reply = "Service book karne ke liye Book Service page open karein. Login ke baad booking submit kar sakte hain.";
  }

  if(type === "contact"){
    reply = "UMAMTEK se contact karne ke liye WhatsApp ya Contact page use karein. Phone: 9065760751";
  }

  chatBody.innerHTML += `
    <p class="user-msg">${type}</p>
    <p class="bot-msg">${reply}</p>
  `;

  chatBody.scrollTop = chatBody.scrollHeight;

}

const umamtekWorks = {

  electrician: [
    "No electricity in house",
    "MCB trip problem",
    "Main switch problem",
    "Short circuit fault",
    "Earthing problem",
    "Low voltage issue",
    "High voltage issue",
    "Switch not working",
    "Socket not working",
    "Fan regulator problem",
    "Light point not working",
    "Tube light not working",
    "LED light not working",
    "Wire burning smell",
    "Loose connection",
    "Meter wire issue",
    "DB box fault",
    "Inverter wiring fault",
    "Geyser electrical fault",
    "Water pump electrical issue",
    "Ceiling fan not working",
    "AC power point issue",
    "CCTV power issue",
    "New switch installation",
    "New socket installation",
    "Fan installation",
    "LED light installation",
    "Doorbell installation",
    "Inverter installation",
    "MCB installation",
    "DB box installation",
    "House wiring",
    "Commercial wiring",
    "CCTV camera installation",
    "DVR/NVR installation",
    "CCTV wiring",
    "WiFi router setup",
    "Smart switch installation",
    "TV wall power point",
    "AC power point installation",
    "Stabilizer installation",
    "Other — Please specify"
  ],

  plumber: [
    "Tap leakage",
    "Kitchen sink leakage",
    "Bathroom leakage",
    "Pipe leakage",
    "Flush tank leakage",
    "Commode leakage",
    "Shower leakage",
    "Water tank overflow",
    "Low water pressure",
    "Blocked drain",
    "Blocked bathroom outlet",
    "Blocked kitchen sink",
    "Blocked toilet",
    "Bad smell from drain",
    "Water motor pipe issue",
    "Geyser pipe leakage",
    "Concealed pipe leakage checking",
    "PVC pipe repair",
    "Valve repair",
    "New tap installation",
    "Basin installation",
    "Kitchen sink installation",
    "Shower installation",
    "Jet spray installation",
    "Commode installation",
    "Flush tank installation",
    "Water tank connection",
    "Washing machine inlet/outlet",
    "RO water connection",
    "Bathroom accessories fitting",
    "PVC pipe installation",
    "Drain pipe installation",
    "Other — Please specify"
  ],

  mason: [
    "Wall repair",
    "Plaster repair",
    "Tile repair",
    "Floor repair",
    "Brick work",
    "Cement patch work",
    "Bathroom slope correction",
    "Door frame cement work",
    "Window frame cement work",
    "Small construction repair",
    "Roof patch repair",
    "Other — Please specify"
  ],

  labour: [
    "Material shifting",
    "Debris removal",
    "House shifting help",
    "Construction labour",
    "Cleaning after work",
    "Loading/unloading",
    "Furniture movement",
    "Cement/sand carrying",
    "Site helper",
    "Other — Please specify"
  ],

  painter: [
    "Wall painting",
    "Room painting",
    "Touch-up painting",
    "Putty work",
    "Primer work",
    "Door painting",
    "Window painting",
    "Grill painting",
    "Waterproof coating",
    "Damp wall treatment",
    "Texture paint",
    "Exterior painting",
    "Interior painting",
    "Other — Please specify"
  ],

  carpenter: [
    "Door repair",
    "Door lock fitting",
    "Furniture repair",
    "Bed repair",
    "Table repair",
    "Chair repair",
    "Wooden shelf fitting",
    "Cabinet repair",
    "Plywood work",
    "Drawer channel repair",
    "Handle fitting",
    "Hinge fitting",
    "Other — Please specify"
  ],

  foreman: [
    "Site visit",
    "Work inspection",
    "Labour supervision",
    "Material estimate",
    "Work quality checking",
    "Project planning visit",
    "Other — Please specify"
  ],

  supervisor: [
    "Site supervision",
    "Work progress checking",
    "Labour management",
    "Quality inspection",
    "Daily work reporting",
    "Other — Please specify"
  ],

  engineer: [
    "Electrical load inspection",
    "Wiring estimate",
    "Plumbing estimate",
    "Construction estimate",
    "Material estimate",
    "Safety inspection",
    "Project consultation",
    "Other — Please specify"
  ],

  welder: [
    "Grill repair",
    "Gate repair",
    "Iron rack repair",
    "Welding joint repair",
    "Window grill work",
    "Iron frame fitting",
    "Shed repair",
    "Railing repair",
    "Metal stand repair",
    "Other — Please specify"
  ],

  iti: [
    "Appliance checking",
    "Motor checking",
    "Pump checking",
    "Electrical device diagnosis",
    "CCTV troubleshooting",
    "Router setup",
    "Battery/inverter checking",
    "Technical inspection",
    "Other — Please specify"
  ],

  installer: [
    "Wall rack installation",
    "TV wall mount installation",
    "Curtain rod installation",
    "Mirror fitting",
    "Wall shelf installation",
    "Kitchen rack fitting",
    "Table wall fixing",
    "Photo frame fixing",
    "Clock wall fixing",
    "Name plate fitting",
    "Hooks fitting",
    "WiFi router wall mount",
    "Small cabinet fitting",
    "Other — Please specify"
  ],

  not_sure: [
    "Need another worker / Not sure — Please specify"
  ]

};

let currentWorkList = [];

function loadWorkOptions(){

  const worker = document.getElementById("bookingWorker").value;
  const serviceSelect = document.getElementById("bookingService");
  const searchBox = document.getElementById("workSearch");
  const otherBox = document.getElementById("otherWorkDetails");
  const pricePreview = document.getElementById("pricePreview");

  serviceSelect.innerHTML = `<option value="">Select Your Work</option>`;
  otherBox.style.display = "none";
  otherBox.required = false;
  pricePreview.style.display = "none";

  if(!worker){
    searchBox.style.display = "none";
    return;
  }

  currentWorkList = umamtekWorks[worker] || [];

  searchBox.style.display = "block";
  searchBox.value = "";

  currentWorkList.forEach(work => {
    serviceSelect.innerHTML += `<option value="${work}">${work} — ₹200</option>`;
  });

}

function filterWorkOptions(){

  const searchText = document.getElementById("workSearch").value.toLowerCase();
  const serviceSelect = document.getElementById("bookingService");

  serviceSelect.innerHTML = `<option value="">Select Your Work</option>`;

  currentWorkList
  .filter(work => work.toLowerCase().includes(searchText))
  .forEach(work => {
    serviceSelect.innerHTML += `<option value="${work}">${work} — ₹200</option>`;
  });

}

function showWorkPrice(){

  const selectedWork = document.getElementById("bookingService").value;
  const otherBox = document.getElementById("otherWorkDetails");
  const pricePreview = document.getElementById("pricePreview");

  if(!selectedWork){
    pricePreview.style.display = "none";
    otherBox.style.display = "none";
    otherBox.required = false;
    return;
  }

  pricePreview.style.display = "block";

  if(selectedWork.toLowerCase().includes("please specify") || selectedWork.toLowerCase().includes("not sure")){
    otherBox.style.display = "block";
    otherBox.required = true;
  }else{
    otherBox.style.display = "none";
    otherBox.required = false;
  }

}

function updateBillPreview(){

  const selectedWork = document.getElementById("bookingService").value;

  if(!selectedWork){
    return;
  }

  document.getElementById("billWorkName").innerText = selectedWork;
  document.getElementById("billTravelCharge").innerText = "₹0";
  document.getElementById("billTotal").innerText = "₹200";

  document.getElementById("travelCharge").value = "0";
  document.getElementById("totalPayable").value = "200";

}

function payNowComingSoon(){

  alert("Pay Now will be available soon after Razorpay setup.");

}

function selectPayAfterWork(){

  document.getElementById("paymentMode").value = "Pay After Work";

  document.getElementById("paymentModeText").innerText =
  "Selected: Pay After Work";

}

const UMAMTEK_BASE_LAT = 25.239370;
const UMAMTEK_BASE_LNG = 86.972966;

function calculateDistanceKm(lat1, lng1, lat2, lng2){

  const R = 6371;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;

  const a =
  Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  Math.cos(lat1 * Math.PI / 180) *
  Math.cos(lat2 * Math.PI / 180) *
  Math.sin(dLng / 2) *
  Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;

}

function updateTravelCharge(){

  const lat = parseFloat(document.getElementById("bookingLatitude")?.value);
  const lng = parseFloat(document.getElementById("bookingLongitude")?.value);

  if(!lat || !lng){
    return;
  }

  const distance =
  calculateDistanceKm(UMAMTEK_BASE_LAT, UMAMTEK_BASE_LNG, lat, lng);

  const roundedDistance =
  Math.ceil(distance);

  let travelCharge = 0;

  if(distance > 2){
    travelCharge = Math.ceil(distance - 2) * 50;
  }

  const total = 200 + travelCharge;

  document.getElementById("billTravelCharge").innerText =
  `₹${travelCharge} (${roundedDistance} km approx)`;

  document.getElementById("billTotal").innerText =
  `₹${total}`;

  document.getElementById("travelCharge").value =
  travelCharge;

  document.getElementById("totalPayable").value =
  total;

  if(document.getElementById("distanceKm")){
    document.getElementById("distanceKm").value =
    distance.toFixed(2);
  }

}

function calculateTechnicianDistanceETA(customerLat, customerLng, technicianLat, technicianLng){

  const distance =
  calculateDistanceKm(
    Number(customerLat),
    Number(customerLng),
    Number(technicianLat),
    Number(technicianLng)
  );

  const distanceKm = distance.toFixed(2);

  // Average city speed approx 20 km/h
  const etaMinutes = Math.ceil((distance / 20) * 60);

  return {
    distanceKm: distanceKm,
    etaMinutes: etaMinutes
  };

}
window.toggleNotifications = function(){

  const oldBox = document.getElementById("notificationBox");

  if(oldBox){
    oldBox.remove();
    return;
  }

  const notifications =
  JSON.parse(localStorage.getItem("umamtekNotifications") || "[]");

  let notificationHTML = "";

  if(notifications.length === 0){

    notificationHTML = `
      <p>🔔 No new booking updates yet.</p>
      <p>Open My Bookings once to refresh updates.</p>
    `;

  }else{

    notifications.forEach(item => {

      notificationHTML += `
        <div style="
        padding:10px;
        margin-bottom:10px;
        border-radius:12px;
        background:#fff8d6;
        color:#111;
        ">

          <p><strong>${item.bookingId}</strong></p>
          <p>Status: <strong>${item.status}</strong></p>

          ${
            item.technician
            ? `<p>Technician: <strong>${item.technician}</strong></p>`
            : `<p>Technician not assigned yet</p>`
          }

          ${
            item.eta
            ? `<p>ETA: <strong>${item.eta} mins</strong></p>`
            : ``
          }

          <p>Payment: <strong>${item.paymentStatus}</strong></p>

        </div>
      `;

    });

  }

  const box = document.createElement("div");
  box.id = "notificationBox";

  box.innerHTML = `
    <div class="notification-panel">
      <h3>Notifications</h3>
      ${notificationHTML}
      <a href="my-bookings.html" class="primary-btn" style="display:inline-block;margin-top:10px;text-decoration:none;">
      View My Bookings
      </a>
    </div>
  `;

  document.body.appendChild(box);

};
