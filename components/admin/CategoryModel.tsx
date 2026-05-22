// components/admin/CategoryModel.tsx
"use client";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { addCategory, updateCategory } from "@/store/slices/categorySlice";
import { ICategory } from "@/types";

interface Props {
  existing: ICategory | null; // null = new
  onClose: () => void;
}

export default function CategoryModal({ existing, onClose }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill when editing
  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setSlug(existing.slug);
    }
  }, [existing]);

  // Auto-generate slug from name (only on Add)
  const handleNameChange = (val: string) => {
    setName(val);
    if (!existing) {
      setSlug(val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !slug.trim()) return setError("Name and slug are required.");
    setLoading(true);
    setError("");
    try {
      if (existing) {
        await dispatch(updateCategory({ id:existing._id!, data: { name, slug } })).unwrap();
      } else {
        await dispatch(addCategory({ name, slug })).unwrap();
      }
      onClose();
    } catch {
      setError("Something went wrong. Slug may already exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1a1d2e] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
        <h2 className="text-lg font-bold text-white">
          {existing ? "Edit Category" : "New Category"}
        </h2>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Name</label>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Electronics"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Slug</label>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. electronics"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {loading ? "Saving…" : existing ? "Save Changes" : "Add Category"}
          </button>
        </div>
      </div>
    </div>
  );
} 

