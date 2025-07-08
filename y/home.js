// Firebase 인증, DB, 모달 불러오기
import { auth, database } from "./firebaseConfig.js";
import openModal from "./modal.js";

// 로그인/프로필/로딩 버튼 요소
const login_btn = document.getElementById("loginBtn");
const profile_btn = document.getElementById("profileBtn");
const loading_btn = document.getElementById("loadingBtn");
const course_list = document.getElementsByClassName("course-list")[0];

// 강좌 목록을 실시간으로 불러와서 화면에 표시
database.ref("courses").on("value", (snapshot) => {
  const data = snapshot.val();
  course_list.innerHTML = "";

  // 각 강좌별로 DOM 요소 생성
  for (let key in data) {
    const course = data[key];
    const course_item = document.createElement("div");
    course_item.setAttribute("class", "course-item");
    course_item.setAttribute("id", course.courseName);
    const h = document.createElement("h3");
    h.innerText = course.courseName;
    const btn = document.createElement("button");
    btn.setAttribute("class", "enroll-btn");
    btn.innerText = "설명";
    // 설명 버튼 클릭 시 모달 오픈
    btn.addEventListener("click", () => {
      openModal(
        course.courseName,
        course.explanation,
        course.maxPeople,
        course.nowPeople
      );
    });
    course_item.appendChild(h);
    course_item.appendChild(btn);
    course_list.appendChild(course_item);
  }
});

// 로그인 상태에 따라 버튼 표시 변경
auth.onAuthStateChanged((user) => {
  loading_btn.style.display = "none";
  if (user) {
    login_btn.style.display = "none";
    profile_btn.style.display = "";
  } else {
    login_btn.style.display = "";
    profile_btn.style.display = "none";
  }
});

// 로그인 여부에 따라 안내 문구 및 강좌 목록 표시/숨김
document.addEventListener("DOMContentLoaded", () => {
  const coursesSection = document.querySelector(".courses");
  const courseList = document.querySelector(".course-list");
  const h2 = coursesSection.querySelector("h2");

  // 로그인 상태 확인
  auth.onAuthStateChanged((user) => {
    if (user) {
      // 로그인 O
      h2.textContent = "수강할 강좌를 선택하세요";
      courseList.style.display = "";
    } else {
      // 로그인 X
      h2.textContent = "로그인해주세요";
      courseList.style.display = "none";
    }
  });
});

// home.js 등에서
database
  .ref("opentime")
  .once("value")
  .then((snap) => {
    const d = snap.val();
    if (d && Date.now() < d.timestamp) {
      window.location.href = "./opentime.html";
    }
  });
