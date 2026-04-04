const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");

const loadEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) return;

    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) return;

    let value = rawValue.trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value.replace(/\\n/g, "\n");
  });
};

loadEnvFile(path.join(__dirname, ".env"));

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const RESTAURANT_NAME = "The Moon Brussels";
const APP_PIN = (process.env.APP_PIN || "121030121030").trim();
const COMPANY_VAT_NUMBER = (process.env.COMPANY_VAT_NUMBER || "BE 0773 802 850").trim();
const TELEGRAM_BOT_TOKEN = (process.env.TELEGRAM_BOT_TOKEN || "").trim();
const TELEGRAM_CHAT_ID = (process.env.TELEGRAM_CHAT_ID || "").trim();
const AUTH_COOKIE_NAME = "moon_pos_auth";
const AUTH_SESSION_TTL_MS = 1000 * 60 * 60 * 12;
const ROOM_LABELS = {
  normal: "Salle normale",
  vip: "Salle VIP"
};
const DATA_DIR = path.join(__dirname, "data");
const TICKETS_FILE = path.join(DATA_DIR, "tickets.json");
const CLIENT_TICKET_RETENTION_DAYS = 15;
const DAILY_TICKET_RETENTION_MONTHS = 3;

// Menu complet (ASCII pour compatibilite)
const menu = [
  {
    id: "entrees",
    label: "Entrees",
    items: [
      { id: "scampis-ail", name: "Scampis a l'ail", price: 12.0 },
      { id: "scampis-diabolique", name: "Scampis diabolique", price: 12.0 },
      { id: "carpaccio", name: "Carpaccio", price: 15.0 },
      { id: "calamars-10pcs", name: "Calamars (10pcs)", price: 13.0 },
      { id: "salade-cesar", name: "Salade Cesar", price: 13.0 },
      { id: "burrata", name: "Burrata", price: 13.0 },
      { id: "croquettes-fromage", name: "Croquettes de fromage", price: 12.0 }
    ]
  },
  {
    id: "pates",
    label: "Pates",
    items: [
      { id: "poulet-champignons", name: "Poulet & Champignons", price: 15.0 },
      { id: "poulet-pesto", name: "Poulet au pesto", price: 15.0 },
      { id: "arrabiata", name: "Arrabiata", price: 15.0 },
      { id: "truffe", name: "Truffe", price: 15.0 },
      { id: "scampis-diabolique-pates", name: "Scampis diabolique", price: 15.0 }
    ]
  },
  {
    id: "burgers",
    label: "Burgers",
    items: [
      { id: "burger-boeuf-wagyu", name: "Burger boeuf wagyu", price: 16.0 },
      { id: "burger-chicken", name: "Burger chicken", price: 15.0 }
    ]
  },
  {
    id: "viandes",
    label: "Nos Viandes",
    items: [
      { id: "filet-pur-boeuf", name: "Filet pur de boeuf", price: 32.0 },
      { id: "steak-boeuf", name: "Steak de boeuf", price: 26.0 },
      { id: "cotelette-agneau-nz", name: "Cotelette d'agneau Nouvelle-Zelande", price: 32.0 },
      { id: "cote-os-argentin-700", name: "Cote a l'os argentin (700gr)", price: 45.0 },
      { id: "entrecote-argentine", name: "Entrecote argentine", price: 32.0 },
      { id: "souris-agneau-marocaine", name: "Souris d'agneau facon marocaine", price: 26.0 }
    ]
  },
  {
    id: "volailles",
    label: "Nos Volailles",
    items: [
      { id: "bouche-a-la-reine", name: "Bouche a la reine", price: 22.0 },
      { id: "escalope-poulet-panne", name: "Escalope de poulet panne", price: 22.5 },
      { id: "escalope-grillee", name: "Escalope grillee", price: 21.5 },
      { id: "cordon-bleu-maison", name: "Cordon bleu maison", price: 23.0 }
    ]
  },
  {
    id: "poisson",
    label: "Nos Poisson",
    items: [
      { id: "dos-cabillaud", name: "Dos de cabillaud", price: 26.0 },
      { id: "filet-dorade", name: "Filet de dorade", price: 24.0 },
      { id: "saumon", name: "Saumon", price: 26.0 }
    ]
  },
  {
    id: "pizza",
    label: "Nos Pizza",
    items: [
      { id: "margarita", name: "Margarita", price: 12.5 },
      { id: "chicken", name: "Chicken", price: 13.5 },
      { id: "chicken-barbecue", name: "Chicken barbecue", price: 13.5 },
      { id: "quattro-fromage", name: "Quattro fromage", price: 13.5 },
      { id: "jambon-cuit", name: "Jambon cuit", price: 13.5 },
      { id: "scampis", name: "Scampis", price: 14.5 },
      { id: "marinara", name: "Marinara", price: 15.0 },
      { id: "fruits-de-mer", name: "Fruits de mer", price: 15.0 },
      { id: "arabia", name: "Arabia", price: 15.0 },
      { id: "viande-hachee", name: "Viande hachee", price: 13.5 },
      { id: "hawaienne", name: "Hawaienne", price: 13.5 },
      { id: "vegetarienne", name: "Vegetarienne", price: 13.5 },
      { id: "quatre-saisons", name: "4 Saisons", price: 13.5 },
      { id: "la-belgienne", name: "La belgienne", price: 15.0 },
      { id: "la-parisienne", name: "La parisienne", price: 13.5 },
      { id: "rio", name: "Rio", price: 13.5 },
      { id: "folla", name: "Folla", price: 13.5 }
    ]
  },
  {
    id: "desserts",
    label: "Nos Desserts",
    items: [
      { id: "creme-brulee", name: "Creme brulee", price: 8.0 },
      { id: "mousse-chocolat", name: "Mousse au chocolat", price: 8.0 },
      { id: "fondant-chocolat", name: "Fondant chocolat accompagne d'une boule vanille", price: 8.0 },
      { id: "tiramisu-boudoir", name: "Tiramisu boudoir maison", price: 8.0 },
      { id: "tiramisu-speculose", name: "Tiramisu speculose maison", price: 8.0 },
      { id: "tarte-pomme", name: "Tarte pomme", price: 8.0 },
      { id: "saint-sebastian", name: "Saint Sebastian (coulis pistach / coulis nutella)", price: 10.0 }
    ]
  },
  {
    id: "softs",
    label: "Nos Soft",
    items: [
      { id: "coca-cola", name: "Coca Cola", price: 4.0 },
      { id: "coca-cola-zero", name: "Coca Cola zero", price: 4.0 },
      { id: "fanta", name: "Fanta", price: 4.0 },
      { id: "sprite", name: "Sprite", price: 4.0 },
      { id: "red-bull", name: "Red Bull", price: 5.0 },
      { id: "ice-tea", name: "Ice Tea", price: 4.0 },
      { id: "ice-tea-peche", name: "Ice Tea peche", price: 4.0 },
      { id: "oasis-tropical", name: "Oasis Tropical", price: 4.0 },
      { id: "looza", name: "Looza (Orange, Pomme, Fraise, Framboise, Ananas, Mangue)", price: 4.0 },
      { id: "eau-plate", name: "Eau plate", price: 4.0 },
      { id: "perrier", name: "Perrier", price: 4.0 }
    ]
  },
  {
    id: "alcools",
    label: "Alcools",
    items: [
      { id: "baileys", name: "Bailey's", price: 8.0 },
      { id: "vodka", name: "Vodka (Absolut, Smirnoff, Eristoff)", price: 12.0 },
      { id: "vodka-premium", name: "Vodka Premium (Belvedere, Grey Goose)", price: 15.0 },
      { id: "whisky", name: "Whisky (Jack Daniels, Jameson, Red Label)", price: 13.0 },
      { id: "whisky-premium", name: "Whisky Premium (Chivas 12, Glenfiddich 12)", price: 15.0 },
      { id: "rhum", name: "Rhum (Havana Club, Bacardi, Captain Morgan)", price: 12.0 },
      { id: "rhum-premium", name: "Rhum Premium (Diplomatico, Zacapa, Don Papa)", price: 15.0 },
      { id: "gin", name: "Gin (Beefeater, Bombay)", price: 12.0 },
      { id: "cognac", name: "Cognac (Hennessy VS, Courvoisier)", price: 15.0 }
    ]
  },
  {
    id: "mocktails",
    label: "Nos Mocktails",
    items: [
      { id: "the-moon-rose", name: "The Moon Rose", price: 9.0 },
      { id: "blue-lady", name: "Blue Lady", price: 9.0 },
      { id: "fleur-amour", name: "Fleur d'Amour", price: 9.0 },
      { id: "pina-colada", name: "Pina Colada", price: 9.0 },
      { id: "sex-on-the-beach", name: "Sex on the beach", price: 9.0 }
    ]
  },
  {
    id: "mojitos",
    label: "Nos Mojitos",
    items: [
      { id: "mojito-fraise", name: "Mojito Fraise", price: 9.0 },
      { id: "mojito-peche", name: "Mojito Peche", price: 9.0 },
      { id: "mojito-violette", name: "Mojito Violette", price: 9.0 },
      { id: "mojito-pasteque", name: "Mojito Pasteque", price: 9.0 },
      { id: "mojito-passion", name: "Mojito Fruit de la passion", price: 9.0 },
      { id: "mojito-blue-lagoon", name: "Mojito Blue Lagoon", price: 9.0 }
    ]
  },
  {
    id: "anniversaire",
    label: "Anniversaire",
    items: [
      {
        id: "menu-elegance",
        name: "Menu Elegance - Escalope de poulet",
        price: 35.0
      },
      {
        id: "menu-prestige",
        name: "Menu Prestige - Filet de dorade ou saumon",
        price: 40.0
      },
      {
        id: "menu-excellence",
        name: "Menu Excellence - Carre de boeuf",
        price: 45.0
      }
    ]
  }
];

