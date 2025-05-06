import { auth, database } from "./firebaseConfig.js";

const signup_btn = document.getElementsByClassName("signup-btn")[0];
const login_btn = document.getElementsByClassName("login-btn")[0];
const signupForm = document.getElementById("signup-form");

function signup() {
  const new_email = document.getElementById("new-username").value;
  const new_password = document.getElementById("new-password").value;
  const confirm_password = document.getElementById("confirm-password").value;
  const student_id = document.getElementById("student-id").value;
  const student_name = document.getElementById("name").value;
  if (confirm_password == new_password) {
    auth
      .createUserWithEmailAndPassword(new_email, new_password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("회원가입 성공:", user.uid);
        toggleForm();
        // 사용자 정보 Realtime DB에 저장
        database
          .ref("users/" + user.uid)
          .set({
            email: user.email,
            name: student_name,
            studentId: student_id,
            createdAt: new Date().toISOString(),
            isconfirmed: false,
            subject: "",
          })
          .then(() => {
            console.log("사용자 정보 저장 완료");
          })
          .catch((error) => {
            console.error("DB 저장 실패:", error);
          });
      })
      .catch((error) => {
        console.error("회원가입 실패:", error.message);
        alert("회원가입 실패:", error.message);
        resetForm(signupForm);
      });
  } else {
    alert("비밀번호가 일치하지 않습니다!");
    resetForm(signupForm);
  }
}
signup_btn.addEventListener("click", signup);
//회원가입 함수

function login() {
  const email = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  auth
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      // 로그인 성공 후 사용자 데이터 가져오기
      return database.ref("users/" + user.uid).once("value");
    })
    .then((snapshot) => {
      const userData = snapshot.val();
      alert(`로그인 성공! 환영합니다, ${userData.name}님`);
      window.location.href = "./index.html";
    })
    .catch((error) => {
      alert("로그인 실패: " + error.message);
    });
}
login_btn.addEventListener("click", login);
//로그인 함수

//할일: 에러메시지별로 alert다르게 띄우기(스위치문 쓰던가)
