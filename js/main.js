const services = {
  wash: "Мойка",
  interior: "Химчистка",
  tint: "Тонировка",
  protect: "Защитные покрытия",
  film: "Оклейка",
  engine: "Мойка подкапотного",
  polish: "Кузов, фары, сколы",
  other: "Пока не знаю",
};

const progress = document.querySelector("[data-progress]");
const hero = document.querySelector(".hero");
const word = document.querySelector(".word__main");
const toggle = document.querySelector(".nav-toggle");
const sheet = document.querySelector("#sheet");
const compare = document.querySelector("[data-compare]");
const gloss = compare.querySelector("[data-gloss]");
const inner = compare.querySelector("[data-inner]");
const handle = compare.querySelector("[data-handle]");
const form = document.querySelector("#order");
const status = document.querySelector(".form-status");
const serviceSelect = document.querySelector("#service");

function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const value = max > 0 ? window.scrollY / max : 0;
  progress.style.transform = `scaleX(${value})`;
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

if (word) {
  hero.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    const rect = hero.getBoundingClientRect();
    hero.classList.add("is-hot");
    word.style.setProperty("--mx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
    word.style.setProperty("--my", `${((event.clientY - rect.top) / rect.height) * 100}%`);
  });

  hero.addEventListener("pointerleave", () => {
    hero.classList.remove("is-hot");
    word.style.removeProperty("--mx");
    word.style.removeProperty("--my");
  });
}

function setMenu(open) {
  document.body.classList.toggle("is-open", open);
  sheet.hidden = !open;
  toggle.setAttribute("aria-expanded", String(open));
  toggle.textContent = open ? "Закрыть" : "Меню";
}

toggle.addEventListener("click", () => setMenu(sheet.hidden));
sheet.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});
window.addEventListener("resize", () => {
  if (window.innerWidth > 800) setMenu(false);
});

let percent = 62;
let pointerId = null;

function paint(next) {
  percent = Math.min(100, Math.max(0, next));
  gloss.style.width = `${percent}%`;
  handle.style.left = `${percent}%`;
  handle.setAttribute("aria-valuenow", String(Math.round(percent)));
  inner.style.width = `${compare.clientWidth}px`;
  inner.style.height = `${compare.clientHeight}px`;
}

function moveTo(clientX) {
  const rect = compare.getBoundingClientRect();
  if (!rect.width) return;
  const x = Math.min(rect.right, Math.max(rect.left, clientX));
  paint(((x - rect.left) / rect.width) * 100);
}

paint(percent);
new ResizeObserver(() => paint(percent)).observe(compare);

compare.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  pointerId = event.pointerId;
  moveTo(event.clientX);
  event.preventDefault();
});

window.addEventListener("pointermove", (event) => {
  if (pointerId !== event.pointerId) return;
  moveTo(event.clientX);
});

function endDrag(event) {
  if (pointerId !== event.pointerId) return;
  pointerId = null;
}

window.addEventListener("pointerup", endDrag);
window.addEventListener("pointercancel", endDrag);

handle.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    paint(percent - 4);
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    paint(percent + 4);
  }
});

const consent = form.querySelector("[name=consent]");
consent.addEventListener("change", () => consent.setCustomValidity(""));

document.querySelectorAll("[data-pick]").forEach((link) => {
  link.addEventListener("click", () => {
    const value = link.dataset.pick;
    if (services[value]) serviceSelect.value = value;
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  consent.setCustomValidity(consent.checked ? "" : "Нужно согласие на обработку персональных данных");
  if (!form.reportValidity()) return;

  const data = new FormData(form);
  const service = services[data.get("service")] || data.get("service");
  const text = [
    "Здравствуйте! Хочу записаться в AURA Detail 82.",
    `Имя: ${data.get("name")}`,
    `Телефон: ${data.get("phone")}`,
    `Автомобиль: ${data.get("car") || "не указан"}`,
    `Услуга: ${service}`,
    `Комментарий: ${data.get("note") || "—"}`,
  ].join("\n");
  const url = `https://t.me/+79785168445?text=${encodeURIComponent(text)}`;
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "Открыть Telegram";
  status.replaceChildren("Заявка собрана. ", link);
  link.click();
});
