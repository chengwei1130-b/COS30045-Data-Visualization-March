function showPage(pageId) {
  const pages = document.querySelectorAll(".page");
  pages.forEach(function(page) {
    page.classList.remove("active-page");
  });

  document.getElementById(pageId).classList.add("active-page");

  const navLinks = document.querySelectorAll(".nav-links a");
  navLinks.forEach(function(link) {
    link.classList.remove("active");
  });

  if (pageId === "home") {
    document.getElementById("nav-home").classList.add("active");
  } else if (pageId === "televisions") {
    document.getElementById("nav-televisions").classList.add("active");
  } else if (pageId === "about") {
    document.getElementById("nav-about").classList.add("active");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}