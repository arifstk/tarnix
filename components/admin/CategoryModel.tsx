// components/admin/CategoryModal.tsx
"use client";
import { useState } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { AppDispatch } from "@/store";
import { addCategory, updateCategory } from "@/store/slices/categorySlice";
import { ICategory } from "@/types";

interface Props {
  existing: ICategory | null;           // null = add mode
  onClose: () => void;
  onSuccess: (mode: "add" | "edit", name: string) => void;
}

export default function CategoryModal({ existing, onClose, onSuccess }: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const [name,   setName]   = useState(existing?.name ?? "");
  const [slug,   setSlug]   = useState(existing?.slug ?? "");
  const [saving, setSaving] = useState(false);   // local loading flag

  // Auto-generate slug from name
  const handleNameChange = (val: string) => {
    setName(val);
    if (!existing) {
      setSlug(val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
    }
  };

  const handleSubmit = () => {
    if (!name.trim() || !slug.trim()) {
      toast.error("Name and slug are required.");
      return;
    }

    const mode = existing ? "edit" : "add";
    setSaving(true);

    if (mode === "add") {
      toast.promise(
        dispatch(addCategory({ name: name.trim(), slug: slug.trim() })).unwrap(),
        {
          loading: "Adding category…",
          success: `"${name.trim()}" added! 🏷`,
          error:   (err) => `Failed to add: ${err}`,
        }
      )
        .then(() => onSuccess("add", name.trim()))
        .catch(() => {})
        .finally(() => setSaving(false));
    } else {
      toast.promise(
        dispatch(updateCategory({ id: existing!._id!, data: { name: name.trim(), slug: slug.trim() } })).unwrap(),
        {
          loading: "Saving changes…",
          success: `"${name.trim()}" updated ✅`,
          error:   (err) => `Failed to update: ${err}`,
        }
      )
        .then(() => onSuccess("edit", name.trim()))
        .catch(() => {})
        .finally(() => setSaving(false));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
        style={{ background: "#141b2d", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-white">
            {existing ? `Edit — ${existing.name}` : "Add New Category"}
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/[0.07] hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >✕</button>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Category Name *</label>
            <input
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="e.g. Electronics"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Slug *</label>
            <input
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder="e.g. electronics"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-sm placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all"
            />
            <p className="text-xs text-slate-600 mt-1">Used in URLs — lowercase, hyphens only.</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-5 mt-5 border-t border-white/5">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : existing ? "Save Changes" : "Add Category"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-white/6 hover:bg-white/10 text-slate-300 border border-white/8 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
