import * as firebase from "firebase/index";

const fb = firebase;

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

firebase.auth().onAuthStateChanged(user => {
    if (user) {
      //  console.log("authenticated")
    } else {
      //  console.log("no user")
    }
});


/**
 * No role property in the basic firebase authentication, so we just use displayName for roles.
 * call this method with <button onClick={makeAdmin()}>make admin</button> from somewhere in the project when you are
 * signed in with the user you want to make admin.
 */
// export function makeAdmin() {
//     var user = firebase.auth().currentUser;
//     user.updateProfile({displayName: "admin"})
// }

export function logout() {
    return firebase.auth().signOut();
}

export function isLoggedIn() {
    return firebase.auth().currentUser;
}

export default fb;

