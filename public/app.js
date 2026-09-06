const state = {
  tables: [],
  activeRoom: "normal",
  menu: [],
  activeCategory: null,
  currentTable: null,
  currentOrder: null,
  saving: false,
  daily: null,
  printKitchen: true,
  paymentMethod: "card",
  history: [],
  selectedTicketId: null,
  selectedTicketSnapshot: null,
  selectedTicketDraftItems: [],
  historyIncludeTouched: false,
  historyEditCategoryId: null,
  authenticated: false,
  user: null,
  authSubmitting: false,
  appReady: false,
  eventsBound: false,
  serviceWorkerRegistered: false
};

let lastTicket = null;
let pendingPrintCleanup = null;
let appBootstrapPromise = null;
const RESTAURANT_NAME = "The Moon Brussels";

const authOverlay = document.getElementById("auth-overlay");
const authForm = document.getElementById("auth-form");
const authNameInput = document.getElementById("auth-name");
const authPinInput = document.getElementById("auth-pin");
const authErrorEl = document.getElementById("auth-error");
const authSubmitBtn = document.getElementById("auth-submit");
const tableGrid = document.getElementById("table-grid");
const categoryList = document.getElementById("category-list");
const itemList = document.getElementById("item-list");
const orderItemsEl = document.getElementById("order-items");
const orderTotalEl = document.getElementById("order-total");
const tablesPanel = document.getElementById("tables-panel");
const orderPanel = document.getElementById("order-panel");
const tableTitle = document.getElementById("table-title");
const tableStatusLabel = document.getElementById("table-status-label");
const kitchenStatus = document.getElementById("kitchen-status");
const ticketModal = document.getElementById("ticket-modal");
const ticketRestaurant = document.getElementById("ticket-restaurant");
const ticketMeta = document.getElementById("ticket-meta");
const ticketVat = document.getElementById("ticket-vat");
const ticketLines = document.getElementById("ticket-lines");
const ticketTotal = document.getElementById("ticket-total");
const emailTicketBtn = document.getElementById("email-ticket");
const dailyModal = document.getElementById("daily-modal");
const dailyRestaurant = document.getElementById("daily-restaurant");
const dailyDate = document.getElementById("daily-date");
const dailyVat = document.getElementById("daily-vat");
const dailyLines = document.getElementById("daily-lines");
const dailyTotal = document.getElementById("daily-total");
const paymentModal = document.getElementById("payment-modal");
const confirmPaymentBtn = document.getElementById("confirm-payment");
const cancelPaymentBtn = document.getElementById("cancel-payment");
const paymentCashInput = document.getElementById("payment-cash");
const paymentCardInput = document.getElementById("payment-card");
const paymentTotalHint = document.getElementById("payment-total-hint");
const historyModal = document.getElementById("history-modal");
const historyListEl = document.getElementById("history-list");
const historySummaryEl = document.getElementById("history-summary");
const historyEditMeta = document.getElementById("history-edit-meta");
const historyOrderTotalEl = document.getElementById("history-order-total");
const historyTicketItemsEl = document.getElementById("history-ticket-items");
const historyCategorySelect = document.getElementById("history-category");
const historyItemSelect = document.getElementById("history-item");
const historyAddItemBtn = document.getElementById("history-add-item");
const historyCashInput = document.getElementById("history-cash");
const historyCardInput = document.getElementById("history-card");
const historyIncludeDaily = document.getElementById("history-include-daily");
const historyHint = document.getElementById("history-hint");
const historySaveBtn = document.getElementById("history-save");
const historyCloseBtn = document.getElementById("history-close");
const roomNormalBtn = document.getElementById("room-normal");
const roomVipBtn = document.getElementById("room-vip");
const optionModal = document.getElementById("option-modal");
const optionTitleEl = document.getElementById("option-title");
const optionSubtitleEl = document.getElementById("option-subtitle");
const optionListEl = document.getElementById("option-list");
const optionCancelBtn = document.getElementById("option-cancel");
const currentUserEl = document.getElementById("current-user");
const managerOnlyEls = Array.from(document.querySelectorAll(".manager-only"));
const staffManagementBtn = document.getElementById("staff-management");
const staffReportBtn = document.getElementById("staff-report");
const logoutBtn = document.getElementById("logout-btn");
const staffModal = document.getElementById("staff-modal");
const staffCreateForm = document.getElementById("staff-create-form");
const staffCreateName = document.getElementById("staff-create-name");
const staffCreatePin = document.getElementById("staff-create-pin");
const staffList = document.getElementById("staff-list");
const closeStaffBtn = document.getElementById("close-staff");
const staffReportModal = document.getElementById("staff-report-modal");
const staffReportDate = document.getElementById("staff-report-date");
const staffReportList = document.getElementById("staff-report-list");
const closeStaffReportBtn = document.getElementById("close-staff-report");
const ACCOMPANIMENT_PRICE = 0;
const SAUCE_PRICE = 0;
const GRATIN_PRICE = 2;
const CATEGORIES_WITH_ACCOMPANIMENT = new Set(["viandes", "poisson", "volailles", "anniversaire"]);
const CATEGORIES_WITH_SAUCE = new Set(["viandes", "volailles", "anniversaire"]);
const CATEGORIES_WITH_COOKING = new Set(["viandes"]);
const CATEGORIES_WITH_GRATIN = new Set(["volailles", "pates"]);
const CATEGORIES_WITH_ENTREE = new Set(["anniversaire"]);
const CATEGORIES_WITH_ALCOHOL_OPTION = new Set(["mocktails", "mojitos"]);
const ANNIV_ITEMS_WITH_COOKING = new Set(["menu-excellence"]);
const ALCOHOL_SUPPLEMENT_PRICE = 3;
const ACCOMPANIMENT_OPTIONS = [
  { id: "frites", label: "Frites" },
  { id: "trio-legumes", label: "Trio de legumes" },
  { id: "pomme-terre-saute", label: "Pomme de terre saute" },
  { id: "riz", label: "Riz" },
  { id: "pates", label: "Pates" },
  { id: "puree", label: "Puree de pomme de terre" },
  { id: "frites-patate-douce", label: "Frites de patate douce" }
];
const ANNIV_ACCOMPANIMENT_OPTIONS = [
  { id: "frites", label: "Frites" },
  { id: "pates", label: "Pates" },
  { id: "riz", label: "Riz" }
];
const SAUCE_OPTIONS = [
  { id: "sauce-champignon", label: "Sauce champignon" },
  { id: "sauce-poivre-vert", label: "Sauce poivre vert" },
  { id: "sauce-fromagere", label: "Sauce fromagere" }
];
const ANNIV_SAUCE_OPTIONS = [
  { id: "sauce-poivre", label: "Sauce poivre" },
  { id: "sauce-champignon", label: "Sauce champignon" },
  { id: "sauce-citron", label: "Sauce citron" }
];
const ANNIV_ENTREE_OPTIONS_BY_ITEM = {
  "menu-elegance": [
    { id: "croquettes-fromage", label: "Croquettes de fromage dorees" },
    { id: "calamars-frits", label: "Calamars frits, sauce tartare maison" }
  ],
  "menu-prestige": [
    { id: "calamars-frits", label: "Calamars frits, sauce tartare maison" },
    { id: "scampis-diabolo-ail", label: "Scampis diabolo ou a l'ail" }
  ],
  "menu-excellence": [
    { id: "carpaccio-boeuf", label: "Carpaccio de boeuf" },
    { id: "scampis-ail-diabolo", label: "Scampis a l'ail ou Scampis diabolo" },
    { id: "burrata", label: "Burrata" }
  ]
};
const GRATIN_OPTIONS = [
  { id: "sans-gratin", label: "Sans gratin" },
  { id: "gratine", label: "Gratines (+2 EUR)" }
];
const COOKING_OPTIONS = [
  { id: "bleu", label: "Bleu" },
  { id: "saignant", label: "Saignant" },
  { id: "a-point", label: "a Point" },
  { id: "bien-cuit", label: "Bien Cuit" }
];
const ALCOHOL_OPTIONS = [
  { id: "sans-alcool", label: "Sans alcool" },
  { id: "alcoolise", label: `Alcoolise (+${ALCOHOL_SUPPLEMENT_PRICE} EUR)` }
];
let optionResolver = null;

const setAuthLocked = (locked) => {
  document.body.classList.toggle("app-locked", locked);
  if (authOverlay) authOverlay.classList.toggle("hidden", !locked);
  if (!locked && authErrorEl) authErrorEl.classList.add("hidden");
};

