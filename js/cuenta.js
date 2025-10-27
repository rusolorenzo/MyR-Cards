(function () {
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function getUsers() {
    try { return JSON.parse(localStorage.getItem("mr_users") || "[]"); }
    catch (e) { return []; }
  }
  function setUsers(list) {
    localStorage.setItem("mr_users", JSON.stringify(list));
  }
  function findUser(email) {
    return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  }
  function createSession(user, remember) {
    const sess = { email: user.email, name: user.first_name || "", ts: Date.now() };
    const key = remember ? "mr_session_persist" : "mr_session";
    sessionStorage.setItem("mr_session", JSON.stringify(sess));
    if (remember) localStorage.setItem(key, JSON.stringify(sess));
  }
  function getSession() {
    const s1 = sessionStorage.getItem("mr_session");
    const s2 = localStorage.getItem("mr_session_persist");
    return s1 ? JSON.parse(s1) : (s2 ? JSON.parse(s2) : null);
  }

  const loginForm = document.getElementById("form-login");
  const signupForm = document.getElementById("form-signup");
  const recoverForm = document.getElementById("form-recover");

  loginForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const pass = document.getElementById("login-pass").value;
    const remember = document.getElementById("remember").checked;
    const msg = document.getElementById("login-msg");
    msg.style.display = "none"; msg.textContent = "";

    if (!emailRe.test(email)) { msg.textContent = "Ingresá un email válido."; msg.style.display = "block"; return; }
    if (!pass || pass.length < 8) { msg.textContent = "La contraseña debe tener al menos 8 caracteres."; msg.style.display = "block"; return; }

    const user = findUser(email);
    if (!user || user.password !== pass) {
      msg.textContent = "Credenciales incorrectas."; msg.style.display = "block"; return;
    }

    createSession(user, remember);
    window.location.href = "../index.html";
  });

  signupForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const first = document.getElementById("reg-nombre").value.trim();
    const last = document.getElementById("reg-apellido").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const pass1 = document.getElementById("reg-pass").value;
    const pass2 = document.getElementById("reg-pass2").value;
    const terms = document.getElementById("terms").checked;
    const msg = document.getElementById("signup-msg");
    msg.style.display = "none"; msg.textContent = "";

    if (!first || !last) { msg.textContent = "Completá nombre y apellido."; msg.style.display = "block"; return; }
    if (!emailRe.test(email)) { msg.textContent = "Ingresá un email válido."; msg.style.display = "block"; return; }
    if (pass1.length < 8) { msg.textContent = "La contraseña debe tener al menos 8 caracteres."; msg.style.display = "block"; return; }
    if (pass1 !== pass2) { msg.textContent = "Las contraseñas no coinciden."; msg.style.display = "block"; return; }
    if (!terms) { msg.textContent = "Debés aceptar los Términos y Condiciones."; msg.style.display = "block"; return; }

    if (findUser(email)) { msg.textContent = "Ya existe una cuenta con ese email."; msg.style.display = "block"; return; }

    const users = getUsers();
    users.push({ first_name: first, last_name: last, email, password: pass1, created_at: Date.now() });
    setUsers(users);

    const tabLogin = document.getElementById("tab-login");
    if (tabLogin) tabLogin.checked = true;
    const loginMsg = document.getElementById("login-msg");
    if (loginMsg) { loginMsg.textContent = "Cuenta creada. Iniciá sesión."; loginMsg.style.display = "block"; }
  });

  recoverForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("rec-email").value.trim();
    const msg = document.getElementById("recover-msg");
    msg.style.display = "none"; msg.textContent = "";

    if (!emailRe.test(email)) { msg.textContent = "Ingresá un email válido."; msg.style.display = "block"; return; }

    const user = findUser(email);
    msg.textContent = user ? "Enviamos un enlace de recuperación a tu email." : "Si el correo existe, recibirás un enlace de recuperación.";
    msg.style.display = "block";
  });

  const sess = getSession();
  if (sess && window.location.pathname.toLowerCase().includes("cuenta.html")) {
    // Redirección opcional si ya hay sesión:
    // window.location.href = "../index.html";
  }
})();