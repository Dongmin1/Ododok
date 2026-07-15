const contactForm = document.querySelector("#contactForm");
const formMessage = document.querySelector("#formMessage");

contactForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const formData = new FormData(contactForm);
  const name = formData.get("name");

  formMessage.textContent =
    `${name}님, 상담 신청이 접수된 예시입니다.`;

  contactForm.reset();
});