const setAuthError = (message = "") => {
  if (!authErrorEl) return;
  authErrorEl.textContent = message;
  authErrorEl.classList.toggle("hidden", !message);
};

const setAuthSubmitting = (submitting) => {
  state.authSubmitting = submitting;
  if (authNameInput) authNameInput.disabled = submitting;
  if (authPinInput) authPinInput.disabled = submitting;
  if (authSubmitBtn) authSubmitBtn.disabled = submitting;
};

const focusPinInput = () => {
  if (authNameInput && !authNameInput.value.trim()) {
    window.setTimeout(() => authNameInput.focus(), 50);
    return;
  }
  if (!authPinInput) return;
  window.setTimeout(() => authPinInput.focus(), 50);
};

const lockApp = (message = "") => {
  state.authenticated = false;
  state.user = null;
  updateUserInterface();
  setAuthError(message);
  setAuthLocked(true);
  focusPinInput();
};

const unlockApp = () => {
  state.authenticated = true;
  setAuthError("");
  setAuthLocked(false);
  if (authPinInput) authPinInput.value = "";
};

const api = async (url, options = {}) => {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  const payload = await res.json().catch(() => null);
  if (res.status === 401) {
    lockApp((payload && payload.error) || "Authentification requise");
  }
  if (!res.ok) {
    const error = new Error((payload && payload.error) || `Erreur ${res.status}`);
    error.status = res.status;
    error.payload = payload;
    throw error;
  }
  return payload;
};

const euros = (value) => `${value.toFixed(2)} EUR`;
const formatTicketNumber = (value) => {
  const num = Number(value);
  if (!Number.isInteger(num) || num < 1) return "N/A";
  return String(num).padStart(4, "0");
};
const hasVatNumber = (value) => typeof value === "string" && value.trim().length > 0;
const normalizeMoney = (value) => {
  const num = Number(String(value || "0").replace(",", "."));
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.round(num * 100) / 100);
};
const cloneItems = (items = []) => items.map((item) => ({ ...item }));
const computeItemsTotal = (items = []) => items.reduce((acc, curr) => acc + curr.price * curr.qty, 0);
const buildItemsSnapshotKey = (items = []) =>
  JSON.stringify(
    items.map(({ id, name, price, qty }) => ({
      id,
      name,
      price: normalizeMoney(price),
      qty: Math.max(0, Math.round(Number(qty) || 0))
    }))
  );
const computePaymentMethod = (totalCash, totalCard) => {
  if (totalCash > 0 && totalCard > 0) return "split";
  if (totalCash > 0) return "cash";
  return "card";
};
const updatePaymentTotalHint = () => {
  if (!paymentTotalHint || !state.currentOrder) return;
  const total = (state.currentOrder.items || []).reduce((acc, curr) => acc + curr.price * curr.qty, 0);
  const cash = normalizeMoney(paymentCashInput ? paymentCashInput.value : 0);
  const card = normalizeMoney(paymentCardInput ? paymentCardInput.value : 0);
  const entered = Math.round((cash + card) * 100) / 100;
  const diff = Math.round((total - entered) * 100) / 100;
  if (Math.abs(diff) < 0.01) {
    paymentTotalHint.textContent = `Total OK: ${euros(total)}`;
    return;
  }
  if (diff > 0) {
    paymentTotalHint.textContent = `Il manque ${euros(diff)} (total ${euros(total)})`;
    return;
  }
  paymentTotalHint.textContent = `Rendu client: ${euros(Math.abs(diff))} (total ${euros(total)})`;
};
const roomLabel = (room) => (room === "vip" ? "Salle VIP" : "Salle normale");
const tableNumberLabel = (table) => table.tableNumber || table.number || table.id;
const tableDisplayLabel = (table) => `${roomLabel(table.room)} - Table ${tableNumberLabel(table)}`;
const paymentMethodLabel = (method) => {
  if (method === "split") return "Mixte";
  if (method === "cash") return "Cash";
  return "Carte";
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");


const statusLabel = (status) => {
  if (status === "occupied") return "Occupee";
  if (status === "to_pay") return "A payer";
  return "Libre";
};

const renderTables = () => {
  tableGrid.innerHTML = "";
  const visibleTables = state.tables.filter((table) => (table.room || "normal") === state.activeRoom);
  visibleTables.forEach((table) => {
    const btn = document.createElement("button");
    btn.className = `table-card ${table.status}`;
    btn.setAttribute("aria-label", `${tableDisplayLabel(table)} ${table.status}`);
    btn.innerHTML = `
      <div class="table-number">Table ${tableNumberLabel(table)}</div>
      <div class="eyebrow">${roomLabel(table.room)}</div>
      <div class="badge ${table.status}">${statusLabel(table.status)}</div>
    `;
    btn.addEventListener("click", () => openTable(table.id));
    tableGrid.appendChild(btn);
  });
  if (roomNormalBtn) roomNormalBtn.classList.toggle("active", state.activeRoom === "normal");
  if (roomVipBtn) roomVipBtn.classList.toggle("active", state.activeRoom === "vip");
};

const renderCategories = () => {
  categoryList.innerHTML = "";
  state.menu.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = `chip ${state.activeCategory === cat.id ? "active" : ""}`;
    btn.textContent = cat.label;
    btn.addEventListener("click", () => {
      state.activeCategory = cat.id;
      renderCategories();
      renderItems();
    });
    categoryList.appendChild(btn);
  });
};

const renderItems = () => {
  itemList.innerHTML = "";
  const category = state.menu.find((c) => c.id === state.activeCategory) || state.menu[0];
  if (!category) return;
  const hasAccompaniment = CATEGORIES_WITH_ACCOMPANIMENT.has(category.id);
  const hasSauce = CATEGORIES_WITH_SAUCE.has(category.id);
  const hasAlcoholOption = CATEGORIES_WITH_ALCOHOL_OPTION.has(category.id);
  category.items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "item-card";
    const orderItems = state.currentOrder?.items || [];
    const qty = hasAccompaniment || hasAlcoholOption
      ? orderItems
          .filter((i) => i.sourceItemId === item.id || i.id === item.id)
          .reduce((acc, curr) => acc + (curr.qty || 0), 0)
      : orderItems.find((i) => i.id === item.id)?.qty || 0;
    let priceLabel = euros(item.price);
    const hasGratin = CATEGORIES_WITH_GRATIN.has(category.id);
    const hasEntree = CATEGORIES_WITH_ENTREE.has(category.id);
    if (hasAccompaniment && hasSauce) {
      priceLabel = `${euros(item.price)} + accompagnement inclus + sauce incluse`;
    } else if (hasAccompaniment) {
      priceLabel = `${euros(item.price)} + accompagnement inclus`;
    } else if (hasSauce) {
      priceLabel = `${euros(item.price)} + sauce incluse`;
    }
    if (hasEntree) {
      priceLabel = `${priceLabel} + entree incluse`;
    }
    if (category.id === "anniversaire") {
      priceLabel = `${priceLabel} + soft inclus`;
    }
    if (hasGratin) {
      priceLabel = `${priceLabel} + gratine en option ${euros(GRATIN_PRICE)}`;
    }
    if (hasAlcoholOption) {
      priceLabel = `${priceLabel} + alcoolise en option ${euros(ALCOHOL_SUPPLEMENT_PRICE)}`;
    }
    card.innerHTML = `
      <div>
        <h4>${item.name}</h4>
        <div class="price">${priceLabel}</div>
      </div>
      <div class="item-actions">
        <div class="quantity">
          <button aria-label="Diminuer" data-delta="-1">-</button>
          <div style="display:flex;align-items:center;justify-content:center;font-weight:700;">${qty}</div>
          <button aria-label="Augmenter" data-delta="1">+</button>
        </div>
      </div>
    `;
    card.querySelectorAll("button[data-delta]").forEach((btn) =>
      btn.addEventListener("click", () => updateItemQuantity(item, Number(btn.dataset.delta), category.id))
    );
    itemList.appendChild(card);
  });
};

const renderOrder = () => {
  orderItemsEl.innerHTML = "";
  const items = state.currentOrder?.items || [];
  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "order-line";
    li.innerHTML = `
      <h4>${item.name}</h4>
      <span class="price">x${item.qty}</span>
      <strong>${euros(item.price * item.qty)}</strong>
      <button type="button" class="order-line-delete" aria-label="Supprimer ${item.name}">Suppr.</button>
    `;
    li.addEventListener("click", () => updateItemQuantity(item, -1));
    const deleteBtn = li.querySelector(".order-line-delete");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        updateItemQuantity(item, -item.qty);
      });
    }
    orderItemsEl.appendChild(li);
  });
  const total = items.reduce((acc, curr) => acc + curr.price * curr.qty, 0);
  orderTotalEl.textContent = euros(total);
};

