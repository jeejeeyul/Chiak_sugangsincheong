document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  const modalContent = document.querySelector(".modal-content");
  const closeBtn = document.querySelector(".close-btn");

  // 배경 클릭 → 닫기
  modal.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // 내용 클릭 → 닫힘 방지
  modalContent.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  // 닫기 버튼 클릭
  closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });
});

function openModal(title, description, max, current) {
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-desc").textContent = description;
  document.getElementById("modal-max").textContent = max;
  document.getElementById("modal-current").textContent = current;
  document.getElementById("modal").classList.remove("hidden");
}

export default openModal;
