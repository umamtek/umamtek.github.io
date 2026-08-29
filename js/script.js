/* =========================================================
   UMAMTEK — GLOBAL JAVASCRIPT
   ========================================================= */


document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
         * MOBILE MENU
         */

        const menuBtn =
            document.getElementById(
                "menuBtn"
            );

        const navLinks =
            document.querySelector(
                ".nav-links"
            );

        const navActions =
            document.querySelector(
                ".nav-actions"
            );


        if (menuBtn) {

            menuBtn.addEventListener(
                "click",
                function () {

                    if (navLinks) {

                        navLinks.classList.toggle(
                            "mobile-open"
                        );

                    }


                    if (navActions) {

                        navActions.classList.toggle(
                            "mobile-open"
                        );

                    }

                }
            );

        }


        /*
         * CLOSE MOBILE MENU
         * WHEN LINK IS CLICKED
         */

        if (navLinks) {

            const links =
                navLinks.querySelectorAll(
                    "a"
                );


            links.forEach(
                function (link) {

                    link.addEventListener(
                        "click",
                        function () {

                            navLinks.classList.remove(
                                "mobile-open"
                            );


                            if (navActions) {

                                navActions.classList.remove(
                                    "mobile-open"
                                );

                            }

                        }
                    );

                }
            );

        }


        /*
         * CURRENT YEAR
         */

        const yearElements =
            document.querySelectorAll(
                "[data-current-year]"
            );


        yearElements.forEach(
            function (element) {

                element.textContent =
                    new Date().getFullYear();

            }
        );

    }
);


/* =========================================================
   QUICK BOOKING
   ========================================================= */

function openBooking(service) {

    if (!service) {

        window.location.href =
            "services.html";

        return;

    }


    window.location.href =
        "services.html?service=" +
        encodeURIComponent(service);

}


/* =========================================================
   WHATSAPP
   ========================================================= */

function openWhatsApp(message) {

    const phone =
        "917544813882";


    const text =
        message ||
        "Hello UMAMTEK, I need help.";


    const url =
        "https://wa.me/" +
        phone +
        "?text=" +
        encodeURIComponent(text);


    window.open(
        url,
        "_blank"
    );

}
