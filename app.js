const state = {
  page: "dashboard",
  inventory: [
    { id: "INV-001", serial: "SN-NTW-4821", brand: "Cisco", model: "Catalyst 9300", category: "Ağ Cihazı", status: "inuse", location: "Sunucu Odası A", assignedTo: "USR-003", assignedDate: "2024-11-01" },
    { id: "INV-002", serial: "SN-RAM-0012", brand: "Kingston", model: "DDR5 32GB", category: "RAM", status: "stock", location: "Depo B-2", assignedTo: null, assignedDate: null },
    { id: "INV-003", serial: "SN-SSD-7743", brand: "Samsung", model: "990 Pro 2TB M.2", category: "M.2 SSD", status: "faulty", location: "Teknik Servis", assignedTo: null, assignedDate: null },
    { id: "INV-004", serial: "SN-MB-2209", brand: "ASUS", model: "ROG Maximus Z790", category: "Anakart", status: "stock", location: "Depo A-1", assignedTo: null, assignedDate: null }
  ],
  tickets: [
    { id: "TKT-001", deviceId: "INV-003", device: "Samsung 990 Pro 2TB M.2", desc: "Disk arızası", priority: "high", status: "open", assignee: "Ahmet Kaya", createdAt: "2025-04-18", logs: [{ date: "2025-04-18", note: "Ticket açıldı" }] }
  ],
  assignments: [
    { id: "ASS-001", deviceId: "INV-001", device: "Cisco Catalyst 9300", userId: "USR-003", userName: "Mert Yıldız", assignDate: "2024-11-01", returnDate: null, active: true }
  ],
  users: [
    { id: "USR-001", name: "Ali Vural" }, { id: "USR-002", name: "Fatma Şahin" }, { id: "USR-003", name: "Mert Yıldız" }, { id: "USR-004", name: "Elif Kara" }
  ],
  technicians: ["Ahmet Kaya", "Zeynep Arslan", "Can Demir"],
  categories: ["Ağ Cihazı", "Anakart", "RAM", "M.2 SSD", "GPU", "CPU", "PSU", "Monitör", "Diğer"],
  locations: ["Depo A-1", "Depo A-2", "Depo B-1", "Depo B-2", "Sunucu Odası A", "Sunucu Odası B", "Kat 2 Ofis", "Kat 3 Ofis", "Teknik Servis"],
  logs: [
    { id: "LOG-001", action: "ZİMMET VERİLDİ", target: "INV-001", detail: "Cisco Catalyst 9300 → Mert Yıldız", date: "2024-11-01 09:12" }
  ],
  inventorySort: { key: "id", dir: "asc" }
};

const PAGES = [
  { id: "dashboard", label: "Dashboard" },
  { id: "inventory", label: "Envanter" },
  { id: "assignments", label: "Zimmet" },
  { id: "tickets", label: "Arıza/Bakım" },
  { id: "audit", label: "Audit Log" }
];

function addLog(action, target, detail) {
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  state.logs.unshift({ id: `LOG-${String(state.logs.length + 1).padStart(3, "0")}`, action, target, detail, date });
}

function statusBadge(status) {
  return `<span class="badge ${status}">${status}</span>`;
}

function mountNav() {
  const nav = document.getElementById("nav");
  nav.innerHTML = PAGES.map(p => `<button class="nav-btn ${state.page === p.id ? "active" : ""}" data-page="${p.id}">${p.label}</button>`).join("");
  nav.querySelectorAll("button").forEach(btn => btn.onclick = () => switchPage(btn.dataset.page));
}

function switchPage(page) {
  state.page = page;
  document.querySelectorAll(".page").forEach(el => el.classList.toggle("active", el.id === page));
  document.getElementById("pageTitle").textContent = PAGES.find(p => p.id === page).label;
  document.querySelectorAll(".nav-btn").forEach(el => el.classList.toggle("active", el.dataset.page === page));
  render();
}

function renderDashboard() {
  const stats = {
    total: state.inventory.length,
    stock: state.inventory.filter(i => i.status === "stock").length,
    inuse: state.inventory.filter(i => i.status === "inuse").length,
    faulty: state.inventory.filter(i => i.status === "faulty").length,
    openTickets: state.tickets.filter(t => t.status !== "done").length
  };
  document.getElementById("dashboard").innerHTML = `
    <div class="grid cards">
      <div class="card"><div class="label">Toplam Donanım</div><div class="value">${stats.total}</div></div>
      <div class="card"><div class="label">Stokta</div><div class="value" style="color:var(--green)">${stats.stock}</div></div>
      <div class="card"><div class="label">Kullanımda</div><div class="value" style="color:var(--amber)">${stats.inuse}</div></div>
      <div class="card"><div class="label">Arızalı</div><div class="value" style="color:var(--red)">${stats.faulty}</div></div>
      <div class="card"><div class="label">Açık Ticket</div><div class="value">${stats.openTickets}</div></div>
    </div>
    <div class="split" style="margin-top:14px">
      <div class="panel"><h4>Aktif Ticketlar</h4>${state.tickets.filter(t => t.status !== "done").map(t => `<p><b>${t.id}</b> - ${t.device}</p>`).join("") || "<small class='muted'>Açık ticket yok.</small>"}</div>
      <div class="panel"><h4>Son Audit Kayıtları</h4>${state.logs.slice(0, 5).map(l => `<p><b>${l.action}</b> · ${l.target}</p>`).join("")}</div>
    </div>
  `;
}

