import { database, auth } from "./firebaseConfig.js";

// 강좌 목록 동기화
function loadCourses() {
  database.ref("courses").once("value").then((snapshot) => {
    const coursesData = snapshot.val() || {};
    const courseSelect = document.getElementById("course");
    courseSelect.innerHTML = '<option value="">강좌를 선택하세요</option>';
    Object.keys(coursesData).forEach((courseId) => {
      const option = document.createElement("option");
      option.value = courseId;
      option.textContent = courseId;
      courseSelect.appendChild(option);
    });
  });
}

// 강좌별 신청자 목록 불러오기
function loadCourseDetails() {
  const courseId = document.getElementById("course").value;
  const courseDetailsDiv = document.getElementById("course-details");
  const studentTableBody = document.querySelector("#student-table tbody");
  studentTableBody.innerHTML = "";

  if (courseId) {
    // users에서 신청자 목록 조회
    database.ref("users").once("value").then((snap) => {
      const users = snap.val() || {};
      const students = Object.values(users).filter(
        (u) => u.isconfirmed && u.subject === courseId
      );
      students.forEach((student) => {
        const row = document.createElement("tr");
        const studentIdCell = document.createElement("td");
        studentIdCell.textContent = student.studentId;
        row.appendChild(studentIdCell);

        const nameCell = document.createElement("td");
        nameCell.textContent = student.name;
        row.appendChild(nameCell);

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
      courseDetailsDiv.style.display = "block";
    });
  } else {
    courseDetailsDiv.style.display = "none";
  }
}

// 신청 취소 (DB 반영)
function cancelEnrollment(courseId, studentId) {
  // 해당 studentId를 가진 user 찾기
  database.ref("users").once("value").then((snap) => {
    const users = snap.val() || {};
    const userEntry = Object.entries(users).find(
      ([, u]) => u.studentId === studentId && u.subject === courseId
    );
    if (userEntry) {
      const [uid] = userEntry;
      // 1. users/{uid}에서 isconfirmed, subject 초기화
      database.ref("users/" + uid).update({
        isconfirmed: false,
        subject: "",
      });
      // 2. courses/{courseId}/nowPeople 감소
      database.ref("courses/" + courseId + "/nowPeople").transaction((val) => Math.max(0, (val || 1) - 1));
      // 3. 화면 갱신
      setTimeout(loadCourseDetails, 500);
    }
  });
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
    auth.onAuthStateChanged((user) => {
      if (user) {
        database
          .ref("courses/" + newCourse)
          .set({
            courseName: newCourse,
            explanation: explanation,
            maxPeople: Number(maxPeople),
            nowPeople: 0,
            names: [],
            studentsId: [],
          })
          .then(() => {
            alert(`${newCourse} 강좌가 생성되었습니다.`);
            loadCourses();
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
              loadCourses();
              loadCourseDetails();
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

// 명단 엑셀 다운로드 (SheetJS 활용)
function exportExcel() {
  const courseId = document.getElementById("course").value;
  if (!courseId) {
    alert("강좌를 선택하세요.");
    return;
  }
  database.ref("users").once("value").then((snap) => {
    const users = snap.val() || {};
    // 신청자만 추출
    const students = Object.values(users)
      .filter((u) => u.isconfirmed && u.subject === courseId)
      .map((u) => ({
        학번: u.studentId,
        이름: u.name,
        출석: "", // 출석 여부는 빈 칸으로 두고, 엑셀에서 직접 체크 가능
      }));
    if (students.length === 0) {
      alert("신청자가 없습니다.");
      return;
    }
    // SheetJS로 엑셀 생성 및 다운로드
    const ws = XLSX.utils.json_to_sheet(students);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "명단");
    XLSX.writeFile(wb, `${courseId}_명단.xlsx`);
  });
}

// 이벤트 연결
document.getElementById("course").addEventListener("change", loadCourseDetails);
document.getElementById("create-course-btn").addEventListener("click", createCourse);
document.getElementById("delete-course-btn").addEventListener("click", deleteCourse);
document.getElementById("export-excel-btn").addEventListener("click", exportExcel);

// 페이지 로딩 시 강좌 목록 불러오기
window.addEventListener("DOMContentLoaded", loadCourses);
