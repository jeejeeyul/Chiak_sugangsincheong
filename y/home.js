import { auth, database } from "./firebaseConfig.js";
import openModal from "./modal.js";

const login_btn = document.getElementById("loginBtn");
const profile_btn = document.getElementById("profileBtn");
const loading_btn = document.getElementById("loadingBtn");
const course_list = document.getElementsByClassName("course-list")[0];

database.ref("courses").on("value", (snapshot) => {
  const data = snapshot.val();
  course_list.innerHTML = "";

  for (let key in data) {
    const course = data[key];
    console.log(course);
    const course_item = document.createElement("div");
    course_item.setAttribute("class", "course-item");
    course_item.setAttribute("id", course.courseName);
    const h = document.createElement("h3");
    h.innerText = course.courseName;
    const btn = document.createElement("button");
    btn.setAttribute("class", "enroll-btn");
    btn.innerText = "설명";
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
