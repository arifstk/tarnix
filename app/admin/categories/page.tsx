// // app/admin/categories/page.tsx — Category management: list, add, edit, delete via Redux

// "use client";
// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { RootState, AppDispatch } from "@/store";
// import { fetchCategories, addCategory, updateCategory, deleteCategory } from "@/store/slices/categorySlice";

// export default function CategoriesPage() {
//   const dispatch = useDispatch<AppDispatch>();
//   const { items: categories, loading } = useSelector((s: RootState) => s.categories);
//   const [showForm, setShowForm] = useState(false);
//   const [editTarget, setEditTarget] = useState<any>(null);
//   const [form, setForm] = useState({ name: "", slug: "" });

//   useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

//   function handleEdit(c: any) {
//     setEditTarget(c);
//     setForm({ name: c.name, slug: c.slug });
//     setShowForm(true);
//   }

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     if (editTarget) {
//       await dispatch(updateCategory({ id: editTarget._id!, data: form }));
//     } else {
//       await dispatch(addCategory(form));
//     }
//     setShowForm(false);
//     setEditTarget(null);
//     setForm({ name: "", slug: "" });
//   }

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-10">
//       <div className="flex items-center justify-between mb-8">
//         <h1 className="text-2xl font-bold text-white">Categories</h1>
//         <button onClick={() => { setShowForm(true); setEditTarget(null); }} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-medium transition">
//           + Add Category
//         </button>
//       </div>

//       {showForm && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
//           <div className="bg-slate-900 rounded-2xl p-8 w-full max-w-md border border-slate-700">
//             <h2 className="text-xl font-bold text-white mb-6">{editTarget ? "Edit Category" : "New Category"}</h2>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <label className="text-sm text-slate-300 block mb-1">Name</label>
//                 <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//               </div>
//               <div>
//                 <label className="text-sm text-slate-300 block mb-1">Slug</label>
//                 <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required className="w-full px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. electronics" />
//               </div>
//               <div className="flex gap-3 pt-2">
//                 <button type="submit" className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium transition">Save</button>
//                 <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium transition">Cancel</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {loading ? (
//         <div className="text-slate-400">Loading...</div>
//       ) : (
//         <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
//           <table className="w-full text-sm text-left">
//             <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
//               <tr>
//                 {["Name", "Slug", "Actions"].map((h) => <th key={h} className="px-5 py-3">{h}</th>)}
//               </tr>
//             </thead>
//             <tbody>
//               {categories.map((c) => (
//                 <tr key={c._id} className="border-t border-slate-800 hover:bg-slate-800/50 transition">
//                   <td className="px-5 py-3 text-white font-medium">{c.name}</td>
//                   <td className="px-5 py-3 text-slate-400 font-mono">{c.slug}</td>
//                   <td className="px-5 py-3">
//                     <div className="flex gap-2">
//                       <button onClick={() => handleEdit(c)} className="px-3 py-1 bg-indigo-600/20 text-indigo-400 rounded-lg hover:bg-indigo-600/40 transition">Edit</button>
//                       <button onClick={() => dispatch(deleteCategory(c._id!))} className="px-3 py-1 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/40 transition">Delete</button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }

