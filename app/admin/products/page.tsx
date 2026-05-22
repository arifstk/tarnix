// // app/admin/products/page.tsx — Product management: list, add, edit, delete via Redux

// "use client";
// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { RootState, AppDispatch } from "@/store";
// import { fetchProducts, addProduct, updateProduct, deleteProduct } from "@/store/slices/productSlice";
// import { fetchCategories } from "@/store/slices/categorySlice";
// import Image from "next/image";

// export default function ProductsPage() {
//   const dispatch = useDispatch<AppDispatch>();
//   const { items: products, loading } = useSelector((s: RootState) => s.products);
//   const { items: categories } = useSelector((s: RootState) => s.categories);

//   const [showForm, setShowForm] = useState(false);
//   const [editTarget, setEditTarget] = useState<any>(null);
//   const [form, setForm] = useState({ name: "", description: "", price: "", category: "", imageBase64: "" });

//   useEffect(() => {
//     dispatch(fetchProducts());
//     dispatch(fetchCategories());
//   }, [dispatch]);

//   function handleEdit(p: any) {
//     setEditTarget(p);
//     setForm({ name: p.name, description: p.description, price: String(p.price), category: p.category?._id ?? p.category, imageBase64: "" });
//     setShowForm(true);
//   }

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     const payload = { ...form, price: Number(form.price) };
//     if (editTarget) {
//       await dispatch(updateProduct({ id: editTarget._id, data: payload }));
//     } else {
//       await dispatch(addProduct(payload));
//     }
//     setShowForm(false);
//     setEditTarget(null);
//     setForm({ name: "", description: "", price: "", category: "", imageBase64: "" });
//   }

//   function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = () => setForm((f) => ({ ...f, imageBase64: reader.result as string }));
//     reader.readAsDataURL(file);
//   }

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-10">
//       <div className="flex items-center justify-between mb-8">
//         <h1 className="text-2xl font-bold text-white">Products</h1>
//         <button onClick={() => { setShowForm(true); setEditTarget(null); }} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-medium transition">
//           + Add Product
//         </button>
//       </div>

//       {/* Form Modal */}
//       {showForm && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
//           <div className="bg-slate-900 rounded-2xl p-8 w-full max-w-lg border border-slate-700">
//             <h2 className="text-xl font-bold text-white mb-6">{editTarget ? "Edit Product" : "New Product"}</h2>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               {(["name", "description"] as const).map((f) => (
//                 <div key={f}>
//                   <label className="text-sm text-slate-300 block mb-1 capitalize">{f}</label>
//                   <input
//                     value={(form as any)[f]}
//                     onChange={(e) => setForm({ ...form, [f]: e.target.value })}
//                     required
//                     className="w-full px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                   />
//                 </div>
//               ))}
//               <div>
//                 <label className="text-sm text-slate-300 block mb-1">Price</label>
//                 <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className="w-full px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//               </div>
//               <div>
//                 <label className="text-sm text-slate-300 block mb-1">Category</label>
//                 <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required className="w-full px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
//                   <option value="">Select category</option>
//                   {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
//                 </select>
//               </div>
//               <div>
//                 <label className="text-sm text-slate-300 block mb-1">Image{editTarget ? " (leave empty to keep)" : ""}</label>
//                 <input type="file" accept="image/*" onChange={handleImageChange} className="text-slate-300 text-sm" />
//               </div>
//               <div className="flex gap-3 pt-2">
//                 <button type="submit" className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium transition">Save</button>
//                 <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium transition">Cancel</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Products Table */}
//       {loading ? (
//         <div className="text-slate-400">Loading...</div>
//       ) : (
//         <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
//           <table className="w-full text-sm text-left">
//             <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
//               <tr>
//                 {["Image", "Name", "Price", "Category", "Actions"].map((h) => (
//                   <th key={h} className="px-5 py-3">{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {products.map((p) => (
//                 <tr key={p._id} className="border-t border-slate-800 hover:bg-slate-800/50 transition">
//                   <td className="px-5 py-3">
//                     <Image src={p.imageUrl} alt={p.name} width={40} height={40} className="rounded-lg object-cover" />
//                   </td>
//                   <td className="px-5 py-3 text-white font-medium">{p.name}</td>
//                   <td className="px-5 py-3 text-slate-300">${p.price}</td>
//                   <td className="px-5 py-3 text-slate-300">{typeof p.category === "object" ? (p.category as any).name : p.category}</td>
//                   <td className="px-5 py-3">
//                     <div className="flex gap-2">
//                       <button onClick={() => handleEdit(p)} className="px-3 py-1 bg-indigo-600/20 text-indigo-400 rounded-lg hover:bg-indigo-600/40 transition">Edit</button>
//                       <button onClick={() => dispatch(deleteProduct(p._id!))} className="px-3 py-1 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/40 transition">Delete</button>
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

