/* =========================================================
   UMAMTEK — MAIN JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* -----------------------------------------------------
       MOBILE MENU
    ----------------------------------------------------- */

    const menuBtn = document.getElementById("menuBtn");
    const navLinks = document.querySelector(".nav-links");
    const navActions = document.querySelector(".nav-actions");

    if (menuBtn) {
        menuBtn.addEventListener("click", () => {

            navLinks.classList.toggle("mobile-open");
            navActions.classList.toggle("mobile-open");

        });
    }


    /* -----------------------------------------------------
       BOOKING PREFERENCE
    ----------------------------------------------------- */

    const bookingOptions =
        document.querySelectorAll(".booking-option");

    bookingOptions.forEach(option => {

        option.addEventListener("click", () => {

            bookingOptions.forEach(item => {
                item.classList.remove("active");
            });

            option.classList.add("active");

        });

    });


    /* -----------------------------------------------------
       SERVICE SELECTION
    ----------------------------------------------------- */

    const serviceSelect =
        document.getElementById("serviceSelect");

    if (serviceSelect) {

        serviceSelect.addEventListener("change", () => {

            const selectedService =
                serviceSelect.value;

            if (selectedService) {

                console.log(
                    "Selected service:",
                    selectedService
                );

            }

        });

    }

});


/* =========================================================
   START BOOKING
========================================================= */

function startBooking() {

    const serviceSelect =
        document.getElementById("serviceSelect");

    if (!serviceSelect) {
        return;
    }

    const selectedService =
        serviceSelect.value;

    if (!selectedService) {

        alert("Please select a service first.");

        return;
    }

    /*
       Temporary Phase-1 behaviour.

       Later this will send the customer
       into the real Firebase booking system.
    */

    window.location.href =
        "services.html?service=" +
        encodeURIComponent(selectedService);

}