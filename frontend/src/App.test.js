import React from 'react';
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

test('we get a valid token with demo user', () =>{
    firebase.auth().signInWithEmailAndPassword("demo@demo.dk", "demo1234")
        .then((user) => {
            user.getIdToken(true)
                .then((token) => {
                    console.error(token)
                    expect(token).not.toBe("");
                })
        })
})
