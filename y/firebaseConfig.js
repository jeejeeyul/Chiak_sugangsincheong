const firebaseConfig = {
  apiKey: "AIzaSyC_Ty8iUullX5NzV8K9eiMuDAsviM2UTr0",
  authDomain: "chiaksugangsincheong.firebaseapp.com",
  databaseURL: "https://chiaksugangsincheong-default-rtdb.firebaseio.com",
  projectId: "chiaksugangsincheong",
  storageBucket: "chiaksugangsincheong.firebasestorage.app",
  messagingSenderId: "673330568301",
  appId: "1:673330568301:web:03ca452797d15e46d87364",
  measurementId: "G-N8HDX69BKR",
};

firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const database = firebase.database();
