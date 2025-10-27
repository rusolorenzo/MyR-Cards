// === Integración con Stripe ===
const stripe = Stripe("pk_test_TU_CLAVE_PUBLICA_AQUI"); // ⚠️ reemplazá con tu clave pública
const elements = stripe.elements();

// Estilo del campo de tarjeta
const style = {
  base: {
    color: "#fff",
    fontFamily: "Poppins, sans-serif",
    fontSmoothing: "antialiased",
    fontSize: "16px",
    "::placeholder": { color: "#aaa" },
  },
  invalid: { color: "#ff4d4d" },
};

// Montar el campo de tarjeta
const card = elements.create("card", { style });
card.mount("#card-element");

const form = document.getElementById("payment-form");
const payBtn = document.getElementById("pay-btn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  payBtn.disabled = true;
  payBtn.textContent = "Procesando...";

  // ⚙️ Llamar a tu servidor backend (ver paso siguiente)
  const res = await fetch("https://TU_DOMINIO.com/create-payment-intent.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: 1500 }), // monto en centavos (ej: 15.00 USD)
  });
  const data = await res.json();

  const { error } = await stripe.confirmCardPayment(data.clientSecret, {
    payment_method: {
      card,
      billing_details: { name: document.getElementById("cardholder-name").value },
    },
  });

  if (error) {
    alert("Error en el pago: " + error.message);
    payBtn.disabled = false;
    payBtn.textContent = "Pagar ahora";
  } else {
    alert("✅ Pago realizado correctamente");
    window.location.href = "../index.html";
  }
});
