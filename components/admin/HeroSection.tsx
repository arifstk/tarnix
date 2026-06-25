// components/admin/HeroSection.tsx

"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────
interface HeroBanner {
  _id: string;
  title: string;
  description: string;
  image: string;
  cloudinaryId?: string;
  buttonText: string;
  buttonLink: string;
  order: number;
  active: boolean;
  createdAt: string;
}

type FormState = {
  title: string;
  description: string;
  image: string;
  cloudinaryId: string;
  buttonText: string;
  buttonLink: string;
  order: number;
  active: boolean;
};

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  image: "",
  cloudinaryId: "",
  buttonText: "Shop Now",
  buttonLink: "/products",
  order: 0,
  active: true,
};

// ─── Reusable UI ──────────────────────────────────────────────
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`rounded-2xl ${className}`}
    style={{ background: "linear-gradient(145deg,#141b2d,#0f1420)", border: "1px solid rgba(255,255,255,0.06)" }}
  >
    {children}
  </div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-semibold text-slate-400 mb-1.5">{children}</label>
);

const TextInput = ({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all"
  />
);

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-white/4 rounded-xl ${className}`} />
);

// ─── Modal ────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }: {
  title: string; onClose: () => void; children: React.ReactNode;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
    <div
      className="w-full max-w-lg rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
      style={{ background: "#141b2d", border: "1px solid rgba(255,255,255,0.1)" }}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10"
        style={{ background: "#141b2d", borderColor: "rgba(255,255,255,0.08)" }}>
        <h3 className="text-base font-bold text-white">{title}</h3>
        <button onClick={onClose}
          className="w-7 h-7 rounded-lg bg-white/[0.07] hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
          ✕
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
export default function HeroSection() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<HeroBanner | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Fetch ──
  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/hero");
      const data = await res.json();
      if (data.success) setBanners(data.banners);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  // ── Open add modal ──
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setPreview("");
    setEditTarget(null);
    setModal("add");
  };

  // ── Open edit modal ──
  const openEdit = (banner: HeroBanner) => {
    setEditTarget(banner);
    setForm({
      title: banner.title,
      description: banner.description,
      image: banner.image,
      cloudinaryId: banner.cloudinaryId || "",
      buttonText: banner.buttonText,
      buttonLink: banner.buttonLink,
      order: banner.order,
      active: banner.active,
    });
    setPreview(banner.image);
    setModal("edit");
  };

  // ── Upload image ──
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/admin/hero/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (data.success) {
        setForm((p) => ({ ...p, image: data.url, cloudinaryId: data.cloudinaryId }));
        setPreview(data.url);
      } else {
        alert("Image upload failed: " + data.error);
      }
    } finally {
      setUploading(false);
    }
  };

  // ── Save (create or update) ──
  const handleSave = async () => {
    if (!form.title.trim()) { alert("Title is required."); return; }
    if (!form.image.trim()) { alert("Image is required."); return; }
    if (!form.buttonText.trim()) { alert("Button text is required."); return; }

    setSaving(true);
    try {
      const isEdit = modal === "edit" && editTarget;
      const res = await fetch("/api/admin/hero", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { id: editTarget._id, ...form } : form),
      });
      const data = await res.json();

      if (data.success) {
        await fetchBanners();
        setModal(null);
      } else {
        alert(data.error || "Failed to save.");
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──
  const handleDelete = async (id: string) => {
    const ok = window.confirm("Delete this banner? This cannot be undone.");
    if (!ok) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/admin/hero", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) setBanners((p) => p.filter((b) => b._id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  // ── Toggle active ──
  const handleToggle = async (banner: HeroBanner) => {
    setTogglingId(banner._id);
    try {
      const res = await fetch("/api/admin/hero", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: banner._id, active: !banner.active }),
      });
      const data = await res.json();
      if (data.success) {
        setBanners((p) =>
          p.map((b) => b._id === banner._id ? { ...b, active: !b.active } : b)
        );
      }
    } finally {
      setTogglingId(null);
    }
  };

  // ── Reorder ──
  const handleReorder = async (id: string, direction: "up" | "down") => {
    const idx = banners.findIndex((b) => b._id === id);
    const swap = direction === "up" ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= banners.length) return;

    const updated = [...banners];
    [updated[idx], updated[swap]] = [updated[swap], updated[idx]];

    // Update order numbers
    const reordered = updated.map((b, i) => ({ ...b, order: i }));
    setBanners(reordered);

    // Save new order to DB
    await Promise.all(
      reordered.map((b) =>
        fetch("/api/admin/hero", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: b._id, order: b.order }),
        })
      )
    );
  };

  const f = (key: keyof FormState, val: any) =>
    setForm((p) => ({ ...p, [key]: val }));

  return (
    <div className="max-w-5xl space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Hero Banners</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {loading ? "Loading…" : `${banners.length} banner${banners.length !== 1 ? "s" : ""} · ${banners.filter(b => b.active).length} active`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchBanners}
            className="px-3 py-2 rounded-xl bg-white/4 hover:bg-white/8 text-slate-400 hover:text-white text-xs border border-white/6 transition-all">
            ↻ Refresh
          </button>
          <button onClick={openAdd}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all active:scale-95 shadow-lg shadow-indigo-900/30">
            + Add Banner
          </button>
        </div>
      </div>

      {/* ── Banner list ── */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-36 w-full" />)}
        </div>
      ) : banners.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-5xl mb-3">🖼</div>
          <p className="text-slate-400 text-sm font-semibold mb-1">No banners yet</p>
          <p className="text-slate-600 text-xs mb-5">Add your first hero banner to get started</p>
          <button onClick={openAdd}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all">
            + Add First Banner
          </button>
        </Card>
      ) : (
        <div className="space-y-4">
          {banners.map((banner, idx) => (
            <Card key={banner._id} className="overflow-hidden p-0">
              <div className="flex flex-col sm:flex-row gap-0">

                {/* Thumbnail */}
                <div className="relative w-full sm:w-52 h-36 shrink-0 overflow-hidden">
                  {banner.image ? (
                    <Image
                      src={banner.image}
                      alt={banner.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-4xl">
                      🖼
                    </div>
                  )}
                  {/* Order badge */}
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-xs font-black text-white">
                    {idx + 1}
                  </div>
                  {/* Active/Inactive overlay */}
                  {!banner.active && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-xs font-bold text-slate-400 bg-slate-800/80 px-2 py-1 rounded-full">
                        Hidden
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="text-sm font-bold text-white line-clamp-1">{banner.title}</h3>
                      {/* Active toggle */}
                      <button
                        onClick={() => handleToggle(banner)}
                        disabled={togglingId === banner._id}
                        className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${banner.active
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                          : "bg-slate-500/15 text-slate-400 border-slate-500/25"
                          } disabled:opacity-50`}
                      >
                        {togglingId === banner._id ? "…" : banner.active ? "Active" : "Hidden"}
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-2">
                      {banner.description}
                    </p>
                    {/* Button info */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 px-2 py-0.5 rounded-full font-semibold">
                        {banner.buttonText}
                      </span>
                      <span className="text-xs text-slate-500 font-mono truncate max-w-40">
                        → {banner.buttonLink}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {/* Reorder */}
                    <button
                      onClick={() => handleReorder(banner._id, "up")}
                      disabled={idx === 0}
                      className="w-7 h-7 rounded-lg bg-white/4 hover:bg-white/8 text-slate-400 hover:text-white text-xs border border-white/6 transition-all disabled:opacity-30 flex items-center justify-center"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleReorder(banner._id, "down")}
                      disabled={idx === banners.length - 1}
                      className="w-7 h-7 rounded-lg bg-white/4 hover:bg-white/8 text-slate-400 hover:text-white text-xs border border-white/6 transition-all disabled:opacity-30 flex items-center justify-center"
                    >
                      ↓
                    </button>

                    <button
                      onClick={() => openEdit(banner)}
                      className="px-3 py-1.5 rounded-xl bg-white/6 hover:bg-white/10 text-slate-300 border border-white/8 text-xs font-semibold transition-all active:scale-95"
                    >
                      ✏ Edit
                    </button>

                    <button
                      onClick={() => handleDelete(banner._id)}
                      disabled={deletingId === banner._id}
                      className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/25 text-xs font-semibold transition-all active:scale-95 disabled:opacity-40"
                    >
                      {deletingId === banner._id ? "…" : "🗑 Delete"}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ════ ADD / EDIT MODAL ════ */}
      {modal && (
        <Modal
          title={modal === "add" ? "Add New Banner" : "Edit Banner"}
          onClose={() => setModal(null)}
        >
          <div className="space-y-4">

            {/* Image upload */}
            <div>
              <Label>Banner Image</Label>

              {/* Preview */}
              {preview && (
                <div className="relative w-full h-40 rounded-xl overflow-hidden mb-3">
                  <Image src={preview} alt="preview" fill className="object-cover" />
                  {uploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <svg className="animate-spin w-6 h-6 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    </div>
                  )}
                </div>
              )}

              {/* Upload button */}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full py-3 rounded-xl border-2 border-dashed border-slate-700 hover:border-indigo-500/50 text-slate-400 hover:text-slate-300 text-xs font-semibold transition-all hover:bg-indigo-500/4 disabled:opacity-50"
              >
                {uploading ? "Uploading…" : preview ? "📁 Change Image" : "📁 Upload Image"}
              </button>

              {/* OR paste URL */}
              <div className="flex items-center gap-2 my-2">
                <div className="flex-1 h-px bg-slate-700/50" />
                <span className="text-xs text-slate-600">or paste URL</span>
                <div className="flex-1 h-px bg-slate-700/50" />
              </div>
              <TextInput
                value={form.image}
                onChange={(v) => { f("image", v); setPreview(v); }}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Title */}
            <div>
              <Label>Title <span className="text-rose-400">*</span></Label>
              <TextInput
                value={form.title}
                onChange={(v) => f("title", v)}
                placeholder="Fresh Groceries Delivered Fast"
              />
            </div>

            {/* Description */}
            <div>
              <Label>Description</Label>
              <textarea
                value={form.description}
                onChange={(e) => f("description", e.target.value)}
                placeholder="Get farm-fresh vegetables delivered to your doorstep…"
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all resize-none"
              />
            </div>

            {/* Button text + link */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Button Text <span className="text-rose-400">*</span></Label>
                <TextInput
                  value={form.buttonText}
                  onChange={(v) => f("buttonText", v)}
                  placeholder="Shop Now"
                />
              </div>
              <div>
                <Label>Button Link <span className="text-rose-400">*</span></Label>
                <TextInput
                  value={form.buttonLink}
                  onChange={(v) => f("buttonLink", v)}
                  placeholder="/products"
                />
              </div>
            </div>

            {/* Order + Active */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Display Order</Label>
                <TextInput
                  type="number"
                  value={String(form.order)}
                  onChange={(v) => f("order", parseInt(v) || 0)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Status</Label>
                <button
                  onClick={() => f("active", !form.active)}
                  className={`w-full py-2.5 rounded-xl border text-sm font-bold transition-all ${form.active
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                    : "bg-slate-500/15 text-slate-400 border-slate-500/25"
                    }`}
                >
                  {form.active ? "✓ Active" : "Hidden"}
                </button>
              </div>
            </div>

            {/* Save + Cancel */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving || uploading}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving…" : modal === "add" ? "Add Banner" : "Save Changes"}
              </button>
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/6 hover:bg-white/10 text-slate-300 border border-white/8 text-sm font-semibold transition-all"
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