function compare(a, b, key, dir) {
  const av = (a[key] || "").toString().toLowerCase();
  const bv = (b[key] || "").toString().toLowerCase();
  return dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
}

function renderInventory() {
  const el = document.getElementById("inventory");
  const cats = state.categories.map(c => `<option>${c}</option>`).join("");
  const locs = state.locations.map(l => `<option>${l}</option>`).join("");
  el.innerHTML = `
    <div class="filters">
      <input id="q" placeholder="Seri, marka, model veya lokasyon" />
      <select id="fStatus"><option value="all">Tüm Durumlar</option><option>stock</option><option>inuse</option><option>faulty</option></select>
      <select id="fCategory"><option value="all">Tüm Kategoriler</option>${cats}</select>
      <select id="sKey"><option value="id">Sırala: ID</option><option value="serial">Seri</option><option value="brand">Marka</option><option value="status">Durum</option></select>
    </div>
    <div class="actions" style="margin-bottom:10px; justify-content:flex-start"><button class="btn primary" id="addInventory">Yeni Donanım</button></div>
    <div class="table-wrap panel"><table><thead><tr><th>ID</th><th>Seri</th><th>Marka/Model</th><th>Kategori</th><th>Durum</th><th>Lokasyon</th></tr></thead><tbody id="invRows"></tbody></table></div>
  `;

  const updateRows = () => {
    const q = document.getElementById("q").value.toLowerCase();
    const fStatus = document.getElementById("fStatus").value;
    const fCategory = document.getElementById("fCategory").value;
    const sKey = document.getElementById("sKey").value;
    let list = state.inventory.filter(i => {
      const mQ = !q || `${i.id} ${i.serial} ${i.brand} ${i.model} ${i.location}`.toLowerCase().includes(q);
      const mS = fStatus === "all" || i.status === fStatus;
      const mC = fCategory === "all" || i.category === fCategory;
      return mQ && mS && mC;
    });
    list = list.sort((a, b) => compare(a, b, sKey, state.inventorySort.dir));
    document.getElementById("invRows").innerHTML = list.map(i => `<tr>
      <td>${i.id}</td><td>${i.serial}</td><td>${i.brand} ${i.model}</td><td>${i.category}</td><td>${statusBadge(i.status)}</td><td>${i.location}</td>
    </tr>`).join("");
  };

  ["q", "fStatus", "fCategory", "sKey"].forEach(id => document.getElementById(id).addEventListener("input", updateRows));
  document.getElementById("sKey").addEventListener("change", updateRows);
  document.getElementById("addInventory").onclick = () => openModal("Yeni Donanım", `
    <div class="form-grid">
      <input id="mSerial" placeholder="Seri no" />
      <input id="mBrand" placeholder="Marka" />
      <input id="mModel" placeholder="Model" />
      <select id="mCategory">${cats}</select>
      <select id="mStatus"><option>stock</option><option>inuse</option><option>faulty</option></select>
      <select id="mLoc">${locs}</select>
    </div>
    <div class="actions"><button class="btn secondary" onclick="closeModal()">İptal</button><button class="btn primary" id="saveInv">Kaydet</button></div>
  `, () => {
    document.getElementById("saveInv").onclick = () => {
      const serial = document.getElementById("mSerial").value.trim();
      const brand = document.getElementById("mBrand").value.trim();
      const model = document.getElementById("mModel").value.trim();
      if (!serial || !brand || !model) return alert("Seri, marka, model zorunlu.");
      if (state.inventory.some(i => i.serial === serial)) return alert("Seri numarası benzersiz olmalı.");
      const item = {
        id: `INV-${String(state.inventory.length + 1).padStart(3, "0")}`,
        serial, brand, model,
        category: document.getElementById("mCategory").value,
        status: document.getElementById("mStatus").value,
        location: document.getElementById("mLoc").value,
        assignedTo: null,
        assignedDate: null
      };
      state.inventory.push(item);
      addLog("DONANIM EKLENDİ", item.id, `${item.brand} ${item.model} envantere eklendi`);
      closeModal();
      render();
    };
  });

  updateRows();
}

