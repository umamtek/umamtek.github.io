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