const closeOptionModal = () => {
  if (!optionModal) return;
  optionModal.classList.add("hidden");
  if (optionListEl) optionListEl.innerHTML = "";
  if (optionTitleEl) optionTitleEl.textContent = "Choix";
  if (optionSubtitleEl) optionSubtitleEl.textContent = "";
};

const resolveOption = (value) => {
  const resolver = optionResolver;
  optionResolver = null;
  closeOptionModal();
  if (resolver) resolver(value);
};

const pickFromModal = ({ title, subtitle, options }) =>
  new Promise((resolve) => {
    if (!optionModal || !optionListEl || !optionTitleEl || !optionSubtitleEl) {
      resolve(null);
      return;
    }
    if (optionResolver) {
      optionResolver(null);
      optionResolver = null;
    }
    optionResolver = resolve;
    optionTitleEl.textContent = title;
    optionSubtitleEl.textContent = subtitle;
    optionListEl.innerHTML = "";
    options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option-btn";
      btn.textContent = opt.label;
      btn.addEventListener("click", () => resolveOption(opt));
      optionListEl.appendChild(btn);
    });
    optionModal.classList.remove("hidden");
  });

const getAccompanimentOptions = (categoryId) =>
  categoryId === "anniversaire" ? ANNIV_ACCOMPANIMENT_OPTIONS : ACCOMPANIMENT_OPTIONS;

const getSauceOptions = (categoryId) =>
  categoryId === "anniversaire" ? ANNIV_SAUCE_OPTIONS : SAUCE_OPTIONS;

const getEntreeOptions = (itemId) => ANNIV_ENTREE_OPTIONS_BY_ITEM[itemId] || [];
const getIncludedSoftOptions = () => {
  const softCategory = state.menu.find((category) => category.id === "softs");
  if (!softCategory || !Array.isArray(softCategory.items)) return [];
  return softCategory.items.map((item) => ({ id: item.id, label: item.name }));
};
const itemNeedsCooking = (categoryId, itemId) =>
  CATEGORIES_WITH_COOKING.has(categoryId) || (categoryId === "anniversaire" && ANNIV_ITEMS_WITH_COOKING.has(itemId));

const pickAccompaniment = (itemName, categoryId) =>
  pickFromModal({
    title: `Accompagnement - ${itemName}`,
    subtitle: "Inclus",
    options: getAccompanimentOptions(categoryId)
  });

const pickSauce = (itemName, categoryId) =>
  pickFromModal({
    title: `Sauce - ${itemName}`,
    subtitle: "Inclus",
    options: getSauceOptions(categoryId)
  });

const pickEntree = (itemName, itemId) =>
  pickFromModal({
    title: `Entree - ${itemName}`,
    subtitle: "Inclus",
    options: getEntreeOptions(itemId)
  });
const pickIncludedSoft = (itemName) =>
  pickFromModal({
    title: `Soft inclus - ${itemName}`,
    subtitle: "Choisir le soft compris",
    options: getIncludedSoftOptions()
  });
const pickGratin = (itemName) =>
  pickFromModal({
    title: `Gratine - ${itemName}`,
    subtitle: `Option: ${euros(GRATIN_PRICE)}`,
    options: GRATIN_OPTIONS
  });

const pickCooking = (itemName) =>
  pickFromModal({
    title: `Cuisson - ${itemName}`,
    subtitle: "Choisir la cuisson",
    options: COOKING_OPTIONS
  });

const pickAlcoholOption = (itemName) =>
  pickFromModal({
    title: `Option - ${itemName}`,
    subtitle: `Alcoolise ajoute ${euros(ALCOHOL_SUPPLEMENT_PRICE)}`,
    options: ALCOHOL_OPTIONS
  });

if (optionCancelBtn) {
  optionCancelBtn.addEventListener("click", () => resolveOption(null));
}
if (optionModal) {
  optionModal.addEventListener("click", (event) => {
    if (event.target === optionModal) resolveOption(null);
  });
}

const applyItemDelta = async (baseItems, item, delta, categoryId = state.activeCategory) => {
  const items = cloneItems(baseItems);
  const isOrderLine = Object.prototype.hasOwnProperty.call(item, "qty");
  const needsAccompaniment = CATEGORIES_WITH_ACCOMPANIMENT.has(categoryId);
  const needsSauce = CATEGORIES_WITH_SAUCE.has(categoryId);
  const needsCooking = itemNeedsCooking(categoryId, item.id);
  const needsGratin = CATEGORIES_WITH_GRATIN.has(categoryId);
  const needsEntree = CATEGORIES_WITH_ENTREE.has(categoryId);
  const needsAlcoholOption = CATEGORIES_WITH_ALCOHOL_OPTION.has(categoryId);
  const needsIncludedSoft = categoryId === "anniversaire";
  const isAnnivInfo = categoryId === "anniversaire" && item.id === "anniv-infos";
  const existingOrderLine = isOrderLine ? items.find((i) => i.id === item.id) : null;

  if (existingOrderLine) {
    existingOrderLine.qty = Math.max(0, existingOrderLine.qty + delta);
  } else if (needsAlcoholOption) {
    if (delta > 0) {
      const alcoholOption = await pickAlcoholOption(item.name);
      if (!alcoholOption) return null;
      const isAlcoholized = alcoholOption.id === "alcoolise";
      const lineId = `${item.id}__alcohol__${alcoholOption.id}`;
      const existing = items.find((i) => i.id === lineId);
      if (!existing) {
        items.push({
          id: lineId,
          sourceItemId: item.id,
          alcoholOptionId: alcoholOption.id,
          name: `${item.name} - ${isAlcoholized ? "Alcoolise" : "Sans alcool"}`,
          price: item.price + (isAlcoholized ? ALCOHOL_SUPPLEMENT_PRICE : 0),
          qty: 1
        });
      } else {
        existing.qty += 1;
      }
    } else if (delta < 0) {
      const candidates = items.filter((i) => (i.sourceItemId === item.id || i.id === item.id) && i.qty > 0);
      if (candidates.length > 0) {
        candidates[0].qty = Math.max(0, candidates[0].qty - 1);
      }
    }
  } else if ((needsAccompaniment || needsSauce || needsCooking || needsGratin || needsEntree) && !isAnnivInfo) {
    if (delta > 0) {
      const entree = needsEntree ? await pickEntree(item.name, item.id) : null;
      if (needsEntree && !entree) return null;
      const cooking = needsCooking ? await pickCooking(item.name) : null;
      if (needsCooking && !cooking) return null;
      const acc = needsAccompaniment ? await pickAccompaniment(item.name, categoryId) : null;
      if (needsAccompaniment && !acc) return null;
      const sauce = needsSauce ? await pickSauce(item.name, categoryId) : null;
      if (needsSauce && !sauce) return null;
      const gratin = needsGratin ? await pickGratin(item.name) : null;
      if (needsGratin && !gratin) return null;
      const soft = needsIncludedSoft ? await pickIncludedSoft(item.name) : null;
      if (needsIncludedSoft && !soft) return null;
      const accId = acc ? acc.id : "none";
      const sauceId = sauce ? sauce.id : "none";
      const cookingId = cooking ? cooking.id : "none";
      const softId = soft ? soft.id : "none";
      const gratinId = gratin ? gratin.id : "none";
      const entreeId = entree ? entree.id : "none";
      const lineId = `${item.id}__entree__${entreeId}__acc__${accId}__sauce__${sauceId}__cook__${cookingId}__soft__${softId}__gratin__${gratinId}`;
      const existing = items.find((i) => i.id === lineId);
      const extraPrice =
        (acc ? ACCOMPANIMENT_PRICE : 0) +
        (sauce ? SAUCE_PRICE : 0) +
        (gratin && gratin.id === "gratine" ? GRATIN_PRICE : 0);
      const gratinLabel =
        gratin && gratin.id === "gratine" ? "Gratine" : gratin ? gratin.label : null;
      const softLabel = soft ? `${soft.label} (soft inclus)` : null;
      const extraLabel = [entree?.label, cooking?.label, acc?.label, sauce?.label, gratinLabel, softLabel]
        .filter(Boolean)
        .join(" + ");
      if (!existing) {
        items.push({
          id: lineId,
          sourceItemId: item.id,
          entreeId: entree ? entree.id : null,
          accompanimentId: acc ? acc.id : null,
          sauceId: sauce ? sauce.id : null,
          cookingId: cooking ? cooking.id : null,
          softId: soft ? soft.id : null,
          gratinId: gratin ? gratin.id : null,
          name: `${item.name}${extraLabel ? ` + ${extraLabel}` : ""}`,
          price: item.price + extraPrice,
          qty: 1
        });
      } else {
        existing.qty += 1;
      }
    } else if (delta < 0) {
      const candidates = items.filter((i) => i.sourceItemId === item.id && i.qty > 0);
      if (candidates.length > 0) {
        candidates[0].qty = Math.max(0, candidates[0].qty - 1);
      }
    }
  } else {
    const existing = items.find((i) => i.id === item.id);
    if (!existing && delta > 0) {
      items.push({ ...item, qty: 1 });
    } else if (existing) {
      existing.qty = Math.max(0, existing.qty + delta);
    }
  }
  return items.filter((i) => i.qty > 0);
};

