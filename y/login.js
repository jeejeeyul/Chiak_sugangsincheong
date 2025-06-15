// 로그인/회원가입 관련 기능
import { auth, database } from "./firebaseConfig.js";

const signup_btn = document.getElementsByClassName("signup-btn")[0];
const login_btn = document.getElementsByClassName("login-btn")[0];
const signupForm = document.getElementById("signup-form");

// 회원가입 함수
function signup() {
  const new_email = document.getElementById("new-username").value.trim();
  const new_password = document.getElementById("new-password").value;
  const confirm_password = document.getElementById("confirm-password").value;
  const student_id = document.getElementById("student-id").value.trim();
  const student_name = document.getElementById("name").value.trim();

  // 입력값 누락 검사
  if (
    !new_email ||
    !new_password ||
    !confirm_password ||
    !student_id ||
    !student_name
  ) {
    alert("모든 항목을 빠짐없이 입력해주세요.");
    resetForm(signupForm);
    return;
  }

  // 학번 5자리 숫자 검사
  if (!/^\d{5}$/.test(student_id)) {
    alert("학번은 5자리 숫자로 입력해주세요.");
    resetForm(signupForm);
    return;
  }

  // 비밀번호 일치 검사
  if (confirm_password !== new_password) {
    alert("비밀번호가 일치하지 않습니다!");
    resetForm(signupForm);
    return;
  }

  // Firebase 인증 회원가입
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
      alert("회원가입 실패: " + error.message);
      resetForm(signupForm);
    });
}

signup_btn.addEventListener("click", signup);

// 로그인 함수
function login() {
  const email = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  auth
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      // 로그인 성공 후 사용자 데이터 가져오기
      return database
        .ref("users/" + user.uid)
        .once("value")
        .then((snapshot) => {
          const userData = snapshot.val();
          // localStorage에 사용자 정보 저장
          localStorage.setItem(
            "profile_" + user.uid,
            JSON.stringify({
              name: userData.name,
              studentId: userData.studentId,
            })
          );
          alert(`로그인 성공! 환영합니다, ${userData.name}님`);
          window.location.href = "./index.html";
        });
    })
    .catch((error) => {
      let message = "";
      switch (error.code) {
        case "auth/user-not-found":
          message = "존재하지 않는 이메일입니다.";
          break;
        case "auth/wrong-password":
          message = "비밀번호가 올바르지 않습니다.";
          break;
        case "auth/invalid-email":
          message = "이메일 형식이 올바르지 않습니다.";
          break;
        case "auth/user-disabled":
          message = "비활성화된 계정입니다.";
          break;
        default:
          message = "로그인 실패: " + error.message;
      }
      alert(message);
    });
}
login_btn.addEventListener("click", login);

// 할일: 에러메시지별로 alert 다르게 띄우기(스위치문 쓰던가)
