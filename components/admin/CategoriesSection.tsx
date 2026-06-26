// // components/admin/CategoriesSection.tsx
// "use client";
// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import toast, { Toaster } from "react-hot-toast";
// import { AppDispatch, RootState } from "@/store";
// import {
//   fetchCategories,
//   deleteCategory,
// } from "@/store/slices/categorySlice";
// import { ICategory } from "@/types";
// import CategoryModal from "./CategoryModel";
// import DeleteConfirmModal from "./DeleteConfirmModal";

// export default function CategoriesSection() {
//   const dispatch = useDispatch<AppDispatch>();
//   const { items: categories, loading, error } = useSelector(
//     (s: RootState) => s.categories
//   );

//   const [catModal, setCatModal] = useState<null | "new" | ICategory>(null);
//   const [deleteTarget, setDeleteTarget] = useState<ICategory | null>(null);

//   useEffect(() => {
//     dispatch(fetchCategories());
//   }, [dispatch]);

//   // ── Delete with toast ──────────────────────────────────────
//   const handleDelete = () => {
//     if (!deleteTarget) return;
//     const name = deleteTarget.name;
//     toast.promise(
//       dispatch(deleteCategory(deleteTarget._id!)).unwrap(),
//       {
//         loading: "Deleting category…",
//         success: `"${name}" deleted successfully 🗑`,
//         error:   (err) => `Failed to delete: ${err}`,
//       }
//     ).then(() => setDeleteTarget(null)).catch(() => {});
//   };

//   // ── Add / Edit success toast (called from CategoryModal) ───
//   const handleModalSuccess = (mode: "add" | "edit", name: string) => {
//     toast.success(
//       mode === "add"
//         ? `"${name}" category added! 🏷`
//         : `"${name}" updated successfully ✅`,
//       { duration: 3500 }
//     );
//     setCatModal(null);
//   };

//   return (
//     <div className="max-w-2xl space-y-4">

//       {/* Toast container — dark theme matching dashboard */}
//       <Toaster
//         position="top-right"
//         toastOptions={{
//           duration: 3500,
//           style: {
//             background: "#1e293b",
//             color: "#f1f5f9",
//             border: "1px solid rgba(255,255,255,0.08)",
//             borderRadius: "12px",
//             fontSize: "13px",
//             fontWeight: 600,
//             padding: "12px 16px",
//           },
//           success: { iconTheme: { primary: "#34d399", secondary: "#0f1420" } },
//           error:   { iconTheme: { primary: "#f87171", secondary: "#0f1420" } },
//           loading: { iconTheme: { primary: "#818cf8", secondary: "#0f1420" } },
//         }}
//       />

//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-lg font-bold text-white">Manage Categories</h2>
//           <p className="text-xs text-slate-500 mt-0.5">
//             {categories.length} categories
//           </p>
//         </div>
//         <button
//           onClick={() => setCatModal("new")}
//           className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
//         >
//           + Add Category
//         </button>
//       </div>

//       {/* States */}
//       {loading && <p className="text-sm text-slate-500">Loading…</p>}
//       {error && <p className="text-sm text-red-400">{error}</p>}

