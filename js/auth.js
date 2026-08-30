// =====================================================
// UMAMTEK AUTHENTICATION
// Firebase Email + Password
// =====================================================

import {
    auth,
    db
} from "./firebase-config.js";


import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    signOut,
    onAuthStateChanged,
    updateProfile
} from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";



// =====================================================
// GENERATE UMAMTEK USER ID
// =====================================================

function generateUserId() {

    const random =
        Math.floor(
            100000 +
            Math.random() * 900000
        );

    return "UMT-C-" + random;

}



// =====================================================
// CREATE CUSTOMER ACCOUNT
// =====================================================

async function registerCustomer(
    name,
    email,
    mobile,
    password
) {

    try {

        // Create Firebase account

        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user =
            userCredential.user;


        // Update Firebase display name

        await updateProfile(
            user,
            {
                displayName: name
            }
        );


        // Generate customer ID

        const userId =
            generateUserId();


        // Send verification email

        await sendEmailVerification(
            user
        );


        // Save customer profile

        await setDoc(
            doc(
                db,
                "customers",
                user.uid
            ),
            {

                uid:
                    user.uid,

                userId:
                    userId,

                name:
                    name,

                email:
                    email,

                mobile:
                    mobile,

                accountType:
                    "customer",

                accountStatus:
                    "active",

                accountCreated:
                    serverTimestamp(),

                bookingCount:
                    0

            }
        );


        return {

            success:
                true,

            userId:
                userId,

            user:
                user

        };


    } catch(error) {

        console.error(
            "Registration Error:",
            error
        );


        return {

            success:
                false,

            error:
                error

        };

    }

}



// =====================================================
// CUSTOMER LOGIN
// =====================================================

async function loginCustomer(
    email,
    password
) {

    try {

        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user =
            userCredential.user;


        return {

            success:
                true,

            user:
                user

        };


    } catch(error) {

        console.error(
            "Login Error:",
            error
        );


        return {

            success:
                false,

            error:
                error

        };

    }

}



// =====================================================
// GET CUSTOMER PROFILE
// =====================================================

async function getCustomerProfile(
    uid
) {

    try {

        const customerRef =
            doc(
                db,
                "customers",
                uid
            );


        const customerSnapshot =
            await getDoc(
                customerRef
            );


        if(
            customerSnapshot.exists()
        ) {

            return customerSnapshot.data();

        }


        return null;


    } catch(error) {

        console.error(
            "Profile Error:",
            error
        );


        return null;

    }

}



// =====================================================
// LOGOUT
// =====================================================

async function logoutCustomer() {

    try {

        await signOut(
            auth
        );


        window.location.href =
            "login.html";


    } catch(error) {

        console.error(
            "Logout Error:",
            error
        );

    }

}



// =====================================================
// AUTH STATE
// =====================================================

function watchAuthentication(
    callback
) {

    onAuthStateChanged(
        auth,
        callback
    );

}



// =====================================================
// EXPORT
// =====================================================

export {

    registerCustomer,

    loginCustomer,

    getCustomerProfile,

    logoutCustomer,

    watchAuthentication

};