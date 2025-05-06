import { database, auth } from "./firebaseConfig.js";

// 강좌 데이터 (임시 데이터)
const courses = {
  "course1": [
    { studentId: "2021001", name: "김철수" },
    { studentId: "2021002", name: "이영희" },
  ],
  "course2": [
    { studentId: "2021010", name: "박지훈" },
    { studentId: "2021020", name: "최미경" },
  ],
  "course3": [{ studentId: "2021030", name: "홍길동" }],
};
const courseSelect = document.getElementById("course");
courseSelect.addEventListener("click", loadCourseDetails);
const createCourseBtn = document.getElementById("create-course-btn");
const deleteCourseBtn = document.getElementById("delete-course-btn");
createCourseBtn.addEventListener("click", createCourse);
deleteCourseBtn.addEventListener("click", deleteCourse);
// 강좌를 선택했을 때 학생 데이터를 로드하고 표에 표시하는 함수
function loadCourseDetails() {
  const courseId = courseSelect.value;
  const courseDetailsDiv = document.getElementById("course-details");
  const studentTableBody = document.querySelector("#student-table tbody");

  // 표를 초기화
  studentTableBody.innerHTML = "";

  if (courseId) {
    // 강좌 데이터를 가져옴
    const students = courses[courseId];
    students.forEach((student) => {
      const row = document.createElement("tr");

      // 학번
      const studentIdCell = document.createElement("td");
      studentIdCell.textContent = student.studentId;
      row.appendChild(studentIdCell);

      // 이름
      const nameCell = document.createElement("td");
      nameCell.textContent = student.name;
      row.appendChild(nameCell);

      // 취소 버튼
      const cancelCell = document.createElement("td");
      const cancelButton = document.createElement("button");
      cancelButton.textContent = "취소";
      cancelButton.onclick = function () {
        cancelEnrollment(courseId, student.studentId);
      };
      cancelCell.appendChild(cancelButton);
      row.appendChild(cancelCell);

      studentTableBody.appendChild(row);
    });

    // 강좌 세부사항 표시
    courseDetailsDiv.style.display = "block";
  } else {
    // 강좌를 선택하지 않았으면 세부사항 숨김
    courseDetailsDiv.style.display = "none";
  }
}

// 강좌 신청 취소 함수
function cancelEnrollment(courseId, studentId) {
  const students = courses[courseId];
  const index = students.findIndex(
    (student) => student.studentId === studentId
  );
  if (index !== -1) {
    students.splice(index, 1); // 학생 정보 삭제
    loadCourseDetails(); // 변경된 데이터로 다시 로드
  }
}

// 강좌 생성 함수
function createCourse() {
  const newCourse = prompt("새로운 강좌 이름을 입력하세요:");
  const explanation = prompt("강좌 설명을 적어주세요");
  const maxPeople = prompt("최대 인원을 적어주세요(숫자만 입력)");
  if (
    newCourse != "" &&
    newCourse != null &&
    explanation != "" &&
    maxPeople != "" &&
    !isNaN(maxPeople)
  ) {
    const courseSelect = document.getElementById("course");
    const newOption = document.createElement("option");
    newOption.value = newCourse;
    newOption.textContent = newCourse;
    courseSelect.appendChild(newOption);
    auth.onAuthStateChanged((user) => {
      if (user) {
        database
          .ref("courses")
          .push({
            courseName: newCourse,
            explanation: explanation,
            maxPeople: Number(maxPeople),
            nowPeople: 0,
            names: [],
            studentsId: [],
          })
          .then(() => {
            alert(`${newCourse} 강좌가 생성되었습니다.`);
          })
          .catch((error) => {
            console.error("강좌 생성 실패!", error);
          });
      }
    });
  } else {
    alert("정확히 적어주세요");
  }
}

// 강좌 삭제 함수
function deleteCourse() {
  const courseSelect = document.getElementById("course");
  const courseId = courseSelect.value;
  if (courseId) {
    const confirmation = confirm(`${courseId} 강좌를 삭제하시겠습니까?`);
    if (confirmation) {
      auth.onAuthStateChanged((user) => {
        if (user) {
          database
            .ref("courses/" + courseId)
            .remove()
            .then(() => {
              delete courses[courseId]; // 강좌 데이터 삭제
              const optionToRemove = document.querySelector(
                `option[value="${courseId}"]`
              );
              optionToRemove.remove(); // 드롭다운에서 강좌 삭제
              loadCourseDetails(); // 세부사항 비우기
              alert(`${courseId} 강좌가 삭제되었습니다.`);
            })
            .catch((error) => {
              console.error("강좌 삭제 실패!");
            });
        }
      });
    }
  } else {
    alert("삭제할 강좌를 선택하세요.");
  }
}