const updateItemQuantity = async (item, delta, categoryId = state.activeCategory) => {
  if (!state.currentOrder) return;
  const previousItems = cloneItems(state.currentOrder.items);
  const nextItems = await applyItemDelta(state.currentOrder.items, item, delta, categoryId);
  if (!nextItems) return;
  state.currentOrder.items = nextItems;
  renderItems();
  renderOrder();
  if (state.printKitchen && delta > 0) {
    const previousQtyById = new Map(previousItems.map((line) => [line.id, Number(line.qty) || 0]));
    const addedItems = nextItems
      .map((line) => ({ ...line, qty: (Number(line.qty) || 0) - (previousQtyById.get(line.id) || 0) }))
      .filter((line) => line.qty > 0);
    if (addedItems.length) printKitchenTicket(state.currentOrder, addedItems);
  }
  persistOrder();
};

let saveTimeout;
const persistOrder = () => {
  if (!state.currentOrder) return;
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    state.saving = true;
    try {
      const updated = await api(`/api/orders/${state.currentOrder.id}`, {
        method: "PUT",
        body: JSON.stringify({ items: state.currentOrder.items })
      });
      state.currentOrder = updated;
      localStorage.setItem(`order-${state.currentTable.id}`, JSON.stringify(updated.items));
    } catch (err) {
      console.error(err);
      alert("Echec de sauvegarde");
    } finally {
      state.saving = false;
    }
  }, 250);
};

const renderKitchenStatus = () => {
  if (!state.currentOrder?.sentToKitchen) {
    kitchenStatus.classList.add("hidden");
    kitchenStatus.textContent = "";
    return;
  }
  kitchenStatus.classList.remove("hidden");
  kitchenStatus.textContent = "Envoye en cuisine";
};

const openPrintWindow = (html, options = {}) => {
  const existingFrame = document.getElementById("ticket-print-frame");
  if (existingFrame) existingFrame.remove();

  const frame = document.createElement("iframe");
  frame.id = "ticket-print-frame";
  frame.setAttribute("aria-hidden", "true");
  frame.style.position = "fixed";
  frame.style.right = "0";
  frame.style.bottom = "0";
  frame.style.width = "1px";
  frame.style.height = "1px";
  frame.style.opacity = "0";
  frame.style.border = "0";
  frame.style.pointerEvents = "none";
  document.body.appendChild(frame);

  const frameWindow = frame.contentWindow;
  if (!frameWindow) {
    frame.remove();
    alert("Impossible d'ouvrir l'impression");
    return;
  }

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    frame.remove();
  };

  const triggerPrint = () => {
    setTimeout(() => {
      try {
        frameWindow.focus();
        frameWindow.print();
        setTimeout(cleanup, options.cleanupDelay || 120000);
      } catch (error) {
        console.error(error);
        cleanup();
        alert("Impossible de lancer l'impression");
      }
    }, options.printDelay || 400);
  };

  frame.onload = triggerPrint;
  frameWindow.onafterprint = cleanup;
  frameWindow.document.open();
  frameWindow.document.write(html);
  frameWindow.document.close();
  setTimeout(triggerPrint, options.fallbackDelay || 900);
};

const THERMAL_PAGE_WIDTH_MM = 80;
const THERMAL_CONTENT_WIDTH_MM = 72;
const THERMAL_BODY_STYLE = `margin:0 auto;padding:0;width:${THERMAL_PAGE_WIDTH_MM}mm;background:#fff;color:#000;`;
const THERMAL_PRE_STYLE = `margin:0 auto;padding:4mm 3mm 3mm;width:${THERMAL_CONTENT_WIDTH_MM}mm;white-space:pre-wrap;word-break:break-word;font:700 16px/1.4 monospace;color:#000;background:#fff;`;
const THERMAL_TEXT_WIDTH = 28;

const buildThermalPrintDocument = (title, text) => `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      @page {
        size: ${THERMAL_PAGE_WIDTH_MM}mm auto;
        margin: 0;
      }

      html,
      body {
        margin: 0;
        padding: 0;
        width: ${THERMAL_PAGE_WIDTH_MM}mm;
        background: #fff;
      }
    </style>
  </head>
  <body style="${THERMAL_BODY_STYLE}">
    <pre style="${THERMAL_PRE_STYLE}">${escapeHtml(text)}</pre>
  </body>
</html>`;

const normalizePrintText = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

const wrapPrintText = (value, width = THERMAL_TEXT_WIDTH) => {
  const text = normalizePrintText(value);
  if (!text) return [""];

  const words = text.split(" ");
  const lines = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= width) {
      current = next;
      return;
    }
    if (current) lines.push(current);
    if (word.length <= width) {
      current = word;
      return;
    }
    for (let index = 0; index < word.length; index += width) {
      lines.push(word.slice(index, index + width));
    }
    current = "";
  });

  if (current) lines.push(current);
  return lines.length ? lines : [text];
};

const thermalSeparator = () => "-".repeat(THERMAL_TEXT_WIDTH);

const thermalLine = (label, amount = "") => {
  const text = normalizePrintText(label);
  const amountText = normalizePrintText(amount);
  if (!amountText) return wrapPrintText(text).join("\n");

  const inline = `${text} ${amountText}`.trim();
  if (inline.length <= THERMAL_TEXT_WIDTH) {
    const spaces = Math.max(1, THERMAL_TEXT_WIDTH - text.length - amountText.length);
    return `${text}${" ".repeat(spaces)}${amountText}`;
  }

  return `${wrapPrintText(text).join("\n")}\n${amountText}`;
};

const joinThermalLines = (...sections) =>
  sections
    .flat()
    .filter((line) => line !== null && line !== undefined && line !== "")
    .join("\n");

const printKitchenTicket = (order, kitchenItems = order.items || []) => {
  const tableLabel = state.currentTable ? tableDisplayLabel(state.currentTable) : "Table";
  const date = new Date().toLocaleString();
  const lines = kitchenItems
    .map((line) => thermalLine(`${line.qty} x ${line.name}`, euros(line.price))) || [];

  const text = joinThermalLines(
    "TICKET CUISINE",
    tableLabel,
    date,
    thermalSeparator(),
    lines.length ? lines : "Aucun article",
    thermalSeparator(),
    thermalLine("Total lignes", String(kitchenItems.reduce((a, l) => a + l.qty, 0) || 0))
  );

  const html = buildThermalPrintDocument("Ticket Cuisine", text);
  openPrintWindow(html);
};

const printReceiptTicket = () => {
  if (!lastTicket) {
    alert("Aucun ticket a imprimer");
    return;
  }
  const date = new Date(lastTicket.date);
  const methodLabel = paymentMethodLabel(lastTicket.paymentMethod);
  const totalCash =
    typeof lastTicket.paidCash === "number"
      ? lastTicket.paidCash
      : typeof lastTicket.totalCash === "number"
        ? lastTicket.totalCash
        : 0;
  const totalCard =
    typeof lastTicket.paidCard === "number"
      ? lastTicket.paidCard
      : typeof lastTicket.totalCard === "number"
        ? lastTicket.totalCard
        : 0;
  const lines = (lastTicket.items || [])
    .map((line) => thermalLine(`${line.qty} x ${line.name}`, euros(line.price * line.qty))) || [];
  const paymentDetails = [];
  if (totalCash > 0) {
    paymentDetails.push(thermalLine("Cash", euros(totalCash)));
  }
  if (totalCard > 0) {
    paymentDetails.push(thermalLine("Carte", euros(totalCard)));
  }
  if (!paymentDetails.length) {
    paymentDetails.push(thermalLine("Carte", euros(lastTicket.totalTtc || 0)));
  }
  if (typeof lastTicket.changeDue === "number" && lastTicket.changeDue > 0) {
    paymentDetails.push(thermalLine("Rendu", euros(lastTicket.changeDue)));
  }
  const text = joinThermalLines(
    lastTicket.restaurant || "Ticket",
    `Ticket N ${formatTicketNumber(lastTicket.ticketNumber)}`,
    tableDisplayLabel(lastTicket),
    `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`,
    methodLabel,
    hasVatNumber(lastTicket.vatNumber) ? `TVA: ${lastTicket.vatNumber}` : null,
    thermalSeparator(),
    lines.length ? lines : "Aucun article",
    thermalSeparator(),
    paymentDetails,
    thermalLine("Total TTC", euros(lastTicket.totalTtc || 0)),
    "Chaussee d'Haecht 32",
    "1210 Bruxelles"
  );

  const html = buildThermalPrintDocument("Ticket", text);
  openPrintWindow(html);
};