const createRoomTables = (roomId, count, startId) =>
  Array.from({ length: count }, (_, idx) => ({
    id: startId + idx,
    number: idx + 1,
    room: roomId,
    roomLabel: ROOM_LABELS[roomId] || roomId,
    status: "free",
    orderId: null
  }));

const tables = [
  ...createRoomTables("normal", 16, 1),
  ...createRoomTables("vip", 8, 101)
];

const orders = new Map();
const settledTickets = [];
const ticketCountersByDate = new Map();
const pinSessions = new Map();

const computeTotal = (items = []) =>
  items.reduce((acc, item) => acc + item.price * item.qty, 0);

const sanitizeItems = (items = []) =>
  (Array.isArray(items) ? items : [])
    .map((item) => {
      const price = Number(item && item.price);
      const qty = Math.round(Number(item && item.qty));
      return {
        ...item,
        price: Number.isFinite(price) ? Math.round(price * 100) / 100 : NaN,
        qty: Number.isFinite(qty) ? qty : 0
      };
    })
    .filter(
      (item) =>
        item &&
        typeof item.name === "string" &&
        item.name.trim().length > 0 &&
        Number.isFinite(item.price) &&
        item.qty > 0
    );

const getDateKey = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
};

const getClientTicketCutoff = (now = new Date()) => {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - CLIENT_TICKET_RETENTION_DAYS);
  return cutoff;
};

