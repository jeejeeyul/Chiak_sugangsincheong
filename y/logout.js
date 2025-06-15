// 로그아웃 기능
import { auth } from "./firebaseConfig.js";

const logoutBtn = document.getElementsByClassName("logout-btn")[0];

// 로그아웃 함수
function logout() {
  auth
    .signOut()
    .then(() => {
      alert("로그아웃 되었습니다");
      window.location.href = "./index.html";
    })
    .catch((error) => {
      alert("로그아웃 오류: " + error.message);
    });
}

logoutBtn.addEventListener("click", logout);
