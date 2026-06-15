// components/admin/AdminDashboard.tsx

"use client";
import { useState, useRef, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Cell,
} from "recharts";
import ProductsSection from "./ProductsSection";
import CategoriesSection from "./CategoriesSection";
import OrdersSection from "./OrdersSection";

// ─── Types ────────────────────────────────────────────────────
type Role = "user" | "admin" | "deliveryBoy";
type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
type Section = "overview" | "users" | "products" | "categories" | "orders" | "settings";

interface User { id: string; name: string; email: string; role: Role; joined: string; avatar: string; orders: number; }
interface Product { id: string; name: string; category: string; price: number; stock: number; image: string; status: "active" | "draft"; }
interface Category { id: string; name: string; slug: string; count: number; }
interface Order { id: string; customer: string; items: number; total: string; status: OrderStatus; date: string; }

// ─── Mock Data ────────────────────────────────────────────────
const MOCK_USERS: User[] = [
  { id: "U001", name: "Rafi Hossain", email: "rafi@email.com", role: "user", joined: "Jan 2024", avatar: "RH", orders: 12 },
];

const MOCK_PRODUCTS: Product[] = [
  { id: "P001", name: "Wireless Earbuds Pro", category: "Electronics", price: 49.99, stock: 120, image: "🎧", status: "active" },
];

const MOCK_CATEGORIES: Category[] = [
  { id: "C001", name: "Electronics", slug: "electronics", count: 24 },
];

const MOCK_ORDERS: Order[] = [
  { id: "ORD-1041", customer: "Rafi Hossain", items: 2, total: "$63.99", status: "delivered", date: "May 18" },
];

const REVENUE_DATA = [
  { month: "Dec", revenue: 3200 }, { month: "Jan", revenue: 4800 },
  { month: "Feb", revenue: 4100 }, { month: "Mar", revenue: 5900 },
  { month: "Apr", revenue: 5200 }, { month: "May", revenue: 7400 },
];
const ORDERS_DATA = [
  { day: "Mon", orders: 18 }, { day: "Tue", orders: 24 },
  { day: "Wed", orders: 15 }, { day: "Thu", orders: 32 },
  { day: "Fri", orders: 28 }, { day: "Sat", orders: 41 },
  { day: "Sun", orders: 12 },
];

// ─── Colour helpers ───────────────────────────────────────────
const roleColors: Record<Role, string> = {
  admin: "bg-violet-500/15 text-violet-300 border border-violet-500/25",
  deliveryBoy: "bg-amber-500/15  text-amber-300  border border-amber-500/25",
  user: "bg-sky-500/15    text-sky-300    border border-sky-500/25",
};
const orderColors: Record<OrderStatus, string> = {
  delivered: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25",
  shipped: "bg-sky-500/15     text-sky-300     border border-sky-500/25",
  processing: "bg-amber-500/15   text-amber-300   border border-amber-500/25",
  pending: "bg-slate-500/15   text-slate-300   border border-slate-500/25",
  cancelled: "bg-rose-500/15    text-rose-300    border border-rose-500/25",
};

// ─── Reusable UI pieces ───────────────────────────────────────
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl p-5 ${className}`}
    style={{ background: "linear-gradient(145deg,#141b2d,#0f1420)", border: "1px solid rgba(255,255,255,0.06)" }}>
    {children}
  </div>
);

const Input = ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    <label className="block text-xs font-semibold text-slate-400 mb-1.5">{label}</label>
    <input {...props}
      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/50 transition-all duration-200" />
  </div>
);

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button onClick={onChange}
    className={`relative inline-flex w-11 h-6 rounded-full transition-all duration-300 focus:outline-none ${checked ? "bg-indigo-600" : "bg-slate-700"}`}>
    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${checked ? "translate-x-5" : "translate-x-0"}`} />
  </button>
);