const printDailyTicket = () => {
  if (!state.daily) {
    alert("Pas de ticket journalier");
    return;
  }
  const lines = [
    thermalLine("Cash", euros(state.daily.totalCash || 0)),
    thermalLine("Carte", euros(state.daily.totalCard || 0))
  ];
  const displayDate = state.daily.date;
  const text = joinThermalLines(
    RESTAURANT_NAME,
    "TICKET DE LA JOURNEE",
    `Date: ${displayDate}`,
    hasVatNumber(state.daily.vatNumber) ? `TVA: ${state.daily.vatNumber}` : null,
    thermalSeparator(),
    lines,
    thermalSeparator(),
    thermalLine("Total journalier", euros(state.daily.totalTtc || 0))
  );

  const html = buildThermalPrintDocument(`${RESTAURANT_NAME} - TICKET DE LA JOURNEE`, text);
  openPrintWindow(html);
};

const openTable = async (tableId) => {
  try {
    const { table, order } = await api(`/api/tables/${tableId}/open`, { method: "POST" });
    state.currentTable = table;
    state.activeRoom = table.room || "normal";
    localStorage.setItem("active-room", state.activeRoom);
    const savedItems = localStorage.getItem(`order-${tableId}`);
    if (savedItems && (!order.items || order.items.length === 0)) {
      order.items = JSON.parse(savedItems);
      await api(`/api/orders/${order.id}`, {
        method: "PUT",
        body: JSON.stringify({ items: order.items })
      });
    }
    state.currentOrder = order;
    tableTitle.textContent = tableDisplayLabel(table);
    tableStatusLabel.textContent = `Statut : ${statusLabel(table.status)} (${roomLabel(table.room)})`;
    tablesPanel.classList.add("hidden");
    orderPanel.classList.remove("hidden");
    renderCategories();
    renderItems();
    renderOrder();
    renderKitchenStatus();
    await refreshTables();
  } catch (err) {
    console.error(err);
    alert("Impossible d'ouvrir la table.");
  }
};

const refreshTables = async () => {
  state.tables = await api("/api/tables");
  const hasActiveRoomTables = state.tables.some((table) => (table.room || "normal") === state.activeRoom);
  if (!hasActiveRoomTables) state.activeRoom = "normal";
  renderTables();
};

const setActiveRoom = (room) => {
  state.activeRoom = room === "vip" ? "vip" : "normal";
  localStorage.setItem("active-room", state.activeRoom);
  renderTables();
};

const markToPay = async () => {
  if (!state.currentOrder) return;
  await api(`/api/orders/${state.currentOrder.id}/mark-to-pay`, { method: "POST" });
  tableStatusLabel.textContent = `Statut : A payer (${roomLabel(state.currentTable.room)})`;
  await refreshTables();
  openPaymentModal();
};

const confirmPayment = async () => {
  if (!state.currentOrder) return;
  try {
    const orderTotal = (state.currentOrder.items || []).reduce((acc, curr) => acc + curr.price * curr.qty, 0);
    const totalCash = normalizeMoney(paymentCashInput ? paymentCashInput.value : 0);
    const totalCard = normalizeMoney(paymentCardInput ? paymentCardInput.value : 0);
    const entered = Math.round((totalCash + totalCard) * 100) / 100;
    if (entered + 0.01 < orderTotal) {
      alert(`Le total saisi (${euros(entered)}) doit etre au moins egal au total commande (${euros(orderTotal)}).`);
      return;
    }
    const method = computePaymentMethod(totalCash, totalCard);
    state.paymentMethod = method;
    const ticket = await api(`/api/orders/${state.currentOrder.id}/settle`, {
      method: "POST",
      body: JSON.stringify({
        paymentMethod: method,
        paymentAmounts: {
          cash: totalCash,
          card: totalCard
        }
      })
    });
    showTicket(ticket);
    localStorage.removeItem(`order-${state.currentTable.id}`);
    state.currentOrder = null;
    state.currentTable = null;
    orderPanel.classList.add("hidden");
    tablesPanel.classList.remove("hidden");
    await refreshTables();
    hidePaymentModal();
  } catch (err) {
    console.error(err);
    alert("Impossible d'encaisser");
    hidePaymentModal();
  }
};

const showTicket = (ticket) => {
  lastTicket = ticket;
  ticketRestaurant.textContent = ticket.restaurant;
  const date = new Date(ticket.date);
  if (ticketVat) ticketVat.textContent = hasVatNumber(ticket.vatNumber) ? `TVA: ${ticket.vatNumber}` : "";
  ticketMeta.textContent = `Ticket N ${formatTicketNumber(ticket.ticketNumber)}  -  ${tableDisplayLabel(ticket)}  -  ${date.toLocaleDateString()} ${date.toLocaleTimeString()}  -  ${paymentMethodLabel(ticket.paymentMethod)}`;
  ticketLines.innerHTML = "";
  ticket.items.forEach((line) => {
    const row = document.createElement("div");
    row.className = "ticket-row";
    row.innerHTML = `<span>${line.qty} x ${line.name}</span><strong>${euros(line.price * line.qty)}</strong>`;
    ticketLines.appendChild(row);
  });
  const paidCash =
    typeof ticket.paidCash === "number"
      ? ticket.paidCash
      : typeof ticket.totalCash === "number"
        ? ticket.totalCash
        : 0;
  const paidCard =
    typeof ticket.paidCard === "number"
      ? ticket.paidCard
      : typeof ticket.totalCard === "number"
        ? ticket.totalCard
        : 0;
  const cashRow = document.createElement("div");
  cashRow.className = "ticket-row";
  cashRow.innerHTML = `<span>Cash</span><strong>${euros(paidCash)}</strong>`;
  ticketLines.appendChild(cashRow);
  const cardRow = document.createElement("div");
  cardRow.className = "ticket-row";
  cardRow.innerHTML = `<span>Carte</span><strong>${euros(paidCard)}</strong>`;
  ticketLines.appendChild(cardRow);
  if (typeof ticket.changeDue === "number" && ticket.changeDue > 0) {
    const changeRow = document.createElement("div");
    changeRow.className = "ticket-row";
    changeRow.innerHTML = `<span>Rendu</span><strong>${euros(ticket.changeDue)}</strong>`;
    ticketLines.appendChild(changeRow);
  }
  ticketTotal.textContent = euros(ticket.totalTtc);
  ticketModal.classList.remove("hidden");
};

const hideTicket = () => ticketModal.classList.add("hidden");

const buildTicketEmail = (ticket) => {
  if (!ticket) return { subject: "Votre ticket", body: "" };
  const date = new Date(ticket.date);
  const subject = `Ticket ${ticket.restaurant || "Restaurant"} - N ${formatTicketNumber(
    ticket.ticketNumber
  )}`;
  const lines = (ticket.items || [])
    .map((line) => `${line.qty} x ${line.name} = ${euros(line.price * line.qty)}`)
    .join("\n");
  const body = [
    `${ticket.restaurant || "Restaurant"}`,
    `Ticket N ${formatTicketNumber(ticket.ticketNumber)}`,
    `${tableDisplayLabel(ticket)} - ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`,
    "",
    lines || "Aucun article",
    "",
    `Total TTC: ${euros(ticket.totalTtc || 0)}`
  ].join("\n");
  return { subject, body };
};

const sendTicketByEmail = () => {
  if (!lastTicket) {
    alert("Aucun ticket a envoyer");
    return;
  }
  const email = prompt("Adresse e-mail du client :");
  if (!email) return;
  const { subject, body } = buildTicketEmail(lastTicket);
  const mailto = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
};