const getDailyTicketCutoff = (now = new Date()) => {
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - DAILY_TICKET_RETENTION_MONTHS);
  return cutoff;
};

const isTicketOnOrAfter = (ticket, cutoff) => {
  const parsed = new Date(ticket && ticket.date);
  return !Number.isNaN(parsed.getTime()) && parsed >= cutoff;
};

const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

const saveTickets = () => {
  ensureDataDir();
  fs.writeFileSync(TICKETS_FILE, JSON.stringify(settledTickets, null, 2), "utf8");
};

const rebuildTicketCounters = () => {
  ticketCountersByDate.clear();
  settledTickets.forEach((ticket) => {
    const dateKey = ticket.ticketDateKey || getDateKey(ticket.date);
    const ticketNumber = Number(ticket.ticketNumber) || 0;
    if (!dateKey || ticketNumber < 1) return;
    const current = ticketCountersByDate.get(dateKey) || 0;
    if (ticketNumber > current) {
      ticketCountersByDate.set(dateKey, ticketNumber);
    }
  });
};

const purgeExpiredTickets = ({ persist = true } = {}) => {
  const cutoff = getDailyTicketCutoff();
  const kept = settledTickets.filter((ticket) => isTicketOnOrAfter(ticket, cutoff));
  if (kept.length === settledTickets.length) return;
  settledTickets.length = 0;
  settledTickets.push(...kept);
  rebuildTicketCounters();
  if (persist) saveTickets();
};

