window.addEventListener("load", () => {
  const username = document.getElementById("username");

  username.textContent = sessionStorage.getItem("username");
});
