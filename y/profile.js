// 프로필 정보 표시 및 수정 기능
import { database, auth } from "./firebaseConfig.js";

// 프로필 정보 표시용 DOM 요소
const user_name = document.getElementById("user-name");
const student_id = document.getElementById("student-id");
const student_name = document.getElementById("student-name");
const subject_name = document.getElementById("subject-name"); // 신청한 과목
const edit_btn = document.getElementsByClassName("edit-btn")[0];

// 로그인 상태 감지 및 정보 표시
auth.onAuthStateChanged((user) => {
  if (!user) return;

  // 1. localStorage에서 먼저 보여주기
  const cached = JSON.parse(localStorage.getItem("profile_" + user.uid));
  if (cached) {
    user_name.textContent = cached.name;
    student_id.textContent = cached.studentId;
    student_name.textContent = cached.name;
    if (subject_name) subject_name.textContent = cached.subject || "-";
  }

  // 2. Firebase에서 최신 정보 받아와서 갱신
  database
    .ref("users/" + user.uid)
    .once("value")
    .then((snapshot) => {
      const userData = snapshot.val();
      if (!userData) return;
      user_name.textContent = userData.name;
      student_id.textContent = userData.studentId;
      student_name.textContent = userData.name;
      if (subject_name) subject_name.textContent = userData.subject || "-";
      // 최신 정보 localStorage에 저장
      localStorage.setItem(
        "profile_" + user.uid,
        JSON.stringify({
          name: userData.name,
          studentId: userData.studentId,
          subject: userData.subject,
        })
      );
    });
});

// 프로필 정보 수정 함수
function editProfile() {
  auth.onAuthStateChanged((user) => {
    if (user) {
      const newId = prompt(
        "새 학번을 입력하세요:",
        document.getElementById("student-id").textContent
      );
      const newName = prompt(
        "새 이름을 입력하세요:",
        document.getElementById("student-name").textContent
      );
      // 학번 5자리 숫자 검사 추가
      if (!/^\d{5}$/.test(newId)) {
        alert("학번은 5자리 숫자로 입력해주세요.");
        return;
      }
      if (newId !== "" && newName !== "") {
        database
          .ref("users/" + user.uid)
          .update({
            studentId: newId,
            name: newName,
          })
          .then(() => {
            // localStorage에 최신 정보 저장
            localStorage.setItem(
              "profile_" + user.uid,
              JSON.stringify({
                name: newName,
                studentId: newId,
              })
            );
            student_id.textContent = newId;
            student_name.textContent = newName;
            user_name.textContent = newName;
            console.log("사용자 정보 업데이트 및 localStorage 갱신 완료");
          })
          .catch((error) => {
            console.error("업데이트 실패!", error);
          });
      } else {
        alert("학번과 이름을 정확히 입력해주세요");
      }
    }
  });
}
edit_btn.addEventListener("click", editProfile);
