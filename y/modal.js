import {
  applySubject,
  cancelSubject,
  getUserStatus,
} from "./sugangsincheong.js";

// 모달 관련 이벤트 등록
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  const modalContent = document.querySelector(".modal-content");
  const closeBtn = document.querySelector(".close-btn");

  // 모달 배경 클릭 시 닫기
  modal.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // 모달 내용 클릭 시 닫힘 방지
  modalContent.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  // 닫기 버튼 클릭 시 닫기
  closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });
});

// 모든 수강신청 버튼 비활성화/활성화 함수
function setAllApplyBtnsDisabled(disabled, exceptTitle = null) {
  const allBtns = document.getElementsByClassName("final-apply-btn");
  for (let btn of allBtns) {
    if (!exceptTitle || btn.dataset.title !== exceptTitle) {
      btn.disabled = disabled;
    }
  }
}

// 모달 열기 및 버튼 상태/이벤트 처리
function openModal(title, description, max, current) {
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-desc").textContent = description;
  document.getElementById("modal-max").textContent = max;
  document.getElementById("modal-current").textContent = current;
  document.getElementById("modal").classList.remove("hidden");

  // 항상 새 버튼으로 교체
  const oldBtn = document.getElementsByClassName("final-apply-btn")[0];
  const newBtn = oldBtn.cloneNode(true);
  oldBtn.parentNode.replaceChild(newBtn, oldBtn);
  newBtn.dataset.title = title;

  // 상태에 따라 버튼 세팅 및 이벤트 등록
  getUserStatus(title).then((status) => {
    if (status === "applied") {
      newBtn.textContent = "수강 취소";
      newBtn.disabled = false;
      setAllApplyBtnsDisabled(true, title);
    } else if (status === "other_applied") {
      newBtn.textContent = "수강 신청";
      newBtn.disabled = true;
      setAllApplyBtnsDisabled(true);
    } else {
      newBtn.textContent = "수강 신청";
      newBtn.disabled = false;
      setAllApplyBtnsDisabled(false);
    }

    // 클릭 이벤트 등록
    newBtn.onclick = () => {
      getUserStatus(title).then((status) => {
        if (status === "applied") {
          // 취소
          cancelSubject(title)
            .then(() => {
              alert("수강이 취소되었습니다.");
              newBtn.textContent = "수강 신청";
              setAllApplyBtnsDisabled(false);
              updateNowPeople(title);
            })
            .catch(alert);
        } else {
          // 신청
          applySubject(title, max)
            .then(() => {
              alert("신청이 완료되었습니다.");
              newBtn.textContent = "수강 취소";
              setAllApplyBtnsDisabled(true, title);
              updateNowPeople(title);
            })
            .catch(alert);
        }
      });
    };
  });
}

// 인원수 동기화 함수
function updateNowPeople(title) {
  import("./firebaseConfig.js").then(({ database }) => {
    database
      .ref("courses/" + title + "/nowPeople")
      .once("value")
      .then((snap) => {
        document.getElementById("modal-current").textContent = snap.val();
      });
  });
}

export default openModal;