const loadTickets = () => {
  ensureDataDir();
  if (!fs.existsSync(TICKETS_FILE)) return;
  try {
    const parsed = JSON.parse(fs.readFileSync(TICKETS_FILE, "utf8"));
    if (!Array.isArray(parsed)) return;
    settledTickets.push(...parsed.filter((ticket) => ticket && typeof ticket === "object"));
    purgeExpiredTickets({ persist: false });
    rebuildTicketCounters();
  } catch (_error) {
    settledTickets.length = 0;
  }
};

const nextTicketNumberForDate = (dateKey) => {
  const current = ticketCountersByDate.get(dateKey) || 0;
  const next = current + 1;
  ticketCountersByDate.set(dateKey, next);
  return next;
};

const computePaymentBreakdown = (items, paymentMethod, paymentAmounts) => {
  const totalTtc = computeTotal(items);
  const toMoney = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return 0;
    return Math.max(0, Math.round(num * 100) / 100);
  };
  if (paymentAmounts && typeof paymentAmounts === "object") {
    const paidCash = toMoney(paymentAmounts.cash);
    const paidCard = toMoney(paymentAmounts.card);
    const paidTotal = Math.round((paidCash + paidCard) * 100) / 100;
    const changeDue = Math.max(0, Math.round((paidTotal - totalTtc) * 100) / 100);
    const totalCard = Math.min(paidCard, totalTtc);
    const totalCash = Math.max(0, Math.round((totalTtc - totalCard) * 100) / 100);
    return { totalCash, totalCard, paidCash, paidCard, changeDue };
  }
  if (paymentMethod === "cash") {
    return { totalCash: totalTtc, totalCard: 0, paidCash: totalTtc, paidCard: 0, changeDue: 0 };
  }
  return { totalCash: 0, totalCard: totalTtc, paidCash: 0, paidCard: totalTtc, changeDue: 0 };
};

const computePaymentMethodFromAmounts = (cash, card) => {
  const cashNum = Number(cash) || 0;
  const cardNum = Number(card) || 0;
  if (cashNum > 0 && cardNum > 0) return "split";
  if (cashNum > 0) return "cash";
  return "card";
};

const paymentMethodLabel = (method) => {
  if (method === "split") return "Mixte";
  if (method === "cash") return "Cash";
  return "Carte";
};

const formatMoney = (value) =>
  new Intl.NumberFormat("fr-BE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value || 0));

const formatDateTime = (value) =>
  new Intl.DateTimeFormat("fr-BE", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Brussels"
  }).format(new Date(value));

const buildTelegramTicketMessage = (ticket) => {
  const header = [
    "NOUVEAU TICKET ENCAISSE",
    ticket.restaurant || RESTAURANT_NAME,
    `Ticket #${String(ticket.ticketNumber).padStart(4, "0")}`,
    `Date: ${formatDateTime(ticket.date)}`,
    `Salle: ${ticket.roomLabel || ROOM_LABELS.normal}`,
    `Table: ${ticket.tableNumber || ticket.table}`,
    `Paiement: ${paymentMethodLabel(ticket.paymentMethod)}`
  ];

  const itemLines = (ticket.items || []).map(
    (line) => `- ${line.qty} x ${line.name} | ${formatMoney(line.price * line.qty)} EUR`
  );

  const totals = [
    `Total TTC: ${formatMoney(ticket.totalTtc)} EUR`,
    `Cash: ${formatMoney(ticket.paidCash ?? ticket.totalCash ?? 0)} EUR`,
    `Carte: ${formatMoney(ticket.paidCard ?? ticket.totalCard ?? 0)} EUR`
  ];

  if ((ticket.changeDue || 0) > 0) {
    totals.push(`Rendu: ${formatMoney(ticket.changeDue)} EUR`);
  }

  return [...header, "", "Articles:", ...(itemLines.length ? itemLines : ["- Aucun article"]), "", ...totals].join("\n");
};

