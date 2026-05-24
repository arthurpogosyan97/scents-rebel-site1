import { createReadStream, existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { createServer } from "node:http";

const root = new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const port = Number(process.env.PORT || 4173);
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramChatId = process.env.TELEGRAM_CHAT_ID;

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
};

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) request.destroy();
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatRub(value) {
  return new Intl.NumberFormat("ru-RU").format(Number(value || 0)) + " ₽";
}

function buildTelegramMessage(payload) {
  const customer = payload.customer || {};
  const order = payload.order || {};
  const lines = Array.isArray(order.lines) ? order.lines : [];
  const items = lines
    .map((item) => `• ${escapeHtml(item.name)} × ${escapeHtml(item.quantity)} — ${formatRub(item.price * item.quantity)}`)
    .join("\n");

  return [
    "<b>Новый заказ SCENTS REBEL</b>",
    "",
    `<b>Имя:</b> ${escapeHtml(customer.name)}`,
    `<b>Телефон:</b> ${escapeHtml(customer.phone)}`,
    `<b>Адрес:</b> ${escapeHtml(customer.address)}`,
    "",
    "<b>Состав:</b>",
    items || "Нет товаров",
    "",
    `<b>Товары:</b> ${formatRub(order.subtotal)}`,
    `<b>Скидка:</b> ${formatRub(order.discount)}`,
    `<b>Доставка:</b> ${formatRub(order.delivery)}`,
    order.promo ? `<b>Промокод:</b> ${escapeHtml(order.promo)}` : "",
    `<b>Итого:</b> ${formatRub(order.total)}`,
  ]
    .filter(Boolean)
    .join("\n");
}

async function sendTelegramMessage(text) {
  if (!telegramToken || !telegramChatId) {
    throw new Error("Telegram не настроен: нужны TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID");
  }

  const response = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: telegramChatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Telegram вернул ошибку ${response.status}`);
  }
}

createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://localhost:${port}`);

  if (url.pathname === "/api/order" && request.method === "POST") {
    try {
      const payload = await readJson(request);
      await sendTelegramMessage(buildTelegramMessage(payload));
      response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({ ok: true }));
    } catch (error) {
      response.writeHead(500, { "content-type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({ ok: false, message: error.message }));
    }
    return;
  }

  const requested = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const filePath = normalize(join(root, requested));

  if (!filePath.startsWith(normalize(root)) || !existsSync(filePath)) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  response.writeHead(200, { "content-type": types[extname(filePath)] || "application/octet-stream" });
  createReadStream(filePath).pipe(response);
}).listen(port, () => {
  console.log(`Аромасвечи: http://localhost:${port}`);
});
