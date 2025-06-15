// Firebase 설정 및 초기화
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

// Firebase 앱 초기화
firebase.initializeApp(firebaseConfig);
// 인증 객체, DB 객체 export
export const auth = firebase.auth();
export const database = firebase.database();
