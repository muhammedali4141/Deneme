import { useState, useEffect, useRef } from "react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const INITIAL_INVENTORY = [
  { id: "INV-001", serial: "SN-NTW-4821", brand: "Cisco", model: "Catalyst 9300", category: "Ağ Cihazı", status: "inuse", location: "Sunucu Odası A", assignedTo: "USR-003", assignedDate: "2024-11-01" },
  { id: "INV-002", serial: "SN-RAM-0012", brand: "Kingston", model: "DDR5 32GB", category: "RAM", status: "stock", location: "Depo B-2", assignedTo: null, assignedDate: null },
  { id: "INV-003", serial: "SN-SSD-7743", brand: "Samsung", model: "990 Pro 2TB M.2", category: "M.2 SSD", status: "faulty", location: "Teknik Servis", assignedTo: null, assignedDate: null },
  { id: "INV-004", serial: "SN-MB-2209", brand: "ASUS", model: "ROG Maximus Z790", category: "Anakart", status: "stock", location: "Depo A-1", assignedTo: null, assignedDate: null },
  { id: "INV-005", serial: "SN-NTW-9934", brand: "Ubiquiti", model: "UniFi AP Pro", category: "Ağ Cihazı", status: "inuse", location: "Kat 3 Ofis", assignedTo: "USR-007", assignedDate: "2024-09-15" },
  { id: "INV-006", serial: "SN-SSD-4410", brand: "WD", model: "Black SN850X 1TB", category: "M.2 SSD", status: "inuse", location: "Kat 2 Ofis", assignedTo: "USR-001", assignedDate: "2025-01-10" },
  { id: "INV-007", serial: "SN-RAM-8801", brand: "Corsair", model: "Vengeance DDR5 64GB", category: "RAM", status: "faulty", location: "Teknik Servis", assignedTo: null, assignedDate: null },
  { id: "INV-008", serial: "SN-NTW-1122", brand: "MikroTik", model: "CCR2004-16G-2S+", category: "Ağ Cihazı", status: "stock", location: "Depo B-1", assignedTo: null, assignedDate: null },
];

const INITIAL_TICKETS = [
  { id: "TKT-001", deviceId: "INV-003", device: "Samsung 990 Pro 2TB M.2", desc: "Cihaz BIOS tarafından tanınmıyor, disk hatası veriyor.", priority: "high", status: "open", assignee: "Ahmet Kaya", createdAt: "2025-04-18", logs: [{ date: "2025-04-18", note: "Ticket açıldı. İlk inceleme bekleniyor." }] },
  { id: "TKT-002", deviceId: "INV-007", device: "Corsair Vengeance DDR5 64GB", desc: "Sistem sürekli mavi ekran veriyor, RAM arızası şüphesi.", priority: "critical", status: "inprogress", assignee: "Zeynep Arslan", createdAt: "2025-04-19", logs: [{ date: "2025-04-19", note: "Ticket açıldı." }, { date: "2025-04-20", note: "RAM test aşamasına alındı. MemTest86 çalıştırılıyor." }] },
  { id: "TKT-003", deviceId: "INV-005", device: "Ubiquiti UniFi AP Pro", desc: "Periyodik bakım yapılacak, firmware güncellemesi gerekiyor.", priority: "low", status: "done", assignee: "Can Demir", createdAt: "2025-04-10", logs: [{ date: "2025-04-10", note: "Bakım planlandı." }, { date: "2025-04-12", note: "Firmware v6.5.55 yüklendi. Test OK." }, { date: "2025-04-12", note: "Tamamlandı." }] },
];

const INITIAL_ASSIGNMENTS = [
  { id: "ASS-001", deviceId: "INV-001", device: "Cisco Catalyst 9300", userId: "USR-003", userName: "Mert Yıldız", assignDate: "2024-11-01", returnDate: null, active: true },
  { id: "ASS-002", deviceId: "INV-005", device: "Ubiquiti UniFi AP Pro", userId: "USR-007", userName: "Selin Çelik", assignDate: "2024-09-15", returnDate: null, active: true },
  { id: "ASS-003", deviceId: "INV-006", device: "WD Black SN850X 1TB", userId: "USR-001", userName: "Ali Vural", assignDate: "2025-01-10", returnDate: null, active: true },
  { id: "ASS-004", deviceId: "INV-002", device: "Kingston DDR5 32GB", userId: "USR-002", userName: "Fatma Şahin", assignDate: "2024-06-01", returnDate: "2024-10-30", active: false },
];

const USERS = [
  { id: "USR-001", name: "Ali Vural" }, { id: "USR-002", name: "Fatma Şahin" },
  { id: "USR-003", name: "Mert Yıldız" }, { id: "USR-004", name: "Elif Kara" },
  { id: "USR-005", name: "Burak Doğan" }, { id: "USR-006", name: "Hande Yılmaz" },
  { id: "USR-007", name: "Selin Çelik" }, { id: "USR-008", name: "Onur Tekin" },
];