const loadDailyReport = async () => {
  try {
    const report = await api("/api/reports/daily");
    state.daily = report;
    renderDaily(report);
    try {
      await api("/api/reports/daily/send", {
        method: "POST",
        body: JSON.stringify({ date: report.date })
      });
    } catch (sendErr) {
      console.error(sendErr);
      alert("Ticket journalier affiche, mais l'envoi Telegram a echoue.");
    }
  } catch (err) {
    console.error(err);
    alert("Impossible de charger le ticket journalier");
  }
};

const renderDaily = (report) => {
  if (!report) return;
  dailyDate.textContent = `Date : ${report.date}`;
  if (dailyRestaurant) dailyRestaurant.textContent = RESTAURANT_NAME;
  if (dailyVat) dailyVat.textContent = hasVatNumber(report.vatNumber) ? `TVA: ${report.vatNumber}` : "";
  dailyLines.innerHTML = "";
  const cashRow = document.createElement("div");
  cashRow.className = "ticket-row";
  cashRow.innerHTML = `<span>Cash</span><strong>${euros(report.totalCash || 0)}</strong>`;
  dailyLines.appendChild(cashRow);
  const cardRow = document.createElement("div");
  cardRow.className = "ticket-row";
  cardRow.innerHTML = `<span>Carte</span><strong>${euros(report.totalCard || 0)}</strong>`;
  dailyLines.appendChild(cardRow);
  dailyTotal.textContent = euros(report.totalTtc || 0);
  dailyModal.classList.remove("hidden");
};

const hideDaily = () => dailyModal.classList.add("hidden");

const openPaymentModal = () => {
  if (!paymentModal || !state.currentOrder) return;
  const total = (state.currentOrder.items || []).reduce((acc, curr) => acc + curr.price * curr.qty, 0);
  if (paymentCashInput) paymentCashInput.value = "0.00";
  if (paymentCardInput) paymentCardInput.value = total.toFixed(2);
  updatePaymentTotalHint();
  paymentModal.classList.remove("hidden");
};

const hidePaymentModal = () => {
  if (!paymentModal) return;
  paymentModal.classList.add("hidden");
};

const getHistoryCategory = () =>
  state.menu.find((category) => category.id === state.historyEditCategoryId) || state.menu[0] || null;

const getHistoryDraftTotal = () => computeItemsTotal(state.selectedTicketDraftItems || []);

const updateHistoryItemOptions = () => {
  if (!historyItemSelect) return;
  const category = getHistoryCategory();
  historyItemSelect.innerHTML = "";
  const items = category && Array.isArray(category.items) ? category.items : [];
  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = `${item.name} - ${euros(item.price)}`;
    historyItemSelect.appendChild(option);
  });
  historyItemSelect.disabled = items.length === 0;
  if (historyAddItemBtn) {
    const selectedTicket = (state.history || []).find((t) => t.id === state.selectedTicketId);
    const locked = !state.selectedTicketId || !!selectedTicket?.isDeleted;
    historyAddItemBtn.disabled = locked || items.length === 0;
  }
};

const renderHistoryCategoryOptions = () => {
  if (!historyCategorySelect) return;
  historyCategorySelect.innerHTML = "";
  state.menu.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.label;
    historyCategorySelect.appendChild(option);
  });
  if (!state.historyEditCategoryId) {
    state.historyEditCategoryId = state.menu[0]?.id || null;
  }
  if (state.historyEditCategoryId) {
    historyCategorySelect.value = state.historyEditCategoryId;
  }
  updateHistoryItemOptions();
};

const setHistoryEditorDisabled = (disabled) => {
  if (historyCashInput) historyCashInput.disabled = disabled;
  if (historyCardInput) historyCardInput.disabled = disabled;
  if (historyIncludeDaily) historyIncludeDaily.disabled = disabled;
  if (historySaveBtn) historySaveBtn.disabled = disabled;
  if (historyCategorySelect) historyCategorySelect.disabled = disabled;
  if (historyItemSelect) historyItemSelect.disabled = disabled || historyItemSelect.options.length === 0;
  if (historyAddItemBtn) historyAddItemBtn.disabled = disabled || !historyItemSelect || historyItemSelect.options.length === 0;
};

const renderHistoryTicketItems = () => {
  if (!historyTicketItemsEl) return;
  historyTicketItemsEl.innerHTML = "";
  const items = state.selectedTicketDraftItems || [];
  const total = getHistoryDraftTotal();
  if (historyOrderTotalEl) historyOrderTotalEl.textContent = euros(total);
  if (items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "history-empty";
    empty.textContent = "Aucun article sur cette commande.";
    historyTicketItemsEl.appendChild(empty);
    return;
  }
  const disabled = !(state.selectedTicketId) || !!((state.history || []).find((t) => t.id === state.selectedTicketId)?.isDeleted);
  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "history-ticket-line";
    row.innerHTML = `
      <div>
        <h6>${item.name}</h6>
        <p>${euros(item.price)} l'unite</p>
      </div>
      <div class="history-ticket-controls">
        <div class="history-qty-controls">
          <button type="button" data-delta="-1"${disabled ? " disabled" : ""}>-</button>
          <strong>x${item.qty}</strong>
          <button type="button" data-delta="1"${disabled ? " disabled" : ""}>+</button>
        </div>
        <strong>${euros(item.price * item.qty)}</strong>
      </div>
    `;
    row.querySelectorAll("button[data-delta]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const nextItems = await applyItemDelta(state.selectedTicketDraftItems, item, Number(btn.dataset.delta));
        if (!nextItems) return;
        state.selectedTicketDraftItems = nextItems;
        renderHistoryTicketItems();
        updateHistoryHint();
      });
    });
    historyTicketItemsEl.appendChild(row);
  });
};

const addHistoryItem = async () => {
  if (!state.selectedTicketId || !historyItemSelect) return;
  const category = getHistoryCategory();
  if (!category) return;
  const item = (category.items || []).find((entry) => entry.id === historyItemSelect.value);
  if (!item) return;
  const nextItems = await applyItemDelta(state.selectedTicketDraftItems, item, 1, category.id);
  if (!nextItems) return;
  state.selectedTicketDraftItems = nextItems;
  renderHistoryTicketItems();
  updateHistoryHint();
};

const updateHistoryHint = () => {
  if (!historyHint || !historyCashInput || !historyCardInput) return;
  const total = getHistoryDraftTotal();
  const cash = normalizeMoney(historyCashInput.value);
  const card = normalizeMoney(historyCardInput.value);
  const entered = Math.round((cash + card) * 100) / 100;
  if (state.selectedTicketSnapshot && historyIncludeDaily && !state.historyIncludeTouched) {
    const changed =
      cash !== state.selectedTicketSnapshot.cash ||
      card !== state.selectedTicketSnapshot.card ||
      buildItemsSnapshotKey(state.selectedTicketDraftItems) !== state.selectedTicketSnapshot.itemsKey;
    if (changed) historyIncludeDaily.checked = false;
  }
  const diff = Math.round((total - entered) * 100) / 100;
  if (Math.abs(diff) < 0.01) {
    historyHint.textContent = `Total OK: ${euros(total)}`;
    return;
  }
  if (diff > 0) {
    historyHint.textContent = `Il manque ${euros(diff)} (commande ${euros(total)})`;
    return;
  }
  historyHint.textContent = `Rendu client: ${euros(Math.abs(diff))} (commande ${euros(total)})`;
};

const renderHistoryList = () => {
  if (!historyListEl) return;
  historyListEl.innerHTML = "";
  const tickets = state.history || [];
  if (historySummaryEl) {
    historySummaryEl.textContent = `${tickets.length} ticket${tickets.length > 1 ? "s" : ""}`;
  }
  if (tickets.length === 0) {
    const empty = document.createElement("div");
    empty.className = "history-item";
    empty.innerHTML = "<h5>Aucun ticket</h5>";
    historyListEl.appendChild(empty);
    return;
  }
  tickets.forEach((ticket) => {
    const row = document.createElement("div");
    const isSelected = state.selectedTicketId === ticket.id;
    row.className = `history-item${isSelected ? " selected" : ""}`;
    const date = new Date(ticket.date);
    const badges = [];
    if (ticket.isModified) badges.push('<span class="history-badge modified">Modifie</span>');
    if (ticket.isDeleted) badges.push('<span class="history-badge deleted">Supprime</span>');
    if (isSelected) badges.push('<span class="history-badge selected">Selectionne</span>');
    row.innerHTML = `
      <div class="history-row">
        <h5>${ticket.restaurant || "Ticket"} - N ${formatTicketNumber(ticket.ticketNumber)}</h5>
        <div class="history-badges">${badges.join("")}</div>
      </div>
      <p class="history-meta">${tableDisplayLabel(ticket)} - ${date.toLocaleDateString()} ${date.toLocaleTimeString()}</p>
      <div class="history-row">
        <strong>${euros(ticket.totalTtc || 0)}</strong>
        <span>${paymentMethodLabel(ticket.paymentMethod)}</span>
      </div>
      <div class="history-actions">
        <button class="ghost-btn" data-action="edit"${ticket.isDeleted ? " disabled" : ""}>
          ${isSelected ? "Edition" : "Modifier"}
        </button>
        <button class="ghost-btn" data-action="delete"${ticket.isDeleted ? " disabled" : ""}>Supprimer</button>
      </div>
    `;
    row.querySelectorAll("button[data-action]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const action = btn.dataset.action;
        if (action === "edit") {
          selectHistoryTicket(ticket.id);
        } else if (action === "delete") {
          if (!confirm("Supprimer ce paiement ?")) return;
          await api(`/api/tickets/${ticket.id}`, { method: "DELETE" });
          await loadHistory();
        }
      });
    });
    historyListEl.appendChild(row);
  });
};