function renderAssignments() {
  const active = state.assignments.filter(a => a.active);
  const history = state.assignments.filter(a => !a.active);
  document.getElementById("assignments").innerHTML = `
    <div class="actions" style="justify-content:flex-start; margin-bottom:10px"><button class="btn primary" id="newAssign">Zimmet Ver</button></div>
    <div class="panel table-wrap">
      <h4>Aktif Zimmetler</h4>
      <table><thead><tr><th>ID</th><th>Cihaz</th><th>Kullanıcı</th><th>Teslim</th><th>İşlem</th></tr></thead>
      <tbody>${active.map(a => `<tr><td>${a.id}</td><td>${a.device}</td><td>${a.userName}</td><td>${a.assignDate}</td><td><button class="btn danger" data-return="${a.id}">İade Al</button></td></tr>`).join("") || "<tr><td colspan='5'>Aktif zimmet yok</td></tr>"}</tbody></table>
    </div>
    <div class="panel table-wrap" style="margin-top:12px">
      <h4>Zimmet Geçmişi</h4>
      <table><thead><tr><th>ID</th><th>Cihaz</th><th>Kullanıcı</th><th>Teslim</th><th>İade</th></tr></thead>
      <tbody>${history.map(h => `<tr><td>${h.id}</td><td>${h.device}</td><td>${h.userName}</td><td>${h.assignDate}</td><td>${h.returnDate}</td></tr>`).join("") || "<tr><td colspan='5'>Kayıt yok</td></tr>"}</tbody></table>
    </div>
  `;

  document.querySelectorAll("[data-return]").forEach(btn => btn.onclick = () => {
    const ass = state.assignments.find(a => a.id === btn.dataset.return);
    ass.active = false;
    ass.returnDate = new Date().toISOString().slice(0, 10);
    const device = state.inventory.find(i => i.id === ass.deviceId);
    if (device) Object.assign(device, { status: "stock", assignedTo: null, assignedDate: null });
    addLog("ZİMMET İADE EDİLDİ", ass.deviceId, `${ass.device} iade edildi`);
    render();
  });

  document.getElementById("newAssign").onclick = () => {
    const available = state.inventory.filter(i => i.status === "stock");
    openModal("Yeni Zimmet", `
      <div class="form-grid">
        <select id="aDevice"><option value="">Cihaz seçin</option>${available.map(d => `<option value="${d.id}">${d.id} - ${d.brand} ${d.model}</option>`).join("")}</select>
        <select id="aUser"><option value="">Kullanıcı seçin</option>${state.users.map(u => `<option value="${u.id}">${u.name}</option>`).join("")}</select>
        <input id="aDate" type="date" value="${new Date().toISOString().slice(0, 10)}" />
      </div>
      <div class="actions"><button class="btn secondary" onclick="closeModal()">İptal</button><button class="btn primary" id="saveAssign">Kaydet</button></div>
    `, () => {
      document.getElementById("saveAssign").onclick = () => {
        const deviceId = document.getElementById("aDevice").value;
        const userId = document.getElementById("aUser").value;
        if (!deviceId || !userId) return alert("Cihaz ve kullanıcı seçin");
        const device = state.inventory.find(d => d.id === deviceId);
        const user = state.users.find(u => u.id === userId);
        const assignDate = document.getElementById("aDate").value;
        state.assignments.push({ id: `ASS-${String(state.assignments.length + 1).padStart(3, "0")}`, deviceId, device: `${device.brand} ${device.model}`, userId, userName: user.name, assignDate, returnDate: null, active: true });
        Object.assign(device, { status: "inuse", assignedTo: userId, assignedDate: assignDate });
        addLog("ZİMMET VERİLDİ", deviceId, `${device.brand} ${device.model} → ${user.name}`);
        closeModal();
        render();
      };
    });
  };
}

