importScripts("https://www.gstatic.com/firebasejs/4.7.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/4.7.0/firebase-messaging.js");

let config = {
    apiKey: "AIzaSyClmWE8_C1mdd1HHgZpPXCEuk4niJaUNVU",
    authDomain: "tutorchatcph.firebaseapp.com",
    databaseURL: "https://tutorchatcph.firebaseio.com",
    projectId: "tutorchatcph",
    storageBucket: "tutorchatcph.appspot.com",
    messagingSenderId: "500761769080"

}
firebase.initializeApp(config)

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(payload => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = 'Background Message Title';
    const notificationOptions = {
        body: 'Background Message body.',
        icon: '/firebase-logo.png'
    };

    return self.registration.showNotification(notificationTitle,
        notificationOptions);
});