const buildDailyReportData = (dateKey) => {
  const todayTickets = settledTickets.filter((t) => {
    const sameDay = new Date(t.date).toISOString().slice(0, 10) === dateKey;
    if (!sameDay) return false;
    if (t.isDeleted) return false;
    if (t.isModified && !t.includeInDaily) return false;
    return true;
  });

  const total = todayTickets.reduce((sum, t) => sum + (t.totalTtc || 0), 0);
  const totalCash = todayTickets.reduce((sum, t) => {
    if (typeof t.totalCash === "number") return sum + t.totalCash;
    if (t.paymentMethod === "cash") return sum + (t.totalTtc || 0);
    return sum;
  }, 0);
  const totalCard = todayTickets.reduce((sum, t) => {
    if (typeof t.totalCard === "number") return sum + t.totalCard;
    if (t.paymentMethod !== "cash") return sum + (t.totalTtc || 0);
    return sum;
  }, 0);

  const items = {};
  todayTickets.forEach((ticket) => {
    ticket.items.forEach((line) => {
      const entry = items[line.name] || { name: line.name, qty: 0, total: 0 };
      entry.qty += line.qty;
      entry.total += line.price * line.qty;
      items[line.name] = entry;
    });
  });

  return {
    date: dateKey,
    vatNumber: COMPANY_VAT_NUMBER || null,
    totalTtc: total,
    totalCash,
    totalCard,
    tickets: todayTickets,
    items: Object.values(items)
  };
};

const buildTelegramDailyReportMessage = (report) => {
  const itemLines = (report.items || []).map(
    (line) => `- ${line.qty} x ${line.name} | ${formatMoney(line.total)} EUR`
  );

  return [
    "TICKET DE LA JOURNEE",
    RESTAURANT_NAME,
    `Date: ${report.date}`,
    "",
    `Cash: ${formatMoney(report.totalCash)} EUR`,
    `Carte: ${formatMoney(report.totalCard)} EUR`,
    `Total TTC: ${formatMoney(report.totalTtc)} EUR`,
    "",
    "Recap articles:",
    ...(itemLines.length ? itemLines : ["- Aucun ticket pour cette date"])
  ].join("\n");
};