const selectHistoryTicket = (ticketId) => {
  state.selectedTicketId = ticketId;
  const ticket = (state.history || []).find((t) => t.id === ticketId);
  if (!ticket) return;
  if (historyEditMeta) {
    const date = new Date(ticket.date);
    historyEditMeta.textContent = `${tableDisplayLabel(ticket)} - ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  }
  if (historyCashInput) historyCashInput.value = (ticket.paidCash || 0).toFixed(2);
  if (historyCardInput) historyCardInput.value = (ticket.paidCard || 0).toFixed(2);
  if (historyIncludeDaily) historyIncludeDaily.checked = !!ticket.includeInDaily;
  state.selectedTicketDraftItems = cloneItems(ticket.items || []);
  state.selectedTicketSnapshot = {
    cash: normalizeMoney(ticket.paidCash || 0),
    card: normalizeMoney(ticket.paidCard || 0),
    itemsKey: buildItemsSnapshotKey(ticket.items || [])
  };
  state.historyIncludeTouched = false;
  const disabled = !!ticket.isDeleted;
  setHistoryEditorDisabled(disabled);
  renderHistoryTicketItems();
  updateHistoryHint();
  renderHistoryList();
};

const loadHistory = async () => {
  const tickets = await api("/api/tickets");
  state.history = Array.isArray(tickets) ? tickets : [];
  if (state.selectedTicketId) {
    const stillExists = state.history.some((t) => t.id === state.selectedTicketId);
    if (!stillExists) state.selectedTicketId = null;
  }
  if (!state.selectedTicketId && state.history.length > 0) {
    const firstActive = state.history.find((t) => !t.isDeleted);
    state.selectedTicketId = (firstActive || state.history[0]).id;
  }
  if (state.selectedTicketId) {
    selectHistoryTicket(state.selectedTicketId);
  } else {
    state.selectedTicketSnapshot = null;
    state.selectedTicketDraftItems = [];
    if (historyEditMeta) historyEditMeta.textContent = "";
    if (historyCashInput) historyCashInput.value = "0.00";
    if (historyCardInput) historyCardInput.value = "0.00";
    if (historyIncludeDaily) historyIncludeDaily.checked = false;
    setHistoryEditorDisabled(true);
    renderHistoryTicketItems();
    updateHistoryHint();
  }
  renderHistoryList();
};

const openHistoryModal = async () => {
  if (!historyModal) return;
  await loadHistory();
  historyModal.classList.remove("hidden");
};

const hideHistoryModal = () => {
  if (!historyModal) return;
  historyModal.classList.add("hidden");
};

const isManagerUser = () => state.user?.role === "manager";

const updateUserInterface = () => {
  if (currentUserEl) {
    const role = isManagerUser() ? "Gerant" : "Serveur";
    currentUserEl.textContent = state.user ? `${state.user.name} - ${role}` : "";
  }
  managerOnlyEls.forEach((element) => element.classList.toggle("hidden", !isManagerUser()));
};

const hideStaffModal = () => {
  if (staffModal) staffModal.classList.add("hidden");
};

const renderStaffList = (staff) => {
  if (!staffList) return;
  staffList.innerHTML = "";
  staff.forEach((member) => {
    const row = document.createElement("div");
    row.className = "staff-row";
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(member.name)}</strong>
        <span>${member.role === "manager" ? "Gerant" : "Serveur"}</span>
      </div>
      <input type="password" inputmode="numeric" minlength="4" placeholder="Nouveau PIN" />
      <div class="staff-actions">
        <button class="ghost-btn staff-pin-btn" type="button">Modifier PIN</button>
        ${member.role === "manager" ? "" : '<button class="ghost-btn danger-btn staff-delete-btn" type="button">Supprimer</button>'}
      </div>
    `;
    const pinInput = row.querySelector("input");
    row.querySelector(".staff-pin-btn").addEventListener("click", async () => {
      const pin = pinInput.value.trim();
      if (!/^\d{4,}$/.test(pin)) {
        alert("Le PIN doit contenir au moins 4 chiffres");
        return;
      }
      try {
        await api(`/api/staff/${member.id}`, {
          method: "PUT",
          body: JSON.stringify({ pin })
        });
        pinInput.value = "";
        alert(`PIN de ${member.name} modifie`);
      } catch (err) {
        console.error(err);
        alert("Impossible de modifier le PIN");
      }
    });
    const deleteBtn = row.querySelector(".staff-delete-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", async () => {
        if (!window.confirm(`Supprimer definitivement ${member.name} ?`)) return;
        try {
          await api(`/api/staff/${member.id}`, { method: "DELETE" });
          await openStaffModal();
        } catch (err) {
          console.error(err);
          alert("Impossible de supprimer ce serveur");
        }
      });
    }
    staffList.appendChild(row);
  });
};

const openStaffModal = async () => {
  if (!isManagerUser() || !staffModal) return;
  try {
    renderStaffList(await api("/api/staff"));
    staffModal.classList.remove("hidden");
  } catch (err) {
    console.error(err);
    alert("Impossible de charger le personnel");
  }
};

const createStaff = async (event) => {
  event.preventDefault();
  const name = staffCreateName?.value.trim() || "";
  const pin = staffCreatePin?.value.trim() || "";
  try {
    await api("/api/staff", {
      method: "POST",
      body: JSON.stringify({ name, pin })
    });
    if (staffCreateName) staffCreateName.value = "";
    if (staffCreatePin) staffCreatePin.value = "";
    await openStaffModal();
  } catch (err) {
    console.error(err);
    alert("Impossible d'ajouter ce serveur. Verifiez le nom et le PIN.");
  }
};

const hideStaffReportModal = () => {
  if (staffReportModal) staffReportModal.classList.add("hidden");
};

const printStaffReport = (report, date) => {
  const payments = (report.tickets || []).map((ticket) =>
    thermalLine(`Table ${ticket.tableNumber} - Ticket ${formatTicketNumber(ticket.ticketNumber)}`, euros(ticket.totalTtc || 0))
  );
  const pointages = (report.pointages || []).map((item) => `${item.qty} x ${item.name}`);
  const text = joinThermalLines(
    RESTAURANT_NAME,
    `TICKET SERVEUR - ${report.staff.name}`,
    `Date: ${date}`,
    thermalSeparator(),
    "Encaissements",
    payments.length ? payments : "Aucun paiement",
    thermalSeparator(),
    thermalLine("Cash", euros(report.totalCash || 0)),
    thermalLine("Carte", euros(report.totalCard || 0)),
    thermalLine("Total", euros(report.totalTtc || 0)),
    thermalSeparator(),
    "Articles pointes",
    pointages.length ? pointages : "Aucun article pointe"
  );
  openPrintWindow(buildThermalPrintDocument(`Ticket ${report.staff.name}`, text));
};

const renderStaffReports = (data) => {
  if (!staffReportList) return;
  staffReportList.innerHTML = "";
  if (staffReportDate) staffReportDate.textContent = `Date : ${data.date}`;
  (data.reports || []).forEach((report) => {
    const card = document.createElement("div");
    card.className = "staff-report-card";
    const pointages = (report.pointages || [])
      .map((item) => `<li>${item.qty} x ${escapeHtml(item.name)}</li>`)
      .join("") || "<li>Aucun article pointe</li>";
    card.innerHTML = `
      <div class="staff-report-head">
        <strong>${escapeHtml(report.staff.name)}</strong>
        <span>${report.ticketCount} paiement(s)</span>
      </div>
      <div class="history-meta">
        <span>Cash: ${euros(report.totalCash || 0)}</span>
        <span>Carte: ${euros(report.totalCard || 0)}</span>
        <span>Total: ${euros(report.totalTtc || 0)}</span>
      </div>
      <p class="staff-report-label">Articles pointes</p>
      <ul class="staff-pointages">${pointages}</ul>
      <button class="pill-btn primary" type="button">Imprimer le ticket</button>
    `;
    card.querySelector("button").addEventListener("click", () => printStaffReport(report, data.date));
    staffReportList.appendChild(card);
  });
};