//       {/* Table */}
//       {!loading && (
//         <div className="rounded-xl border border-white/10 overflow-hidden">
//           <table className="w-full text-sm">
//             <thead>
//               <tr
//                 className="text-xs text-slate-500 uppercase tracking-wider border-b"
//                 style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}
//               >
//                 {["Name", "Slug", "Products", "Actions"].map((h) => (
//                   <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {categories.length === 0 && (
//                 <tr>
//                   <td colSpan={4} className="px-5 py-8 text-center text-slate-500 text-sm">
//                     No categories yet. Add one to get started.
//                   </td>
//                 </tr>
//               )}
//               {categories.map((c) => (
//                 <tr
//                   key={c._id}
//                   className="border-b hover:bg-white/5 transition-colors"
//                   style={{ borderColor: "rgba(255,255,255,0.03)" }}
//                 >
//                   <td className="px-5 py-3.5">
//                     <div className="flex items-center gap-2.5">
//                       <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center text-xs">🏷</div>
//                       <span className="font-medium text-white">{c.name}</span>
//                     </div>
//                   </td>
//                   <td className="px-5 py-3.5 font-mono text-xs text-slate-400">{c.slug}</td>
//                   <td className="px-5 py-3.5 text-white font-bold">{c.count ?? 0}</td>
//                   <td className="px-5 py-3.5">
//                     <div className="flex gap-1.5">
//                       <button
//                         onClick={() => setCatModal(c)}
//                         className="px-2.5 py-1 text-xs text-slate-300 hover:text-white border border-white/10 hover:border-white/20 rounded-md transition-colors"
//                       >
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => setDeleteTarget(c)}
//                         className="px-2.5 py-1 text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 rounded-md transition-colors"
//                       >
//                         Delete
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Modals */}
//       {catModal !== null && (
//         <CategoryModal
//           existing={catModal === "new" ? null : catModal}
//           onClose={() => setCatModal(null)}
//           onSuccess={handleModalSuccess}   // ← passes toast trigger into modal
//         />
//       )}
//       {deleteTarget && (
//         <DeleteConfirmModal
//           name={deleteTarget.name}
//           onConfirm={handleDelete}
//           onCancel={() => setDeleteTarget(null)}
//         />
//       )}
//     </div>
//   );
// }






// components/admin/CategoriesSection.tsx
"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { AppDispatch, RootState } from "@/store";
import {
  fetchCategories,
  deleteCategory,
} from "@/store/slices/categorySlice";
import { ICategory } from "@/types";
import CategoryModal from "./CategoryModel";
import DeleteConfirmModal from "./DeleteConfirmModal";

export default function CategoriesSection() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: categories, loading, error } = useSelector(
    (s: RootState) => s.categories
  );

  const [catModal, setCatModal] = useState<null | "new" | ICategory>(null);
  const [deleteTarget, setDeleteTarget] = useState<ICategory | null>(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // ── Delete with toast ──────────────────────────────────────
  const handleDelete = () => {
    if (!deleteTarget) return;
    const name = deleteTarget.name;
    toast.promise(
      dispatch(deleteCategory(deleteTarget._id!)).unwrap(),
      {
        loading: "Deleting category…",
        success: `"${name}" deleted successfully 🗑`,
        error: (err) => `Failed to delete: ${err}`,
      }
    ).then(() => setDeleteTarget(null)).catch(() => { });
  };

  // ── Add / Edit success toast (called from CategoryModal) ───
  const handleModalSuccess = (mode: "add" | "edit", name: string) => {
    toast.success(
      mode === "add"
        ? `"${name}" category added! 🏷`
        : `"${name}" updated successfully ✅`,
      { duration: 3500 }
    );
    setCatModal(null);
  };

  return (
    <div className="max-w-2xl space-y-4">

      {/* Toast container — refined light theme */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: "#ffffff",
            color: "#0f172a",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            fontSize: "13px",
            fontWeight: 600,
            padding: "12px 16px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
          },
          success: { iconTheme: { primary: "#10b981", secondary: "#ffffff" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#ffffff" } },
          loading: { iconTheme: { primary: "#4f46e5", secondary: "#ffffff" } },
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Manage Categories</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {categories.length} categories
          </p>
        </div>
        <button
          onClick={() => setCatModal("new")}
          className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors shadow-xs"
        >
          + Add Category
        </button>
      </div>

      {/* States */}
      {loading && <p className="text-sm text-slate-500 animate-pulse">Loading…</p>}
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

      {/* Table */}
      {!loading && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50/75">
                {["Name", "Slug", "Products", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-slate-400 text-sm">
                    No categories yet. Add one to get started.
                  </td>
                </tr>
              )}
              {categories.map((c) => (
                <tr
                  key={c._id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center text-xs">🏷</div>
                      <span className="font-semibold text-slate-900">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{c.slug}</td>
                  <td className="px-5 py-3.5 text-slate-900 font-black">{c.count ?? 0}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setCatModal(c)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(c)}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50/50 hover:bg-rose-50 border border-rose-100 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {catModal !== null && (
        <CategoryModal
          existing={catModal === "new" ? null : catModal}
          onClose={() => setCatModal(null)}
          onSuccess={handleModalSuccess}   // ← passes toast trigger into modal
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          name={deleteTarget.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