const sendTelegramMessage = async (text) => {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return { sent: false, reason: "disabled" };
  }

  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Telegram API ${response.status}: ${errorText}`);
  }

  return { sent: true };
};

const createOrder = (tableId) => {
  const id = `${Date.now()}-${tableId}-${Math.floor(Math.random() * 9999)}`;
  const order = {
    id,
    tableId,
    items: [],
    status: "open",
    sentToKitchen: false,
    createdAt: new Date().toISOString()
  };
  orders.set(id, order);
  return order;
};

const findTable = (tableId) => tables.find((t) => t.id === tableId);

const parseCookies = (cookieHeader = "") =>
  cookieHeader.split(";").reduce((acc, chunk) => {
    const [rawKey, ...rest] = chunk.split("=");
    const key = (rawKey || "").trim();
    if (!key) return acc;
    acc[key] = decodeURIComponent(rest.join("=").trim());
    return acc;
  }, {});

const clearAuthCookie = (res) => {
  res.setHeader(
    "Set-Cookie",
    `${AUTH_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`
  );
};

const createAuthCookie = (token) =>
  `${AUTH_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${Math.floor(
    AUTH_SESSION_TTL_MS / 1000
  )}`;

const purgeExpiredPinSessions = () => {
  const now = Date.now();
  for (const [token, expiresAt] of pinSessions.entries()) {
    if (expiresAt <= now) {
      pinSessions.delete(token);
    }
  }
};

const isPinAuthenticated = (req) => {
  purgeExpiredPinSessions();
  const cookies = parseCookies(req.headers.cookie || "");
  const token = cookies[AUTH_COOKIE_NAME];
  if (!token) return false;
  const expiresAt = pinSessions.get(token);
  if (!expiresAt || expiresAt <= Date.now()) {
    pinSessions.delete(token);
    return false;
  }
  return true;
};

const requirePinAuth = (req, res, next) => {
  if (isPinAuthenticated(req)) {
    return next();
  }
  clearAuthCookie(res);
  return res.status(401).json({ error: "Code PIN requis" });
};

loadTickets();
purgeExpiredTickets();

app.get("/api/auth/status", (req, res) => {
  const authenticated = isPinAuthenticated(req);
  if (!authenticated) {
    clearAuthCookie(res);
  }
  res.json({ authenticated });
});

app.post("/api/auth/pin", (req, res) => {
  const pin = String((req.body && req.body.pin) || "").trim();
  if (pin !== APP_PIN) {
    clearAuthCookie(res);
    return res.status(401).json({ error: "Code PIN invalide" });
  }
  const token = crypto.randomBytes(24).toString("hex");
  pinSessions.set(token, Date.now() + AUTH_SESSION_TTL_MS);
  res.setHeader("Set-Cookie", createAuthCookie(token));
  return res.json({ authenticated: true });
});

app.use("/api", requirePinAuth);

app.get("/api/menu", (_req, res) => {
  res.json(menu);
});

app.get("/api/tables", (_req, res) => {
  res.json(tables);
});

app.post("/api/tables/:id/open", (req, res) => {
  const tableId = Number(req.params.id);
  const table = findTable(tableId);
  if (!table) {
    return res.status(404).json({ error: "Table introuvable" });
  }
  if (!table.orderId) {
    const order = createOrder(tableId);
    table.orderId = order.id;
    table.status = "occupied";
  } else if (table.status === "free") {
    table.status = "occupied";
  }
  const order = orders.get(table.orderId);
  return res.json({ table, order });
});

app.get("/api/orders/:id", (req, res) => {
  const order = orders.get(req.params.id);
  if (!order) {
    return res.status(404).json({ error: "Commande introuvable" });
  }
  res.json(order);
});

app.put("/api/orders/:id", (req, res) => {
  const order = orders.get(req.params.id);
  if (!order) {
    return res.status(404).json({ error: "Commande introuvable" });
  }
  const { items = [] } = req.body || {};
  order.items = Array.isArray(items) ? items : order.items;
  order.total = computeTotal(order.items);
  res.json(order);
});

app.post("/api/orders/:id/send-kitchen", (req, res) => {
  const order = orders.get(req.params.id);
  if (!order) {
    return res.status(404).json({ error: "Commande introuvable" });
  }
  order.sentToKitchen = true;
  res.json(order);
});

app.post("/api/orders/:id/mark-to-pay", (req, res) => {
  const order = orders.get(req.params.id);
  if (!order) {
    return res.status(404).json({ error: "Commande introuvable" });
  }
  const table = findTable(order.tableId);
  table.status = "to_pay";
  order.status = "to_pay";
  res.json({ table, order });
});

app.post("/api/orders/:id/settle", async (req, res) => {
  const order = orders.get(req.params.id);
  if (!order) {
    return res.status(404).json({ error: "Commande introuvable" });
  }
  const table = findTable(order.tableId);
  const paymentMethod = (req.body && req.body.paymentMethod) || "card";
  const paymentAmounts = req.body && req.body.paymentAmounts;
  const dateOverride = req.body && req.body.dateOverride;
  const parsedDate = dateOverride ? new Date(dateOverride) : null;
  const ticketDate =
    parsedDate && !Number.isNaN(parsedDate.getTime())
      ? parsedDate.toISOString()
      : new Date().toISOString();
  const ticketDateKey = getDateKey(ticketDate) || new Date().toISOString().slice(0, 10);
  const ticketNumber = nextTicketNumberForDate(ticketDateKey);
  const { totalCash, totalCard, paidCash, paidCard, changeDue } = computePaymentBreakdown(
    order.items,
    paymentMethod,
    paymentAmounts
  );
  const totalTtc = computeTotal(order.items);
  const paidTotal = Math.round((paidCash + paidCard) * 100) / 100;
  if (paidTotal + 0.01 < totalTtc) {
    return res.status(400).json({
      error: "Montant de paiement invalide",
      expectedTotal: totalTtc,
      paidTotal
    });
  }
  const ticket = {
    id: `${Date.now()}-${Math.floor(Math.random() * 99999)}`,
    restaurant: RESTAURANT_NAME,
    vatNumber: COMPANY_VAT_NUMBER || null,
    ticketNumber,
    ticketDateKey,
    table: table.id,
    tableNumber: table.number || table.id,
    room: table.room || "normal",
    roomLabel: table.roomLabel || ROOM_LABELS.normal,
    orderId: order.id,
    items: order.items,
    totalTtc,
    paymentMethod,
    totalCash,
    totalCard,
    paidCash,
    paidCard,
    changeDue,
    date: ticketDate,
    isDeleted: false,
    isModified: false,
    includeInDaily: true
  };
  settledTickets.push(ticket);
  saveTickets();
  table.status = "free";
  table.orderId = null;
  order.status = "settled";
  orders.delete(order.id);
  try {
    await sendTelegramMessage(buildTelegramTicketMessage(ticket));
  } catch (error) {
    console.error("Impossible d'envoyer le ticket vers Telegram", error);
  }
  res.json(ticket);
});

app.get("/api/tickets", (_req, res) => {
  purgeExpiredTickets();
  const cutoff = getClientTicketCutoff();
  const sorted = [...settledTickets]
    .filter((ticket) => isTicketOnOrAfter(ticket, cutoff))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(sorted);
});

app.patch("/api/tickets/:id", (req, res) => {
  purgeExpiredTickets();
  const ticket = settledTickets.find((t) => t.id === req.params.id);
  if (!ticket) {
    return res.status(404).json({ error: "Ticket introuvable" });
  }
  if (ticket.isDeleted) {
    return res.status(400).json({ error: "Ticket supprime" });
  }
  const paidCash = Number(req.body && req.body.paidCash);
  const paidCard = Number(req.body && req.body.paidCard);
  const hasCash = Number.isFinite(paidCash);
  const hasCard = Number.isFinite(paidCard);
  const nextItems = Array.isArray(req.body && req.body.items) ? sanitizeItems(req.body.items) : ticket.items || [];
  const nextPaidCash = hasCash ? Math.max(0, Math.round(paidCash * 100) / 100) : ticket.paidCash || 0;
  const nextPaidCard = hasCard ? Math.max(0, Math.round(paidCard * 100) / 100) : ticket.paidCard || 0;
  const paidTotal = Math.round((nextPaidCash + nextPaidCard) * 100) / 100;
  const totalTtc = computeTotal(nextItems);
  if (paidTotal + 0.01 < totalTtc) {
    return res.status(400).json({
      error: "Montant de paiement invalide",
      expectedTotal: totalTtc,
      paidTotal
    });
  }
  const method = computePaymentMethodFromAmounts(nextPaidCash, nextPaidCard);
  const { totalCash, totalCard, paidCash: finalPaidCash, paidCard: finalPaidCard, changeDue } =
    computePaymentBreakdown(nextItems, method, {
      cash: nextPaidCash,
      card: nextPaidCard
    });
  const includeInDaily =
    typeof req.body.includeInDaily === "boolean"
      ? req.body.includeInDaily
      : ticket.includeInDaily;
  const changed =
    JSON.stringify(nextItems) !== JSON.stringify(ticket.items || []) ||
    nextPaidCash !== (ticket.paidCash || 0) ||
    nextPaidCard !== (ticket.paidCard || 0) ||
    includeInDaily !== ticket.includeInDaily;
  if (changed) {
    ticket.isModified = true;
    ticket.items = nextItems;
    ticket.totalTtc = totalTtc;
    ticket.includeInDaily = includeInDaily;
    ticket.paymentMethod = method;
    ticket.totalCash = totalCash;
    ticket.totalCard = totalCard;
    ticket.paidCash = finalPaidCash;
    ticket.paidCard = finalPaidCard;
    ticket.changeDue = changeDue;
    ticket.modifiedAt = new Date().toISOString();
    saveTickets();
  }
  res.json(ticket);
});

app.delete("/api/tickets/:id", (req, res) => {
  purgeExpiredTickets();
  const ticket = settledTickets.find((t) => t.id === req.params.id);
  if (!ticket) {
    return res.status(404).json({ error: "Ticket introuvable" });
  }
  ticket.isDeleted = true;
  ticket.isModified = true;
  ticket.includeInDaily = false;
  ticket.modifiedAt = new Date().toISOString();
  saveTickets();
  res.json(ticket);
});

app.get("/api/reports/daily", (_req, res) => {
  purgeExpiredTickets();
  const queryDate = getDateKey(_req.query.date);
  const todayKey = new Date().toISOString().slice(0, 10);
  const targetKey = queryDate || todayKey;
  res.json(buildDailyReportData(targetKey));
});

app.post("/api/reports/daily/send", async (req, res) => {
  purgeExpiredTickets();
  const queryDate = getDateKey(req.body && req.body.date);
  const todayKey = new Date().toISOString().slice(0, 10);
  const targetKey = queryDate || todayKey;
  const report = buildDailyReportData(targetKey);

  try {
    const result = await sendTelegramMessage(buildTelegramDailyReportMessage(report));
    res.json({ ok: true, sent: result.sent, date: targetKey });
  } catch (error) {
    console.error("Impossible d'envoyer le ticket journalier vers Telegram", error);
    res.status(500).json({ ok: false, error: "Envoi Telegram impossible" });
  }
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Serveur tactile pret sur http://localhost:${PORT}`);
});
