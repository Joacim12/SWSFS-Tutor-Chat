import * as firebase from "firebase/index";

let config = {
    apiKey: "AIzaSyClmWE8_C1mdd1HHgZpPXCEuk4niJaUNVU",
    authDomain: "tutorchatcph.firebaseapp.com",
    databaseURL: "https://tutorchatcph.firebaseio.com",
    projectId: "tutorchatcph",
    storageBucket: "tutorchatcph.appspot.com",
    messagingSenderId: "500761769080"

}

if (!firebase.apps.length) {
    firebase.initializeApp(config);
}

const fb = firebase;

export default fb;

export function logout() {
    return firebase.auth().signOut();
}

export function isLoggedIn(){
    console.log(firebase.auth().currentUser)
    return firebase.auth().currentUser;
}

//
// firebase.auth().onAuthStateChanged(function(user) {
//     if (user) {
//         // User is signed in.
//         var displayName = user.displayName;
//         var email = user.email;
//         var emailVerified = user.emailVerified;
//         var photoURL = user.photoURL;
//         var isAnonymous = user.isAnonymous;
//         var uid = user.uid;
//         var providerData = user.providerData;
//         // ...
//     } else {
//         // User is signed out.
//         // ...
//     }
// });