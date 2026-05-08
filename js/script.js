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

window.onload = function(){

  const loader = document.getElementById("loader");

setTimeout(() => {
  loader.classList.add("hide");
}, 1200);
  
  if(localStorage.getItem("theme") === "dark"){
    document.body.classList.add("dark-mode");
  }

};

function sendContactForm(event){

event.preventDefault();

const name =
document.getElementById("contactName").value;

const phone =
document.getElementById("contactPhone").value;

const message =
document.getElementById("contactMessage").value;

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

const name =
document.getElementById("careerName").value;

const phone =
document.getElementById("careerPhone").value;

const skill =
document.getElementById("careerSkill").value;

const experience =
document.getElementById("careerExperience").value;

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

const name =
document.getElementById("complaintName").value;

const phone =
document.getElementById("complaintPhone").value;

const complaint =
document.getElementById("complaintMessage").value;

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
