const navLinks = document.querySelectorAll(".nav-links a");
const pages = document.querySelectorAll(".page");
const logo = document.querySelector(".logo");

function showPage(pageId) {
  pages.forEach(page => {
    page.classList.remove("active-page");
  });

  navLinks.forEach(link => {
    link.classList.remove("active");
  });

  const selectedPage = document.getElementById(pageId);
  if (selectedPage) {
    selectedPage.classList.add("active-page");
  }

  const activeLink = document.querySelector(`.nav-links a[data-page="${pageId}"]`);
  if (activeLink) {
    activeLink.classList.add("active");
  }
}

navLinks.forEach(link => {
  link.addEventListener("click", function (event) {
    event.preventDefault();
    const pageId = this.getAttribute("data-page");
    showPage(pageId);
  });
});

logo.addEventListener("click", function () {
  showPage("home");
});

showPage("home");