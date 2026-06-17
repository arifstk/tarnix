// components/admin/UsersSection.tsx
// CHANGELOG: Full real-data users section — fetch from MongoDB,
//            change role, delete user, edit modal, search, stats

"use client";
import { useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────
type Role = "user" | "admin" | "deliveryBoy";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  image: string | null;
  role: Role;
  orderCount: number;
  joined: string;
  avatar: string;
}

// ─── Style maps ───────────────────────────────────────────────
const roleColors: Record<Role, string> = {
  admin: "bg-violet-500/15 text-violet-300 border border-violet-500/25",
  deliveryBoy: "bg-amber-500/15  text-amber-300  border border-amber-500/25",
  user: "bg-sky-500/15    text-sky-300    border border-sky-500/25",
};

const avatarGradients = [
  "from-indigo-500 to-violet-600",
  "from-sky-500    to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500  to-orange-600",
  "from-rose-500   to-pink-600",
  "from-purple-500 to-fuchsia-600",
];

function avatarColor(name: string) {
  return avatarGradients[name.charCodeAt(0) % avatarGradients.length];
}

// ─── Reusable UI ──────────────────────────────────────────────
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`rounded-2xl ${className}`}
    style={{
      background: "linear-gradient(145deg,#141b2d,#0f1420)",
      border: "1px solid rgba(255,255,255,0.06)",
    }}
  >
    {children}
  </div>
);

const Btn = ({
  children, variant = "primary", size = "sm", onClick, disabled, className = "",
}: {
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "xs";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) => {
  const v = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30",
    ghost: "bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08]",
    danger: "bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/25",
  }[variant];
  const s = size === "xs" ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${v} ${s} rounded-xl font-semibold transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
};