function renderTickets() {
  const sorted = [...state.tickets].sort((a, b) => ({ critical: 0, high: 1, medium: 2, low: 3 }[a.priority] - { critical: 0, high: 1, medium: 2, low: 3 }[b.priority]));
  document.getElementById("tickets").innerHTML = `
    <div class="actions" style="justify-content:flex-start; margin-bottom:10px"><button class="btn primary" id="newTicket">Arıza Kaydı</button></div>
    <div class="panel table-wrap">
      <table><thead><tr><th>ID</th><th>Cihaz</th><th>Öncelik</th><th>Durum</th><th>Atanan</th><th>İşlem</th></tr></thead>
      <tbody>${sorted.map(t => `<tr><td>${t.id}</td><td>${t.device}</td><td>${statusBadge(t.priority)}</td><td>${statusBadge(t.status)}</td><td>${t.assignee}</td><td><button class="btn secondary" data-ticket="${t.id}">Detay</button></td></tr>`).join("")}</tbody></table>
    </div>
  `;

  document.getElementById("newTicket").onclick = () => openModal("Yeni Arıza Kaydı", `
    <div class="form-grid">
      <select id="tDevice"><option value="">Cihaz</option>${state.inventory.map(d => `<option value="${d.id}">${d.id} - ${d.brand} ${d.model}</option>`).join("")}</select>
      <select id="tPriority"><option>low</option><option selected>medium</option><option>high</option><option>critical</option></select>
      <select id="tAssignee">${state.technicians.map(t => `<option>${t}</option>`).join("")}</select>
      <textarea id="tDesc" placeholder="Açıklama"></textarea>
    </div>
    <div class="actions"><button class="btn secondary" onclick="closeModal()">İptal</button><button class="btn primary" id="saveTicket">Kaydet</button></div>
  `, () => {
    document.getElementById("saveTicket").onclick = () => {
      const deviceId = document.getElementById("tDevice").value;
      const desc = document.getElementById("tDesc").value.trim();
      if (!deviceId || !desc) return alert("Cihaz ve açıklama zorunlu.");
      const device = state.inventory.find(d => d.id === deviceId);
      const id = `TKT-${String(state.tickets.length + 1).padStart(3, "0")}`;
      const today = new Date().toISOString().slice(0, 10);
      state.tickets.push({ id, deviceId, device: `${device.brand} ${device.model}`, desc, priority: document.getElementById("tPriority").value, status: "open", assignee: document.getElementById("tAssignee").value, createdAt: today, logs: [{ date: today, note: "Ticket açıldı" }] });
      device.status = "faulty";
      addLog("ARIZA KAYDEDILDI", deviceId, `${id} oluşturuldu`);
      closeModal();
      render();
    };
  });

  document.querySelectorAll("[data-ticket]").forEach(btn => btn.onclick = () => {
    const t = state.tickets.find(x => x.id === btn.dataset.ticket);
    openModal(`${t.id} Detay`, `
      <p><b>Cihaz:</b> ${t.device}</p>
      <p><b>Açıklama:</b> ${t.desc}</p>
      <p><b>Durum:</b> ${statusBadge(t.status)}</p>
      <div class="actions">
        ${t.status === "open" ? `<button class="btn secondary" id="toProg">İncelemeye Al</button>` : ""}
        ${t.status === "inprogress" ? `<button class="btn primary" id="toDone">Tamamlandı</button>` : ""}
      </div>
      <h4>İşlem Geçmişi</h4>
      <div class="timeline">${t.logs.map(log => `<div class="timeline-item"><div>${log.note}</div><small class="muted">${log.date}</small></div>`).join("")}</div>
    `, () => {
      const toProg = document.getElementById("toProg");
      const toDone = document.getElementById("toDone");
      if (toProg) toProg.onclick = () => { t.status = "inprogress"; t.logs.push({ date: new Date().toISOString().slice(0, 10), note: "İncelemeye alındı" }); closeModal(); render(); };
      if (toDone) toDone.onclick = () => {
        t.status = "done";
        t.logs.push({ date: new Date().toISOString().slice(0, 10), note: "Tamamlandı" });
        const dev = state.inventory.find(d => d.id === t.deviceId);
        if (dev) dev.status = "stock";
        addLog("BAKIM TAMAMLANDI", t.deviceId, `${t.id} kapatıldı`);
        closeModal();
        render();
      };
    });
  });
}

function renderAudit() {
  document.getElementById("audit").innerHTML = `
    <div class="panel table-wrap">
      <small class="muted">Audit log kayıtları silinemez.</small>
      <table><thead><tr><th>LOG ID</th><th>Eylem</th><th>Hedef</th><th>Detay</th><th>Tarih</th></tr></thead>
      <tbody>${state.logs.map(l => `<tr><td>${l.id}</td><td>${l.action}</td><td>${l.target}</td><td>${l.detail}</td><td>${l.date}</td></tr>`).join("")}</tbody></table>
    </div>
  `;
}

function render() {
  document.getElementById("topAction").hidden = true;
  renderDashboard();
  renderInventory();
  renderAssignments();
  renderTickets();
  renderAudit();
  switchPage(state.page);
}

function openModal(title, html, onReady) {
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalBody").innerHTML = html;
  document.getElementById("modal").showModal();
  if (onReady) onReady();
}
function closeModal() { document.getElementById("modal").close(); }
window.closeModal = closeModal;

mountNav();
render();