const CATEGORIES = ["Ağ Cihazı", "Anakart", "RAM", "M.2 SSD", "GPU", "CPU", "PSU", "Monitör", "Diğer"];
const LOCATIONS = ["Depo A-1", "Depo A-2", "Depo B-1", "Depo B-2", "Sunucu Odası A", "Sunucu Odası B", "Kat 2 Ofis", "Kat 3 Ofis", "Teknik Servis"];
const TECHNICIANS = ["Ahmet Kaya", "Zeynep Arslan", "Can Demir", "Berk Özkan"];

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 16 }) => {
  const icons = {
    dashboard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    inventory: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-6 9 6v11a1 1 0 01-1 1H4a1 1 0 01-1-1z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    assign: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
    ticket: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14.5 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8.5L14.5 3z"/><polyline points="14 3 14 9 20 9"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    chevron: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>,
    alert: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    box: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    history: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>,
    cpu: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,
    filter: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
    eye: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    log: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  };
  return icons[name] || null;
};

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status, type = "inventory" }) => {
  const inventoryMap = {
    stock: { label: "Stokta", color: "#00ff88", bg: "rgba(0,255,136,0.12)", dot: "#00ff88" },
    inuse: { label: "Kullanımda", color: "#fbbf24", bg: "rgba(251,191,36,0.12)", dot: "#fbbf24" },
    faulty: { label: "Arızalı", color: "#ff4455", bg: "rgba(255,68,85,0.12)", dot: "#ff4455" },
  };
  const ticketMap = {
    open: { label: "Açık", color: "#ff4455", bg: "rgba(255,68,85,0.12)" },
    inprogress: { label: "İnceleniyor", color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
    done: { label: "Tamamlandı", color: "#00ff88", bg: "rgba(0,255,136,0.12)" },
  };
  const priorityMap = {
    low: { label: "Düşük", color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
    medium: { label: "Orta", color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
    high: { label: "Yüksek", color: "#f97316", bg: "rgba(249,115,22,0.12)" },
    critical: { label: "Kritik", color: "#ff4455", bg: "rgba(255,68,85,0.12)" },
  };
  const map = type === "inventory" ? inventoryMap : type === "ticket" ? ticketMap : priorityMap;
  const cfg = map[status] || { label: status, color: "#888", bg: "rgba(136,136,136,0.12)" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", fontFamily: "monospace" }}>
      {type === "inventory" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, boxShadow: `0 0 6px ${cfg.dot}` }} />}
      {cfg.label}
    </span>
  );
};

// ─── MODAL ────────────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, children, width = 540 }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }} />
      <div style={{ position: "relative", width: "100%", maxWidth: width, background: "#0f1117", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 28, boxShadow: "0 40px 80px rgba(0,0,0,0.6)" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "'DM Mono', monospace" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer", color: "#888", display: "flex", alignItems: "center" }}>
            <Icon name="x" size={14} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ─── FORM FIELD ───────────────────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>{label}</label>
    {children}
  </div>
);
const Input = (props) => (
  <input {...props} style={{ width: "100%", background: "#1a1d27", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 13, fontFamily: "'DM Mono', monospace", outline: "none", boxSizing: "border-box", ...props.style }} />
);
const Select = ({ children, ...props }) => (
  <select {...props} style={{ width: "100%", background: "#1a1d27", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 13, fontFamily: "'DM Mono', monospace", outline: "none", boxSizing: "border-box" }}>
    {children}
  </select>
);
const Textarea = (props) => (
  <textarea {...props} style={{ width: "100%", background: "#1a1d27", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 13, fontFamily: "'DM Mono', monospace", outline: "none", resize: "vertical", minHeight: 80, boxSizing: "border-box" }} />
);
const Btn = ({ children, variant = "primary", ...props }) => {
  const styles = {
    primary: { background: "#00ff88", color: "#000", fontWeight: 800 },
    secondary: { background: "rgba(255,255,255,0.06)", color: "#ccc", fontWeight: 600 },
    danger: { background: "rgba(255,68,85,0.15)", color: "#ff4455", border: "1px solid rgba(255,68,85,0.3)", fontWeight: 600 },
    ghost: { background: "transparent", color: "#888", fontWeight: 600 },
  };
  return (
    <button {...props} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontFamily: "'DM Mono', monospace", letterSpacing: "0.03em", transition: "opacity 0.15s", ...styles[variant], ...props.style }}>
      {children}
    </button>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);
  const [auditLog, setAuditLog] = useState([
    { id: "LOG-001", action: "ZİMMET VERİLDİ", target: "INV-001", detail: "Cisco Catalyst 9300 → Mert Yıldız", date: "2024-11-01 09:12" },
    { id: "LOG-002", action: "ZİMMET VERİLDİ", target: "INV-005", detail: "Ubiquiti UniFi AP Pro → Selin Çelik", date: "2024-09-15 14:30" },
    { id: "LOG-003", action: "ARIZA KAYDEDILDI", target: "INV-003", detail: "Samsung 990 Pro 2TB M.2 — TKT-001 açıldı", date: "2025-04-18 10:05" },
    { id: "LOG-004", action: "ZİMMET VERİLDİ", target: "INV-006", detail: "WD Black SN850X 1TB → Ali Vural", date: "2025-01-10 08:55" },
    { id: "LOG-005", action: "ARIZA KAYDEDILDI", target: "INV-007", detail: "Corsair Vengeance DDR5 64GB — TKT-002 açıldı", date: "2025-04-19 11:20" },
    { id: "LOG-006", action: "BAKIM TAMAMLANDI", target: "INV-005", detail: "TKT-003 kapatıldı. Firmware güncellendi.", date: "2025-04-12 16:40" },
  ]);

  const addLog = (action, target, detail) => {
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")} ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    setAuditLog(prev => [{ id: `LOG-${String(prev.length+1).padStart(3,"0")}`, action, target, detail, date }, ...prev]);
  };

  const stats = {
    total: inventory.length,
    stock: inventory.filter(i => i.status === "stock").length,
    inuse: inventory.filter(i => i.status === "inuse").length,
    faulty: inventory.filter(i => i.status === "faulty").length,
    openTickets: tickets.filter(t => t.status !== "done").length,
    activeAssign: assignments.filter(a => a.active).length,
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "inventory", label: "Envanter", icon: "inventory" },
    { id: "assignments", label: "Zimmet", icon: "assign" },
    { id: "tickets", label: "Arıza / Bakım", icon: "ticket" },
    { id: "auditlog", label: "Audit Log", icon: "log" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080a0e; color: #e0e0e0; font-family: 'DM Mono', monospace; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        select option { background: #1a1d27; }
        input::placeholder { color: #444; }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.4); }
      `}</style>
      <div style={{ display: "flex", minHeight: "100vh", background: "#080a0e" }}>
        {/* SIDEBAR */}
        <nav style={{ width: 220, background: "#0a0c12", borderRight: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", padding: "24px 0", position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 100 }}>
          <div style={{ padding: "0 20px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #00ff88, #00ccff)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="cpu" size={16} />
              </div>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 13, color: "#fff", lineHeight: 1 }}>IT ASSET</div>
                <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.12em", marginTop: 2 }}>MANAGEMENT SYSTEM</div>
              </div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            {navItems.map(item => {
              const active = page === item.id;
              return (
                <button key={item.id} onClick={() => setPage(item.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 20px", background: active ? "rgba(0,255,136,0.07)" : "transparent", border: "none", borderLeft: active ? "2px solid #00ff88" : "2px solid transparent", color: active ? "#00ff88" : "#555", cursor: "pointer", fontSize: 12, fontFamily: "'DM Mono', monospace", fontWeight: active ? 500 : 400, transition: "all 0.15s", textAlign: "left" }}>
                  <Icon name={item.icon} size={15} />
                  {item.label}
                </button>
              );
            })}
          </div>
          <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ fontSize: 10, color: "#333", letterSpacing: "0.06em" }}>v1.0.0 — MVP Build</div>
          </div>
        </nav>

        {/* MAIN */}
        <main style={{ marginLeft: 220, flex: 1, minHeight: "100vh", padding: "32px 36px" }}>
          {page === "dashboard" && <Dashboard stats={stats} inventory={inventory} tickets={tickets} assignments={assignments} />}
          {page === "inventory" && <Inventory inventory={inventory} setInventory={setInventory} addLog={addLog} />}
          {page === "assignments" && <Assignments inventory={inventory} setInventory={setInventory} assignments={assignments} setAssignments={setAssignments} addLog={addLog} />}
          {page === "tickets" && <Tickets inventory={inventory} setInventory={setInventory} tickets={tickets} setTickets={setTickets} addLog={addLog} />}
          {page === "auditlog" && <AuditLog logs={auditLog} />}
        </main>
      </div>
    </>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ stats, inventory, tickets, assignments }) {
  const cards = [
    { label: "Toplam Donanım", value: stats.total, color: "#60a5fa", icon: "box" },
    { label: "Stokta", value: stats.stock, color: "#00ff88", icon: "inventory" },
    { label: "Kullanımda", value: stats.inuse, color: "#fbbf24", icon: "assign" },
    { label: "Arızalı", value: stats.faulty, color: "#ff4455", icon: "alert" },
    { label: "Açık Ticket", value: stats.openTickets, color: "#f97316", icon: "ticket" },
    { label: "Aktif Zimmet", value: stats.activeAssign, color: "#a78bfa", icon: "log" },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Sistem geneli anlık durum özeti" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: "#0d0f18", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "20px 22px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: c.color, opacity: 0.6 }} />
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 11, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{c.label}</div>
                <div style={{ fontSize: 36, fontWeight: 700, color: c.color, fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>{c.value}</div>
              </div>
              <div style={{ color: c.color, opacity: 0.4 }}><Icon name={c.icon} size={24} /></div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Recent Inventory */}
        <div style={{ background: "#0d0f18", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "20px 22px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#888", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>Son Eklenen Donanımlar</div>
          {inventory.slice(0, 5).map(item => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div>
                <div style={{ fontSize: 12, color: "#ccc", fontWeight: 500 }}>{item.brand} {item.model}</div>
                <div style={{ fontSize: 10, color: "#444", marginTop: 2 }}>{item.serial} · {item.category}</div>
              </div>
              <StatusBadge status={item.status} />
            </div>
          ))}
        </div>

        {/* Open Tickets */}
        <div style={{ background: "#0d0f18", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "20px 22px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#888", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>Aktif Ticket'lar</div>
          {tickets.filter(t => t.status !== "done").map(t => (
            <div key={t.id} style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: "#555", fontFamily: "monospace" }}>{t.id}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <StatusBadge status={t.priority} type="priority" />
                  <StatusBadge status={t.status} type="ticket" />
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#bbb" }}>{t.device}</div>
              <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>Atanan: {t.assignee}</div>
            </div>
          ))}
          {tickets.filter(t => t.status !== "done").length === 0 && (
            <div style={{ fontSize: 12, color: "#333", textAlign: "center", padding: "20px 0" }}>Açık ticket yok ✓</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PAGE HEADER ──────────────────────────────────────────────────────────────
function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 }}>
      <div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, color: "#fff", lineHeight: 1.1 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 12, color: "#444", marginTop: 4 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── TABLE ────────────────────────────────────────────────────────────────────
function Table({ headers, children, empty }) {
  return (
    <div style={{ background: "#0d0f18", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h} style={{ padding: "12px 16px", fontSize: 10, fontWeight: 700, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "#0a0c12", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {empty && <div style={{ textAlign: "center", padding: "40px", fontSize: 13, color: "#333" }}>Kayıt bulunamadı</div>}
    </div>
  );
}
function TR({ children, onClick }) {
  return (
    <tr onClick={onClick} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: onClick ? "pointer" : "default", transition: "background 0.1s" }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
      {children}
    </tr>
  );
}
function TD({ children, mono }) {
  return <td style={{ padding: "12px 16px", fontSize: 12, color: "#bbb", fontFamily: mono ? "'DM Mono', monospace" : "inherit" }}>{children}</td>;
}

// ─── INVENTORY PAGE ───────────────────────────────────────────────────────────
function Inventory({ inventory, setInventory, addLog }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [modal, setModal] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [form, setForm] = useState({ serial: "", brand: "", model: "", category: CATEGORIES[0], status: "stock", location: LOCATIONS[0] });

  const filtered = inventory.filter(i => {
    const q = search.toLowerCase();
    const matchQ = !q || i.serial.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q) || i.model.toLowerCase().includes(q) || i.location.toLowerCase().includes(q);
    const matchS = filterStatus === "all" || i.status === filterStatus;
    const matchC = filterCat === "all" || i.category === filterCat;
    return matchQ && matchS && matchC;
  });

  const handleAdd = () => {
    if (!form.serial || !form.brand || !form.model) return;
    const newItem = { ...form, id: `INV-${String(inventory.length + 1).padStart(3, "0")}`, assignedTo: null, assignedDate: null };
    setInventory(prev => [...prev, newItem]);
    addLog("DONANIM EKLENDİ", newItem.id, `${form.brand} ${form.model} (${form.serial}) envantere eklendi.`);
    setModal(false);
    setForm({ serial: "", brand: "", model: "", category: CATEGORIES[0], status: "stock", location: LOCATIONS[0] });
  };

  return (
    <div>
      <PageHeader title="Envanter Yönetimi" subtitle={`${inventory.length} kayıt`}
        action={<Btn onClick={() => setModal(true)}><Icon name="plus" size={14} /> Yeni Donanım</Btn>} />

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#444" }}><Icon name="search" size={14} /></div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Seri no, marka, model, lokasyon..."
            style={{ width: "100%", background: "#0d0f18", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "9px 12px 9px 36px", color: "#ccc", fontSize: 12, fontFamily: "'DM Mono', monospace", outline: "none" }} />
        </div>
        <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 140 }}>
          <option value="all">Tüm Durumlar</option>
          <option value="stock">Stokta</option>
          <option value="inuse">Kullanımda</option>
          <option value="faulty">Arızalı</option>
        </Select>
        <Select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ width: 160 }}>
          <option value="all">Tüm Kategoriler</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
      </div>

      <Table headers={["ID", "Seri No", "Marka / Model", "Kategori", "Durum", "Lokasyon", ""]} empty={filtered.length === 0}>
        {filtered.map(item => (
          <TR key={item.id} onClick={() => setDetailItem(item)}>
            <TD mono><span style={{ color: "#444" }}>{item.id}</span></TD>
            <TD mono><span style={{ color: "#00ff88", fontSize: 11 }}>{item.serial}</span></TD>
            <TD><div style={{ fontWeight: 500, color: "#e0e0e0" }}>{item.brand} {item.model}</div></TD>
            <TD><span style={{ background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 4, fontSize: 11 }}>{item.category}</span></TD>
            <TD><StatusBadge status={item.status} /></TD>
            <TD><span style={{ color: "#666" }}>{item.location}</span></TD>
            <TD><Icon name="eye" size={14} /></TD>
          </TR>
        ))}
      </Table>

      {/* Add Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="// YENİ DONANIM EKLE">
        <Field label="Seri Numarası *"><Input value={form.serial} onChange={e => setForm(p => ({...p, serial: e.target.value}))} placeholder="SN-XXX-0000" /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Marka *"><Input value={form.brand} onChange={e => setForm(p => ({...p, brand: e.target.value}))} placeholder="Samsung" /></Field>
          <Field label="Model *"><Input value={form.model} onChange={e => setForm(p => ({...p, model: e.target.value}))} placeholder="990 Pro 2TB" /></Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Kategori"><Select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</Select></Field>
          <Field label="Durum"><Select value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))}><option value="stock">Stokta</option><option value="inuse">Kullanımda</option><option value="faulty">Arızalı</option></Select></Field>
        </div>
        <Field label="Lokasyon"><Select value={form.location} onChange={e => setForm(p => ({...p, location: e.target.value}))}>{LOCATIONS.map(l => <option key={l}>{l}</option>)}</Select></Field>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
          <Btn variant="secondary" onClick={() => setModal(false)}>İptal</Btn>
          <Btn onClick={handleAdd}><Icon name="plus" size={13} /> Ekle</Btn>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!detailItem} onClose={() => setDetailItem(null)} title={`// ${detailItem?.id} — DETAY`}>
        {detailItem && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
              {[
                ["Seri No", detailItem.serial],
                ["Marka", detailItem.brand],
                ["Model", detailItem.model],
                ["Kategori", detailItem.category],
                ["Lokasyon", detailItem.location],
                ["Zimmet", detailItem.assignedTo || "—"],
                ["Teslim Tarihi", detailItem.assignedDate || "—"],
              ].map(([k, v]) => (
                <div key={k} style={{ padding: "10px 12px", background: "rgba(255,255,255,0.02)", margin: "1px", borderRadius: 4 }}>
                  <div style={{ fontSize: 10, color: "#444", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: 12, color: "#ccc" }}>{v}</div>
                </div>
              ))}
              <div style={{ padding: "10px 12px", background: "rgba(255,255,255,0.02)", margin: "1px", borderRadius: 4 }}>
                <div style={{ fontSize: 10, color: "#444", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Durum</div>
                <StatusBadge status={detailItem.status} />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── ASSIGNMENTS PAGE ─────────────────────────────────────────────────────────
function Assignments({ inventory, setInventory, assignments, setAssignments, addLog }) {
  const [modal, setModal] = useState(false);
  const [histModal, setHistModal] = useState(null);
  const [form, setForm] = useState({ deviceId: "", userId: "", assignDate: new Date().toISOString().slice(0, 10) });

  const availableDevices = inventory.filter(i => i.status === "stock");

  const handleAssign = () => {
    if (!form.deviceId || !form.userId) return;
    const device = inventory.find(i => i.id === form.deviceId);
    const user = USERS.find(u => u.id === form.userId);
    const newAss = { id: `ASS-${String(assignments.length + 1).padStart(3, "0")}`, deviceId: form.deviceId, device: `${device.brand} ${device.model}`, userId: form.userId, userName: user.name, assignDate: form.assignDate, returnDate: null, active: true };
    setAssignments(prev => [...prev, newAss]);
    setInventory(prev => prev.map(i => i.id === form.deviceId ? { ...i, status: "inuse", assignedTo: form.userId, assignedDate: form.assignDate } : i));
    addLog("ZİMMET VERİLDİ", form.deviceId, `${device.brand} ${device.model} → ${user.name}`);
    setModal(false);
    setForm({ deviceId: "", userId: "", assignDate: new Date().toISOString().slice(0, 10) });
  };

  const handleReturn = (ass) => {
    const today = new Date().toISOString().slice(0, 10);
    setAssignments(prev => prev.map(a => a.id === ass.id ? { ...a, active: false, returnDate: today } : a));
    setInventory(prev => prev.map(i => i.id === ass.deviceId ? { ...i, status: "stock", assignedTo: null, assignedDate: null } : i));
    addLog("ZİMMET İADE EDİLDİ", ass.deviceId, `${ass.device} — ${ass.userName} tarafından iade edildi.`);
  };

  const active = assignments.filter(a => a.active);
  const history = assignments.filter(a => !a.active);

  return (
    <div>
      <PageHeader title="Zimmet Yönetimi" subtitle={`${active.length} aktif zimmet`}
        action={<Btn onClick={() => setModal(true)} style={{ opacity: availableDevices.length === 0 ? 0.5 : 1 }} disabled={availableDevices.length === 0}><Icon name="plus" size={14} /> Zimmet Ver</Btn>} />

      <div style={{ fontSize: 12, color: "#444", marginBottom: 16 }}>Stokta {availableDevices.length} cihaz zimmetlenmeye hazır</div>

      <div style={{ marginBottom: 10, fontSize: 11, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase" }}>Aktif Zimmetler</div>
      <Table headers={["ZİMMET ID", "Cihaz", "Kullanıcı", "Teslim Tarihi", "İşlem"]} empty={active.length === 0}>
        {active.map(a => (
          <TR key={a.id}>
            <TD mono><span style={{ color: "#a78bfa" }}>{a.id}</span></TD>
            <TD><div style={{ color: "#e0e0e0", fontWeight: 500 }}>{a.device}</div><div style={{ fontSize: 10, color: "#444", marginTop: 2 }}>{a.deviceId}</div></TD>
            <TD><div style={{ color: "#fbbf24" }}>{a.userName}</div><div style={{ fontSize: 10, color: "#444" }}>{a.userId}</div></TD>
            <TD mono><span style={{ color: "#666" }}>{a.assignDate}</span></TD>
            <TD>
              <div style={{ display: "flex", gap: 6 }}>
                <Btn variant="danger" onClick={() => handleReturn(a)} style={{ fontSize: 11, padding: "5px 10px" }}>İade Al</Btn>
                <Btn variant="ghost" onClick={() => setHistModal(a)} style={{ fontSize: 11, padding: "5px 10px" }}><Icon name="history" size={12} /></Btn>
              </div>
            </TD>
          </TR>
        ))}
      </Table>

      {history.length > 0 && (
        <>
          <div style={{ fontSize: 11, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", margin: "24px 0 10px" }}>Geçmiş Zimmetler</div>
          <Table headers={["ZİMMET ID", "Cihaz", "Kullanıcı", "Teslim", "İade"]} empty={false}>
            {history.map(a => (
              <TR key={a.id}>
                <TD mono><span style={{ color: "#333" }}>{a.id}</span></TD>
                <TD><span style={{ color: "#666" }}>{a.device}</span></TD>
                <TD><span style={{ color: "#555" }}>{a.userName}</span></TD>
                <TD mono><span style={{ color: "#444" }}>{a.assignDate}</span></TD>
                <TD mono><span style={{ color: "#00ff88", fontSize: 11 }}>{a.returnDate}</span></TD>
              </TR>
            ))}
          </Table>
        </>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="// YENİ ZİMMET">
        <Field label="Cihaz Seç *">
          <Select value={form.deviceId} onChange={e => setForm(p => ({...p, deviceId: e.target.value}))}>
            <option value="">— Cihaz seçin —</option>
            {availableDevices.map(d => <option key={d.id} value={d.id}>{d.id} — {d.brand} {d.model} ({d.serial})</option>)}
          </Select>
        </Field>
        <Field label="Kullanıcı *">
          <Select value={form.userId} onChange={e => setForm(p => ({...p, userId: e.target.value}))}>
            <option value="">— Kullanıcı seçin —</option>
            {USERS.map(u => <option key={u.id} value={u.id}>{u.name} ({u.id})</option>)}
          </Select>
        </Field>
        <Field label="Teslim Tarihi"><Input type="date" value={form.assignDate} onChange={e => setForm(p => ({...p, assignDate: e.target.value}))} /></Field>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
          <Btn variant="secondary" onClick={() => setModal(false)}>İptal</Btn>
          <Btn onClick={handleAssign}><Icon name="assign" size={13} /> Zimmet Ver</Btn>
        </div>
      </Modal>

      <Modal open={!!histModal} onClose={() => setHistModal(null)} title={`// ${histModal?.id} — GEÇMİŞ`}>
        {histModal && (
          <div>
            <div style={{ padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: 8, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Cihaz: <span style={{ color: "#fbbf24" }}>{histModal.device}</span></div>
              <div style={{ fontSize: 12, color: "#888" }}>Kullanıcı: <span style={{ color: "#a78bfa" }}>{histModal.userName}</span></div>
            </div>
            <div style={{ fontSize: 11, color: "#444", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Zimmet Timeline</div>
            <div style={{ borderLeft: "1px solid rgba(255,255,255,0.06)", marginLeft: 8 }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 16, marginLeft: -8 }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#00ff88", flexShrink: 0, marginTop: 1 }} />
                <div><div style={{ fontSize: 11, color: "#00ff88" }}>Teslim Edildi</div><div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{histModal.assignDate}</div></div>
              </div>
              {histModal.returnDate && (
                <div style={{ display: "flex", gap: 12, marginLeft: -8 }}>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#ff4455", flexShrink: 0, marginTop: 1 }} />
                  <div><div style={{ fontSize: 11, color: "#ff4455" }}>İade Alındı</div><div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{histModal.returnDate}</div></div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── TICKETS PAGE ─────────────────────────────────────────────────────────────
function Tickets({ inventory, setInventory, tickets, setTickets, addLog }) {
  const [modal, setModal] = useState(false);
  const [detailTicket, setDetailTicket] = useState(null);
  const [logNote, setLogNote] = useState("");
  const [form, setForm] = useState({ deviceId: "", desc: "", priority: "medium", assignee: TECHNICIANS[0] });

  const handleCreate = () => {
    if (!form.deviceId || !form.desc) return;
    const device = inventory.find(i => i.id === form.deviceId);
    const today = new Date().toISOString().slice(0, 10);
    const id = `TKT-${String(tickets.length + 1).padStart(3, "0")}`;
    const newTicket = { id, deviceId: form.deviceId, device: `${device.brand} ${device.model}`, desc: form.desc, priority: form.priority, status: "open", assignee: form.assignee, createdAt: today, logs: [{ date: today, note: "Ticket açıldı." }] };
    setTickets(prev => [...prev, newTicket]);
    setInventory(prev => prev.map(i => i.id === form.deviceId ? { ...i, status: "faulty" } : i));
    addLog("ARIZA KAYDEDILDI", form.deviceId, `${device.brand} ${device.model} — ${id} açıldı`);
    setModal(false);
    setForm({ deviceId: "", desc: "", priority: "medium", assignee: TECHNICIANS[0] });
  };

  const updateStatus = (tkt, status) => {
    const today = new Date().toISOString().slice(0, 10);
    const label = { open: "Açık duruma alındı.", inprogress: "İncelemeye başlandı.", done: "Tamamlandı ve kapatıldı." };
    setTickets(prev => prev.map(t => t.id === tkt.id ? { ...t, status, logs: [...t.logs, { date: today, note: label[status] }] } : t));
    if (status === "done") {
      setInventory(prev => prev.map(i => i.id === tkt.deviceId ? { ...i, status: "stock" } : i));
      addLog("BAKIM TAMAMLANDI", tkt.deviceId, `${tkt.id} kapatıldı.`);
    }
    if (detailTicket?.id === tkt.id) setDetailTicket(prev => ({ ...prev, status, logs: [...prev.logs, { date: today, note: label[status] }] }));
  };

  const addTicketLog = (tkt) => {
    if (!logNote.trim()) return;
    const today = new Date().toISOString().slice(0, 10);
    setTickets(prev => prev.map(t => t.id === tkt.id ? { ...t, logs: [...t.logs, { date: today, note: logNote }] } : t));
    if (detailTicket?.id === tkt.id) setDetailTicket(prev => ({ ...prev, logs: [...prev.logs, { date: today, note: logNote }] }));
    setLogNote("");
  };

  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = [...tickets].sort((a, b) => (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3));

  return (
    <div>
      <PageHeader title="Arıza & Bakım Takibi" subtitle={`${tickets.filter(t => t.status !== "done").length} açık ticket`}
        action={<Btn onClick={() => setModal(true)}><Icon name="plus" size={14} /> Arıza Kaydı</Btn>} />

      <Table headers={["ID", "Cihaz", "Öncelik", "Durum", "Atanan", "Tarih", ""]} empty={tickets.length === 0}>
        {sorted.map(t => (
          <TR key={t.id} onClick={() => setDetailTicket(t)}>
            <TD mono><span style={{ color: "#555" }}>{t.id}</span></TD>
            <TD><div style={{ color: "#e0e0e0", fontWeight: 500 }}>{t.device}</div><div style={{ fontSize: 10, color: "#444", marginTop: 2 }}>{t.desc.slice(0, 48)}…</div></TD>
            <TD><StatusBadge status={t.priority} type="priority" /></TD>
            <TD><StatusBadge status={t.status} type="ticket" /></TD>
            <TD><span style={{ color: "#666" }}>{t.assignee}</span></TD>
            <TD mono><span style={{ color: "#444" }}>{t.createdAt}</span></TD>
            <TD><Icon name="eye" size={14} /></TD>
          </TR>
        ))}
      </Table>

      <Modal open={modal} onClose={() => setModal(false)} title="// YENİ ARIZA KAYDI">
        <Field label="Cihaz *">
          <Select value={form.deviceId} onChange={e => setForm(p => ({...p, deviceId: e.target.value}))}>
            <option value="">— Cihaz seçin —</option>
            {inventory.map(d => <option key={d.id} value={d.id}>{d.id} — {d.brand} {d.model}</option>)}
          </Select>
        </Field>
        <Field label="Arıza Açıklaması *"><Textarea value={form.desc} onChange={e => setForm(p => ({...p, desc: e.target.value}))} placeholder="Sorunu detaylı açıklayın..." /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Öncelik">
            <Select value={form.priority} onChange={e => setForm(p => ({...p, priority: e.target.value}))}>
              <option value="low">Düşük</option><option value="medium">Orta</option><option value="high">Yüksek</option><option value="critical">Kritik</option>
            </Select>
          </Field>
          <Field label="Teknik Personel">
            <Select value={form.assignee} onChange={e => setForm(p => ({...p, assignee: e.target.value}))}>
              {TECHNICIANS.map(t => <option key={t}>{t}</option>)}
            </Select>
          </Field>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
          <Btn variant="secondary" onClick={() => setModal(false)}>İptal</Btn>
          <Btn onClick={handleCreate}><Icon name="ticket" size={13} /> Kaydet</Btn>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!detailTicket} onClose={() => setDetailTicket(null)} title={`// ${detailTicket?.id} — DETAY`} width={600}>
        {detailTicket && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 10, color: "#444", marginBottom: 4 }}>DURUM</div>
                <StatusBadge status={detailTicket.status} type="ticket" />
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 10, color: "#444", marginBottom: 4 }}>ÖNCELİK</div>
                <StatusBadge status={detailTicket.priority} type="priority" />
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 10, color: "#444", marginBottom: 4 }}>ATANAN</div>
                <span style={{ fontSize: 12, color: "#ccc" }}>{detailTicket.assignee}</span>
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "12px", marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: "#444", marginBottom: 6 }}>AÇIKLAMA</div>
              <p style={{ fontSize: 12, color: "#bbb", lineHeight: 1.6 }}>{detailTicket.desc}</p>
            </div>

            {/* Status Actions */}
            {detailTicket.status !== "done" && (
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {detailTicket.status === "open" && <Btn variant="secondary" onClick={() => updateStatus(detailTicket, "inprogress")} style={{ fontSize: 11 }}>→ İncelemeye Al</Btn>}
                {detailTicket.status === "inprogress" && <Btn onClick={() => updateStatus(detailTicket, "done")} style={{ fontSize: 11 }}>✓ Tamamlandı</Btn>}
              </div>
            )}

            {/* Timeline */}
            <div style={{ fontSize: 11, color: "#444", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>İşlem Geçmişi</div>
            <div style={{ borderLeft: "1px solid rgba(255,255,255,0.06)", marginLeft: 8, marginBottom: 16 }}>
              {detailTicket.logs.map((log, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, marginLeft: -6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#333", border: "2px solid #555", flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: 11, color: "#888" }}>{log.note}</div>
                    <div style={{ fontSize: 10, color: "#444", marginTop: 2 }}>{log.date}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Log */}
            {detailTicket.status !== "done" && (
              <div style={{ display: "flex", gap: 8 }}>
                <Input value={logNote} onChange={e => setLogNote(e.target.value)} placeholder="İşlem notu ekle..." style={{ flex: 1, padding: "8px 12px" }} onKeyDown={e => e.key === "Enter" && addTicketLog(detailTicket)} />
                <Btn variant="secondary" onClick={() => addTicketLog(detailTicket)} style={{ fontSize: 11, padding: "8px 12px" }}>Ekle</Btn>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── AUDIT LOG PAGE ───────────────────────────────────────────────────────────
function AuditLog({ logs }) {
  const colors = {
    "ZİMMET VERİLDİ": "#a78bfa",
    "ZİMMET İADE EDİLDİ": "#60a5fa",
    "ARIZA KAYDEDILDI": "#ff4455",
    "BAKIM TAMAMLANDI": "#00ff88",
    "DONANIM EKLENDİ": "#fbbf24",
  };
  return (
    <div>
      <PageHeader title="Audit Log" subtitle={`${logs.length} kayıt — silme işlemi yapılamaz`} />
      <div style={{ background: "#0d0f18", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "#0a0c12", display: "flex", gap: 16 }}>
          {["LOG ID", "EYLEM", "HEDEF", "DETAY", "TARİH"].map(h => (
            <div key={h} style={{ fontSize: 10, fontWeight: 700, color: "#444", letterSpacing: "0.1em", flex: h === "DETAY" ? 3 : 1 }}>{h}</div>
          ))}
        </div>
        {logs.map((log, i) => (
          <div key={log.id} style={{ display: "flex", gap: 16, padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
            <div style={{ flex: 1, fontSize: 11, color: "#333", fontFamily: "monospace" }}>{log.id}</div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: colors[log.action] || "#888", background: `${colors[log.action]}18` || "rgba(136,136,136,0.1)", padding: "2px 8px", borderRadius: 4, letterSpacing: "0.04em" }}>{log.action}</span>
            </div>
            <div style={{ flex: 1, fontSize: 11, color: "#555", fontFamily: "monospace" }}>{log.target}</div>
            <div style={{ flex: 3, fontSize: 12, color: "#888" }}>{log.detail}</div>
            <div style={{ flex: 1, fontSize: 11, color: "#444", fontFamily: "monospace", whiteSpace: "nowrap" }}>{log.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