const Modal = ({
  title, onClose, children,
}: {
  title: string; onClose: () => void; children: React.ReactNode;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
    <div
      className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
      style={{ background: "#141b2d", border: "1px solid rgba(255,255,255,0.1)" }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-white">{title}</h3>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg bg-white/[0.07] hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
        >
          ✕
        </button>
      </div>
      {children}
    </div>
  </div>
);

// ─── Skeleton row ─────────────────────────────────────────────
const SkeletonRow = () => (
  <tr
    className="border-b animate-pulse"
    style={{ borderColor: "rgba(255,255,255,0.03)" }}
  >
    {Array.from({ length: 6 }).map((_, i) => (
      <td key={i} className="px-5 py-4">
        <div className="h-3 bg-white/[0.05] rounded-full w-full" />
      </td>
    ))}
  </tr>
);

// ═══════════════════════════════════════════════════════════════
export default function UsersSection() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [editModal, setEditModal] = useState<AdminUser | null>(null);
  const [editRole, setEditRole] = useState<Role>("user");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // ── Fetch ──
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // ── Change role inline ──
  const handleRoleChange = async (userId: string, role: Role) => {
    setUpdatingId(userId);
    // Optimistic update
    setUsers((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, role } : u))
    );
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      const data = await res.json();
      if (!data.success) {
        // Revert on failure
        await fetchUsers();
      }
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Delete user ──
  const handleDelete = async (userId: string) => {
    const ok = window.confirm("Are you sure you want to delete this user? This cannot be undone.");
    if (!ok) return;

    setDeletingId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
      }
    } finally {
      setDeletingId(null);
    }
  };

  // ── Save from modal ──
  const handleSaveEdit = async () => {
    if (!editModal) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: editModal._id, role: editRole }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === editModal._id ? { ...u, role: editRole } : u))
        );
        setEditModal(null);
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Filter ──
  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  // ── Stats ──
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const deliveryBoyCount = users.filter((u) => u.role === "deliveryBoy").length;
  const userCount = users.filter((u) => u.role === "user").length;

  return (
    <div className="max-w-6xl space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Manage Users</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {loading ? "Loading…" : `${totalUsers} registered accounts`}
          </p>
        </div>
        <Btn variant="ghost" size="sm" onClick={fetchUsers}>
          ↻ Refresh
        </Btn>
      </div>

      {/* ── Stat chips ── */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "All Users", count: totalUsers, color: "bg-white/[0.04]  text-slate-300  border-white/[0.08]", key: "all" },
          { label: "Customers", count: userCount, color: "bg-sky-500/10    text-sky-300    border-sky-500/20", key: "user" },
          { label: "Admins", count: adminCount, color: "bg-violet-500/10 text-violet-300 border-violet-500/20", key: "admin" },
          { label: "Delivery Boys", count: deliveryBoyCount, color: "bg-amber-500/10  text-amber-300  border-amber-500/20", key: "deliveryBoy" },
        ].map((chip) => (
          <button
            key={chip.key}
            onClick={() => setRoleFilter(chip.key as Role | "all")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold transition-all ${chip.color} ${roleFilter === chip.key ? "ring-2 ring-white/20" : "opacity-70 hover:opacity-100"
              }`}
          >
            {chip.label}
            <span className="font-black">{loading ? "…" : chip.count}</span>
          </button>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-60">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">
            🔍
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
        {search && (
          <button
            onClick={() => setSearch("")}
            className="px-3 py-2 rounded-xl bg-white/[0.05] text-slate-400 hover:text-white text-sm border border-white/[0.07] transition-all"
          >
            Clear ✕
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-xs text-slate-500 uppercase tracking-wider border-b"
                style={{
                  borderColor: "rgba(255,255,255,0.05)",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                {["User", "Email", "Role", "Orders", "Joined", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left font-semibold whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-slate-500 text-sm">
                    <div className="text-4xl mb-3">👥</div>
                    {search ? "No users match your search" : "No users found"}
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr
                    key={u._id}
                    className="border-b hover:bg-white/[0.02] transition-colors"
                    style={{ borderColor: "rgba(255,255,255,0.03)" }}
                  >
                    {/* User */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {u.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={u.image}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div
                            className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColor(u.name)} flex items-center justify-center text-xs font-black text-white shrink-0`}
                          >
                            {u.avatar}
                          </div>
                        )}
                        <span className="font-semibold text-white text-sm">{u.name}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-3.5 text-slate-400 text-xs">{u.email}</td>

                    {/* Role — inline dropdown */}
                    <td className="px-5 py-3.5">
                      <select
                        value={u.role}
                        disabled={updatingId === u._id}
                        onChange={(e) => handleRoleChange(u._id, e.target.value as Role)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer transition-all bg-transparent disabled:opacity-50 ${roleColors[u.role]}`}
                      >
                        <option value="user" className="bg-slate-800 text-white">user</option>
                        <option value="admin" className="bg-slate-800 text-white">admin</option>
                        <option value="deliveryBoy" className="bg-slate-800 text-white">deliveryBoy</option>
                      </select>
                    </td>

                    {/* Orders */}
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-black text-white">{u.orderCount}</span>
                      <span className="text-xs text-slate-500 ml-1">orders</span>
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                      {u.joined}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => { setEditModal(u); setEditRole(u.role); }}
                          className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08] transition-all active:scale-95"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(u._id)}
                          disabled={deletingId === u._id}
                          className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/25 transition-all active:scale-95 disabled:opacity-40"
                        >
                          {deletingId === u._id ? "…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        {!loading && filtered.length > 0 && (
          <div
            className="px-5 py-3 border-t flex items-center justify-between"
            style={{ borderColor: "rgba(255,255,255,0.05)" }}
          >
            <p className="text-xs text-slate-500">
              Showing {filtered.length} of {totalUsers} users
            </p>
            {roleFilter !== "all" && (
              <button
                onClick={() => setRoleFilter("all")}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Show all
              </button>
            )}
          </div>
        )}
      </Card>

      {/* ── Edit Modal ── */}
      {editModal && (
        <Modal
          title={`Edit User — ${editModal.name}`}
          onClose={() => setEditModal(null)}
        >
          <div className="space-y-5">

            {/* User info (read-only) */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/40">
              {editModal.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={editModal.image}
                  alt={editModal.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColor(editModal.name)} flex items-center justify-center text-sm font-black text-white`}
                >
                  {editModal.avatar}
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-white">{editModal.name}</p>
                <p className="text-xs text-slate-400">{editModal.email}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Joined {editModal.joined} · {editModal.orderCount} orders
                </p>
              </div>
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">
                Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["user", "admin", "deliveryBoy"] as Role[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setEditRole(r)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${editRole === r
                        ? roleColors[r] + " ring-2 ring-white/20"
                        : "bg-white/[0.03] text-slate-500 border-white/[0.07] hover:border-white/20"
                      }`}
                  >
                    {r === "deliveryBoy" ? "Delivery Boy" : r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all active:scale-95 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button
                onClick={() => setEditModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08] text-sm font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}