const Btn = ({ children, variant = "primary", size = "sm", onClick, className = "" }:
  { children: React.ReactNode; variant?: "primary" | "ghost" | "danger" | "success"; size?: "sm" | "xs"; onClick?: () => void; className?: string }) => {
  const v = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30",
    ghost: "bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08]",
    danger: "bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/25",
    success: "bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/25",
  }[variant];
  const s = size === "xs" ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm";
  return <button onClick={onClick} className={`${v} ${s} rounded-xl font-semibold transition-all duration-200 active:scale-95 ${className}`}>{children}</button>;
};

// ─── Modal wrapper ────────────────────────────────────────────
const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div className="fixed inset-0 z-100 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
    <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
      style={{ background: "#141b2d", border: "1px solid rgba(255,255,255,0.1)" }}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-white">{title}</h3>
        <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/[0.07] hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">✕</button>
      </div>
      {children}
    </div>
  </div>
);

// ─── Sidebar nav items ────────────────────────────────────────
const NAV = [
  { id: "overview", label: "Overview", icon: "▦" },
  { id: "users", label: "Users", icon: "👥" },
  { id: "categories", label: "Categories", icon: "🏷" },
  { id: "products", label: "Products", icon: "📦" },
  { id: "orders", label: "Orders", icon: "📋" },
  { id: "settings", label: "Settings", icon: "⚙" },
] as const;

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const [section, setSection] = useState<Section>("overview");
  const [sideOpen, setSideOpen] = useState(true);

  // Users state
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [userModal, setUserModal] = useState<User | null>(null);
  const [userSearch, setUserSearch] = useState("");

  // Products state
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [prodModal, setProdModal] = useState<Product | null | "new">(null);
  const [prodSearch, setProdSearch] = useState("");

  // Categories state
  const [categories, setCats] = useState<Category[]>(MOCK_CATEGORIES);
  const [catModal, setCatModal] = useState<Category | null | "new">(null);

  // Orders state
  const [orders] = useState<Order[]>(MOCK_ORDERS);
  const [orderSearch, setOrderSearch] = useState("");

  // Settings state
  const [settings, setSettings] = useState({
    deliveryCharge: "0",
    maintenanceMode: false,
    storeAddress: "",
    storePhone: "",
    storeEmail: "",
    facebook: "",
    instagram: "",
    twitter: "",
    youtube: "",
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  useEffect(() => {
    if (section !== "settings") return;
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setSettings({
            deliveryCharge: String(data.settings.deliveryCharge ?? 0),
            maintenanceMode: data.settings.maintenanceMode ?? false,
            storeAddress: data.settings.storeAddress ?? "",
            storePhone: data.settings.storePhone ?? "",
            storeEmail: data.settings.storeEmail ?? "",
            facebook: data.settings.facebook ?? "",
            instagram: data.settings.instagram ?? "",
            twitter: data.settings.twitter ?? "",
            youtube: data.settings.youtube ?? "",
          });
        }
      });
  }, [section]);

  const handleSaveSettings = async () => {
    setSettingsLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settings,
          deliveryCharge: parseFloat(settings.deliveryCharge) || 0,
        }),
      });
      const data = await res.json();
      if (data.success) alert("Settings saved!");
      else alert("Failed to save settings.");
    } finally {
      setSettingsLoading(false);
    }
  };

  // ── Filtered data ──
  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()));
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(prodSearch.toLowerCase()));
  const filteredOrders = orders.filter(o => o.id.toLowerCase().includes(orderSearch.toLowerCase()) || o.customer.toLowerCase().includes(orderSearch.toLowerCase()));

  // ── User actions ──
  const deleteUser = (id: string) => setUsers(u => u.filter(x => x.id !== id));
  const changeRole = (id: string, role: Role) => setUsers(u => u.map(x => x.id === id ? { ...x, role } : x));

  // ── Product actions ──
  const deleteProduct = (id: string) => setProducts(p => p.filter(x => x.id !== id));

  // ── Category actions ──
  const deleteCat = (id: string) => setCats(c => c.filter(x => x.id !== id));

  const OVERVIEW_STATS = [
    { label: "Total Revenue", value: "$30,600", sub: "+18% this month", accent: "from-indigo-500 to-violet-600", glow: "shadow-indigo-500/20", icon: "💰" },
    { label: "Total Orders", value: "348", sub: "+24 this week", accent: "from-sky-500 to-cyan-500", glow: "shadow-sky-500/20", icon: "📦" },
    { label: "Total Users", value: "1,240", sub: "+56 this month", accent: "from-emerald-500 to-teal-500", glow: "shadow-emerald-500/20", icon: "👥" },
    { label: "Products", value: "94", sub: "6 low stock", accent: "from-amber-500 to-orange-500", glow: "shadow-amber-500/20", icon: "🛒" },
  ];

  return (
    <div className="flex min-h-screen text-white" style={{ fontFamily: "'Plus Jakarta Sans','DM Sans',sans-serif", background: "#0b0f19" }}>

      {/* ════ SIDEBAR ════ */}
      <aside className={`shrink-0 flex flex-col transition-all duration-300 ease-in-out ${sideOpen ? "w-56" : "w-16"}`}
        style={{ background: "linear-gradient(180deg,#111827 0%,#0d1421 100%)", borderRight: "1px solid rgba(255,255,255,0.05)" }}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <div className="w-8 h-8 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-sm shrink-0 shadow-lg shadow-indigo-900/40">T</div>
          {sideOpen && <span className="font-black text-lg tracking-tight bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent whitespace-nowrap">Tarnix</span>}
        </div>

        {/* Collapse toggle */}
        <div className="p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <button onClick={() => setSideOpen(v => !v)}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-600 rounded-xl text-slate-500 hover:text-white hover:bg-white/20 transition-all duration-200 text-xs font-medium cursor-pointer">
            <span className={`transition-transform duration-300 ${sideOpen ? "" : "rotate-180"}`}>◀</span>
            {sideOpen && <span>Collapse</span>}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-0.5">
          {NAV.map(item => {
            const active = section === item.id;
            return (
              <button key={item.id} onClick={() => setSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group  cursor-pointer ${active ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/20" : "text-slate-500 hover:text-slate-200 hover:bg-white/50"}`}>
                <span className="text-base shrink-0">{item.icon}</span>
                {sideOpen && <span className="whitespace-nowrap">{item.label}</span>}
                {sideOpen && active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ════ MAIN CONTENT ════ */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-6 shrink-0" style={{ background: "rgba(11,15,25,0.8)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div>
            <h1 className="text-base font-bold text-white capitalize">{section}</h1>
            <p className="text-xs text-slate-500">Admin Panel · Tarnix</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold">A</div>
            <span className="text-sm text-slate-300 font-medium hidden sm:block">Admin</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">

          {/* ══ OVERVIEW ══════════════════════════════════════ */}
          {section === "overview" && (
            <div className="space-y-6 max-w-6xl">
              {/* Stats */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {OVERVIEW_STATS.map((s, i) => (
                  <Card key={s.label} className={`shadow-xl ${s.glow} relative overflow-hidden group`}>
                    <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${s.accent} flex items-center justify-center text-lg mb-4 shadow-lg`}>{s.icon}</div>
                    <p className="text-2xl font-black text-white tracking-tight">{s.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">{s.label}</p>
                    <p className="text-xs text-emerald-400 font-semibold mt-2">↑ {s.sub}</p>
                    <div className={`absolute -bottom-5 -right-5 w-24 h-24 rounded-full bg-linear-to-br ${s.accent} opacity-8 blur-xl group-hover:opacity-15 transition-opacity duration-300`} />
                  </Card>
                ))}
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <h2 className="text-sm font-bold text-white mb-1">Revenue (6 months)</h2>
                  <p className="text-xs text-slate-500 mb-4">Monthly earnings trend</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={REVENUE_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "12px", fontSize: "12px" }} />
                      <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: "#6366f1", r: 4 }} activeDot={{ r: 6, fill: "#818cf8" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
                <Card>
                  <h2 className="text-sm font-bold text-white mb-1">Orders This Week</h2>
                  <p className="text-xs text-slate-500 mb-4">Daily order volume</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={ORDERS_DATA} barSize={24} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "12px", fontSize: "12px" }} />
                      <Bar dataKey="orders" radius={[6, 6, 0, 0]}>
                        {ORDERS_DATA.map((_, i) => <Cell key={i} fill={i === 5 ? "#6366f1" : "rgba(99,102,241,0.35)"} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              {/* Recent orders quick view */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-white">Recent Orders</h2>
                  <Btn variant="ghost" size="xs" onClick={() => setSection("orders")}>View all →</Btn>
                </div>
                <div className="space-y-2">
                  {MOCK_ORDERS.slice(0, 4).map(o => (
                    <div key={o.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center text-xs font-bold text-indigo-400">📋</div>
                        <div>
                          <p className="text-sm font-medium text-white">{o.id}</p>
                          <p className="text-xs text-slate-500">{o.customer} · {o.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-white">{o.total}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${orderColors[o.status]}`}>{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ══ USERS ═════════════════════════════════════════ */}
          {section === "users" && (
            <div className="max-w-6xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white">Manage Users</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{users.length} registered accounts</p>
                </div>
                <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search by name or email…"
                  className="px-3.5 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-64" />
              </div>
              <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-xs text-slate-500 uppercase tracking-wider border-b" style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
                      {["User", "Email", "Role", "Joined", "Orders", "Actions"].map(h => <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u.id} className="border-b hover:bg-white/20 transition-colors group" style={{ borderColor: "rgba(255,255,255,0.03)" }}>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold shrink-0">{u.avatar}</div>
                              <span className="font-medium text-white">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-400 text-xs">{u.email}</td>
                          <td className="px-5 py-3.5">
                            <select value={u.role} onChange={e => changeRole(u.id, e.target.value as Role)}
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer ${roleColors[u.role]} bg-transparent`}>
                              <option value="user">user</option>
                              <option value="admin">admin</option>
                              <option value="deliveryBoy">deliveryBoy</option>
                            </select>
                          </td>
                          <td className="px-5 py-3.5 text-slate-400 text-xs">{u.joined}</td>
                          <td className="px-5 py-3.5 text-white font-bold">{u.orders}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex gap-1.5">
                              <Btn variant="ghost" size="xs" onClick={() => setUserModal(u)}>Edit</Btn>
                              <Btn variant="danger" size="xs" onClick={() => deleteUser(u.id)}>Delete</Btn>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ══ PRODUCTS ══════════════════════════════════════ */}
          {section === "products" && <ProductsSection />}

          {/* ══ CATEGORIES ════════════════════════════════════ */}
          {section === "categories" && <CategoriesSection />}

          {/* ══ ORDERS ════════════════════════════════════════ */}

          {section === "orders" && (<OrdersSection />)}

          {/* ══ SETTINGS ══════════════════════════════════════ */}
          {section === "settings" && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">Store Settings</h2>
                <p className="text-xs text-slate-500 mt-0.5">Configure your store preferences</p>
              </div>

              {/* Delivery & Maintenance */}
              <Card>
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><span>🚚</span> Delivery & Operations</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <Input label="Delivery Charge ($)" type="number" value={settings.deliveryCharge}
                    onChange={e => setSettings(s => ({ ...s, deliveryCharge: e.target.value }))} placeholder="5.00" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/40">
                  <div>
                    <p className="text-sm font-semibold text-white">Maintenance Mode</p>
                    <p className="text-xs text-slate-500 mt-0.5">Temporarily disable the storefront for visitors</p>
                  </div>
                  <Toggle checked={settings.maintenanceMode} onChange={() => setSettings(s => ({ ...s, maintenanceMode: !s.maintenanceMode }))} />
                </div>
                {settings.maintenanceMode && (
                  <div className="mt-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 font-semibold flex items-center gap-2">
                    ⚠ Store is currently in maintenance mode — customers cannot access the site.
                  </div>
                )}
              </Card>

              {/* Store Info */}
              <Card>
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><span>🏪</span> Store Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Input label="Store Address" value={settings.storeAddress}
                      onChange={e => setSettings(s => ({ ...s, storeAddress: e.target.value }))} placeholder="123 Main St, City" />
                  </div>
                  <Input label="Phone Number" type="tel" value={settings.storePhone}
                    onChange={e => setSettings(s => ({ ...s, storePhone: e.target.value }))} />
                  <Input label="Support Email" type="email" value={settings.storeEmail}
                    onChange={e => setSettings(s => ({ ...s, storeEmail: e.target.value }))} />
                </div>
              </Card>

              {/* Social Links */}
              <Card>
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><span>🔗</span> Social Media Links</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {([
                    { key: "facebook", label: "Facebook URL", icon: "📘" },
                    { key: "instagram", label: "Instagram URL", icon: "📸" },
                    { key: "twitter", label: "Twitter / X URL", icon: "🐦" },
                    { key: "youtube", label: "YouTube URL", icon: "▶" },
                  ] as const).map(f => (
                    <div key={f.key} className="relative">
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">{f.icon} {f.label}</label>
                      <input type="url" value={(settings as any)[f.key]}
                        onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))}
                        placeholder="https://"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all duration-200" />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Save */}
              <div className="flex justify-end">
                <Btn variant="primary" size="sm" onClick={handleSaveSettings}> {settingsLoading ? "Saving..." : "💾 Save All Settings"}
                </Btn>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ════ MODALS ════ */}

      {/* Edit User Modal */}
      {userModal && (
        <Modal title={`Edit User — ${userModal.name}`} onClose={() => setUserModal(null)}>
          <div className="space-y-4">
            <Input label="Full Name" defaultValue={userModal.name} />
            <Input label="Email" type="email" defaultValue={userModal.email} />
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Role</label>
              <select defaultValue={userModal.role}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60">
                <option value="user">user</option>
                <option value="admin">admin</option>
                <option value="deliveryBoy">deliveryBoy</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <Btn variant="primary" className="flex-1" onClick={() => setUserModal(null)}>Save Changes</Btn>
              <Btn variant="ghost" className="flex-1" onClick={() => setUserModal(null)}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Product Modal (Add / Edit) */}
      {prodModal && (
        <Modal title={prodModal === "new" ? "Add New Product" : `Edit — ${(prodModal as Product).name}`} onClose={() => setProdModal(null)}>
          <div className="space-y-3">
            <Input label="Product Name" defaultValue={prodModal !== "new" ? (prodModal as Product).name : ""} placeholder="e.g. Wireless Earbuds" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Price ($)" type="number" defaultValue={prodModal !== "new" ? String((prodModal as Product).price) : ""} placeholder="0.00" />
              <Input label="Stock" type="number" defaultValue={prodModal !== "new" ? String((prodModal as Product).stock) : ""} placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Category</label>
              <select className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60">
                {categories.map(c => <option key={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Status</label>
              <select className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60">
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Product Image</label>
              <div className="w-full px-4 py-6 rounded-xl border-2 border-dashed border-slate-700 hover:border-indigo-500/50 text-center text-slate-500 text-xs cursor-pointer transition-colors hover:bg-indigo-500/5">
                📁 Click to upload or drag & drop
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Btn variant="primary" className="flex-1" onClick={() => setProdModal(null)}>{prodModal === "new" ? "Add Product" : "Save Changes"}</Btn>
              <Btn variant="ghost" className="flex-1" onClick={() => setProdModal(null)}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Category Modal (Add / Edit) */}
      {catModal && (
        <Modal title={catModal === "new" ? "Add New Category" : `Edit — ${(catModal as Category).name}`} onClose={() => setCatModal(null)}>
          <div className="space-y-4">
            <Input label="Category Name" defaultValue={catModal !== "new" ? (catModal as Category).name : ""} placeholder="e.g. Electronics" />
            <Input label="Slug" defaultValue={catModal !== "new" ? (catModal as Category).slug : ""} placeholder="e.g. electronics" />
            <div className="flex gap-3 pt-2">
              <Btn variant="primary" className="flex-1" onClick={() => setCatModal(null)}>{catModal === "new" ? "Add Category" : "Save Changes"}</Btn>
              <Btn variant="ghost" className="flex-1" onClick={() => setCatModal(null)}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}