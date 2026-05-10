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