const openStaffReportModal = async () => {
  if (!isManagerUser() || !staffReportModal) return;
  try {
    renderStaffReports(await api("/api/reports/staff"));
    staffReportModal.classList.remove("hidden");
  } catch (err) {
    console.error(err);
    alert("Impossible de charger le suivi des serveurs");
  }
};

const logout = async () => {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch (err) {
    console.error(err);
  } finally {
    state.appReady = false;
    state.user = null;
    updateUserInterface();
    lockApp();
  }
};

const saveHistoryChanges = async () => {
  const ticketId = state.selectedTicketId;
  if (!ticketId) return;
  const cash = normalizeMoney(historyCashInput ? historyCashInput.value : 0);
  const card = normalizeMoney(historyCardInput ? historyCardInput.value : 0);
  const include = historyIncludeDaily ? historyIncludeDaily.checked : false;
  try {
    await api(`/api/tickets/${ticketId}`, {
      method: "PATCH",
      body: JSON.stringify({
        items: state.selectedTicketDraftItems,
        paidCash: cash,
        paidCard: card,
        includeInDaily: include
      })
    });
    await loadHistory();
  } catch (err) {
    console.error(err);
    if (err.payload && typeof err.payload.expectedTotal === "number") {
      alert(`Paiement insuffisant pour la commande modifiee. Total attendu: ${euros(err.payload.expectedTotal)}.`);
      return;
    }
    alert("Impossible de modifier le ticket");
  }
};

const updateKitchenPrintToggle = () => {
  const btn = document.getElementById("kitchen-print-toggle");
  if (!btn) return;
  btn.textContent = `Impression cuisine : ${state.printKitchen ? "on" : "off"}`;
};

const toggleKitchenPrint = () => {
  state.printKitchen = !state.printKitchen;
  localStorage.setItem("kitchen-print-enabled", state.printKitchen ? "1" : "0");
  updateKitchenPrintToggle();
  alert(state.printKitchen ? "Impression cuisine activee sur cet appareil" : "Impression cuisine desactivee");
};

const registerEvents = () => {
  if (state.eventsBound) return;
  state.eventsBound = true;
  document.getElementById("back-to-tables").addEventListener("click", () => {
    orderPanel.classList.add("hidden");
    tablesPanel.classList.remove("hidden");
    state.currentTable = null;
    state.currentOrder = null;
  });
  document.getElementById("mark-pay").addEventListener("click", markToPay);
  document.getElementById("refresh-tables").addEventListener("click", refreshTables);
  document.getElementById("close-ticket").addEventListener("click", hideTicket);
  document.getElementById("print-ticket").addEventListener("click", printReceiptTicket);
  if (emailTicketBtn) emailTicketBtn.addEventListener("click", sendTicketByEmail);
  document.getElementById("daily-report").addEventListener("click", loadDailyReport);
  const historyBtn = document.getElementById("history-btn");
  if (historyBtn) historyBtn.addEventListener("click", openHistoryModal);
  document.getElementById("close-daily").addEventListener("click", hideDaily);
  document.getElementById("print-daily").addEventListener("click", printDailyTicket);
  document.getElementById("kitchen-print-toggle").addEventListener("click", toggleKitchenPrint);
  if (roomNormalBtn) roomNormalBtn.addEventListener("click", () => setActiveRoom("normal"));
  if (roomVipBtn) roomVipBtn.addEventListener("click", () => setActiveRoom("vip"));
  if (confirmPaymentBtn) confirmPaymentBtn.addEventListener("click", confirmPayment);
  if (cancelPaymentBtn) cancelPaymentBtn.addEventListener("click", hidePaymentModal);
  if (paymentCashInput) paymentCashInput.addEventListener("input", updatePaymentTotalHint);
  if (paymentCardInput) paymentCardInput.addEventListener("input", updatePaymentTotalHint);
  if (historyCashInput) historyCashInput.addEventListener("input", updateHistoryHint);
  if (historyCardInput) historyCardInput.addEventListener("input", updateHistoryHint);
  if (historyIncludeDaily) {
    historyIncludeDaily.addEventListener("change", () => {
      state.historyIncludeTouched = true;
      updateHistoryHint();
    });
  }
  if (historyCategorySelect) {
    historyCategorySelect.addEventListener("change", () => {
      state.historyEditCategoryId = historyCategorySelect.value;
      updateHistoryItemOptions();
    });
  }
  if (historyAddItemBtn) historyAddItemBtn.addEventListener("click", addHistoryItem);
  if (historySaveBtn) historySaveBtn.addEventListener("click", saveHistoryChanges);
  if (historyCloseBtn) historyCloseBtn.addEventListener("click", hideHistoryModal);
  if (staffManagementBtn) staffManagementBtn.addEventListener("click", openStaffModal);
  if (staffReportBtn) staffReportBtn.addEventListener("click", openStaffReportModal);
  if (closeStaffBtn) closeStaffBtn.addEventListener("click", hideStaffModal);
  if (closeStaffReportBtn) closeStaffReportBtn.addEventListener("click", hideStaffReportModal);
  if (staffCreateForm) staffCreateForm.addEventListener("submit", createStaff);
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
  if (historyModal) {
    historyModal.addEventListener("click", (event) => {
      if (event.target === historyModal) hideHistoryModal();
    });
  }
  document.getElementById("fullscreen-btn").addEventListener("click", () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  });
};

const registerServiceWorker = () => {
  if (state.serviceWorkerRegistered) return;
  state.serviceWorkerRegistered = true;
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }
};

const checkAuthStatus = async () => {
  try {
    const res = await fetch("/api/auth/status", {
      headers: { "Content-Type": "application/json" }
    });
    const payload = await res.json().catch(() => null);
    return payload && payload.authenticated && payload.user ? payload : null;
  } catch (_error) {
    return null;
  }
};

const bootstrapApp = async () => {
  if (state.appReady) return;
  if (appBootstrapPromise) return appBootstrapPromise;
  appBootstrapPromise = (async () => {
    registerEvents();
    registerServiceWorker();
    state.menu = await api("/api/menu");
    state.activeCategory = state.menu[0]?.id;
    state.historyEditCategoryId = state.menu[0]?.id || null;
    state.activeRoom = localStorage.getItem("active-room") === "vip" ? "vip" : "normal";
    const kitchenPrintSetting = localStorage.getItem("kitchen-print-enabled");
    state.printKitchen = kitchenPrintSetting === null ? true : kitchenPrintSetting === "1";
    state.paymentMethod = "card";
    updateUserInterface();
    updateKitchenPrintToggle();
    renderCategories();
    renderItems();
    renderHistoryCategoryOptions();
    setHistoryEditorDisabled(true);
    renderHistoryTicketItems();
    await refreshTables();
    state.appReady = true;
  })();
  try {
    await appBootstrapPromise;
  } finally {
    appBootstrapPromise = null;
  }
};

const submitLogin = async (event) => {
  event.preventDefault();
  if (!authNameInput || !authPinInput || state.authSubmitting) return;
  const name = authNameInput.value.trim();
  const pin = authPinInput.value.trim();
  if (!name || !pin) {
    setAuthError("Entrez votre nom et votre code PIN.");
    focusPinInput();
    return;
  }
  setAuthSubmitting(true);
  setAuthError("");
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, pin })
    });
    const payload = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error((payload && payload.error) || "Nom ou code PIN incorrect");
    }
    state.user = payload.user;
    unlockApp();
    if (state.appReady) {
      await refreshTables();
      return;
    }
    await bootstrapApp();
  } catch (err) {
    setAuthError(err.message || "Nom ou code PIN incorrect");
    focusPinInput();
  } finally {
    setAuthSubmitting(false);
  }
};

const init = async () => {
  if (authForm) authForm.addEventListener("submit", submitLogin);
  lockApp();
  const auth = await checkAuthStatus();
  if (auth) {
    state.user = auth.user;
    unlockApp();
    await bootstrapApp();
    return;
  }
  focusPinInput();
};

document.addEventListener("DOMContentLoaded", init);




















