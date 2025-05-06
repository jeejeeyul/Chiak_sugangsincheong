import { database, auth } from "./firebaseConfig.js";

const user_name = document.getElementById("user-name");
const student_id = document.getElementById("student-id");
const student_name = document.getElementById("student-name");
const edit_btn = document.getElementsByClassName("edit-btn")[0];

auth.onAuthStateChanged((user) => {
  database
    .ref("users/" + user.uid)
    .once("value")
    .then((snapshot) => {
      const userData = snapshot.val();
      user_name.textContent = userData.name;
      student_id.textContent = userData.studentId;
      student_name.textContent = userData.name;
    });
}); // 학번 이름 띄우기

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
      if (!isNaN(newId) && newId != "" && newName != "") {
        student_id.textContent = newId;
        student_name.textContent = newName;
        user_name.textContent = newName;
        database
          .ref("users/" + user.uid)
          .update({
            studentId: newId,
            name: newName,
          })
          .then(() => {
            console.log("사용자 정보 업데이트 완료");
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
