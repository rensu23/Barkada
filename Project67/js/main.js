const form = document.getElementById("loginForm");

form.addEventListener("submit", function(e) {
  e.preventDefault();

  const email = document.getElementById("email");
  const password = document.getElementById("password");

  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");

  emailError.textContent = "";
  passwordError.textContent = "";

  let valid = true;

  if (email.value.trim() === "") {
    emailError.textContent = "Email required";
    valid = false;
  }

  if (password.value.trim() === "") {
    passwordError.textContent = "Password required";
    valid = false;
  }

  if (valid) {
    alert("Logged in 🎮");
  }
});

