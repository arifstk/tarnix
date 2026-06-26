// // components/admin/ProductsSection.tsx
// "use client";

// import { useEffect, useRef, useState, ChangeEvent } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import toast, { Toaster } from "react-hot-toast";
// import type { AppDispatch, RootState } from "@/store";

// import {
//   fetchProducts,
//   addProduct,
//   updateProduct,
//   deleteProduct,
//   patchProductInventory,
//   IProduct,
//   ProductInput,
// } from "@/store/slices/productSlice";
// import { fetchCategories } from "@/store/slices/categorySlice";

// // ─────────────────────────────────────────────────────────────
// // Tiny UI Atoms
// // ─────────────────────────────────────────────────────────────
// const Card = ({
//   children,
//   className = "",
// }: {
//   children: React.ReactNode;
//   className?: string;
// }) => (
//   <div
//     className={`rounded-2xl p-5 ${className}`}
//     style={{
//       background: "linear-gradient(145deg,#141b2d,#0f1420)",
//       border: "1px solid rgba(255,255,255,0.06)",
//     }}
//   >
//     {children}
//   </div>
// );

// const Btn = ({
//   children,
//   variant = "primary",
//   size = "sm",
//   onClick,
//   disabled,
//   className = "",
// }: {
//   children: React.ReactNode;
//   variant?: "primary" | "ghost" | "danger" | "success" | "warning";
//   size?: "sm" | "xs";
//   onClick?: () => void;
//   disabled?: boolean;
//   className?: string;
// }) => {
//   const v = {
//     primary:
//       "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30",
//     ghost:
//       "bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08]",
//     danger:
//       "bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/25",
//     success:
//       "bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/25",
//     warning:
//       "bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/25",
//   }[variant];

//   const s = size === "xs" ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm";

//   return (
//     <button
//       onClick={onClick}
//       disabled={disabled}
//       className={`${v} ${s} rounded-xl font-semibold transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
//     >
//       {children}
//     </button>
//   );
// };

// const FieldLabel = ({ children }: { children: React.ReactNode }) => (
//   <label className="block text-xs font-semibold text-slate-400 mb-1.5">
//     {children}
//   </label>
// );

// const TextInput = ({
//   label,
//   className = "",
//   ...props
// }: {
//   label: string;
// } & React.InputHTMLAttributes<HTMLInputElement>) => (
//   <div>
//     {label && <FieldLabel>{label}</FieldLabel>}

//     <input
//       {...props}
//       className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all ${className}`}
//     />
//   </div>
// );

// const SelectInput = ({
//   label,
//   children,
//   ...props
// }: {
//   label: string;
// } & React.SelectHTMLAttributes<HTMLSelectElement> & {
//   children: React.ReactNode;
// }) => (
//   <div>
//     <FieldLabel>{label}</FieldLabel>

//     <select
//       {...props}
//       className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all"
//     >
//       {children}
//     </select>
//   </div>
// );

// const Textarea = ({
//   label,
//   ...props
// }: {
//   label: string;
// } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
//   <div>
//     <FieldLabel>{label}</FieldLabel>

//     <textarea
//       {...props}
//       rows={3}
//       className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 resize-none transition-all"
//     />
//   </div>
// );

// const Modal = ({
//   title,
//   onClose,
//   children,
// }: {
//   title: string;
//   onClose: () => void;
//   children: React.ReactNode;
// }) => (
//   <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm overflow-y-auto py-8">
//     <div
//       className="w-full max-w-lg rounded-2xl p-6 shadow-2xl"
//       style={{
//         background: "#141b2d",
//         border: "1px solid rgba(255,255,255,0.1)",
//       }}
//     >
//       <div className="flex items-center justify-between mb-5">
//         <h3 className="text-base font-bold text-white">{title}</h3>

//         <button
//           onClick={onClose}
//           className="w-7 h-7 rounded-lg bg-white/[0.07] hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
//         >
//           ✕
//         </button>
//       </div>

//       {children}
//     </div>
//   </div>
// );

// // Star Rating ===========================
// const StarRating = ({
//   value,
//   onChange,
//   readonly = false,
// }: {
//   value: number;
//   onChange?: (v: number) => void;
//   readonly?: boolean;
// }) => (
//   <div className="flex items-center gap-0.5">
//     {[1, 2, 3, 4, 5].map((star) => {
//       const filled = star <= value;

//       return (
//         <button
//           key={star}
//           type="button"
//           disabled={readonly}
//           onClick={() => onChange?.(star)}
//           aria-label={`Rate ${star} out of 5 stars`}
//           className={`text-lg transition-all ${
//             readonly
//               ? "cursor-default"
//               : "hover:scale-125 cursor-pointer"
//           } ${
//             filled
//               ? "text-amber-500 fill-current" 
//               : "text-gray-300 dark:text-gray-600"
//           }`}
//         >
//           ★
//         </button>
//       );
//     })}
//   </div>
// );

// // ─────────────────────────────────────────────────────────────
// // Confirm Modal
// // ─────────────────────────────────────────────────────────────
// const ConfirmModal = ({
//   name,
//   onConfirm,
//   onCancel,
// }: {
//   name: string;
//   onConfirm: () => void;
//   onCancel: () => void;
// }) => (
//   <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
//     <div
//       className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
//       style={{
//         background: "#141b2d",
//         border: "1px solid rgba(239,68,68,0.2)",
//       }}
//     >
//       <div className="w-12 h-12 rounded-xl bg-rose-500/15 flex items-center justify-center text-2xl mx-auto mb-4">
//         🗑
//       </div>

//       <h3 className="text-base font-bold text-white text-center mb-1">
//         Delete Product?
//       </h3>

//       <p className="text-sm text-slate-400 text-center mb-6">
//         <span className="text-white font-semibold">{name}</span> will be
//         permanently removed.
//       </p>

//       <div className="flex gap-3">
//         <Btn
//           variant="danger"
//           className="flex-1"
//           onClick={onConfirm}
//         >
//           Yes, Delete
//         </Btn>

//         <Btn
//           variant="ghost"
//           className="flex-1"
//           onClick={onCancel}
//         >
//           Cancel
//         </Btn>
//       </div>
//     </div>
//   </div>
// );

// // ─────────────────────────────────────────────────────────────
// // Quick Edit Modal
// // ─────────────────────────────────────────────────────────────
// const QuickEditModal = ({
//   product,
//   onClose,
//   onSave,
// }: {
//   product: IProduct;
//   onClose: () => void;
//   onSave: (stock: number, discountRate: number) => void;
// }) => {
//   const [stock, setStock] = useState(product.stock);
//   const [discountRate, setDiscountRate] = useState(
//     product.discountRate
//   );

//   const finalPrice =
//     discountRate > 0
//       ? (product.price * (1 - discountRate / 100)).toFixed(2)
//       : product.price.toFixed(2);

//   return (
//     <Modal
//       title={`Quick Edit — ${product.name}`}
//       onClose={onClose}
//     >
//       <div className="space-y-4">
//         <div className="grid grid-cols-2 gap-4">
//           <TextInput
//             label="Stock Quantity"
//             type="number"
//             min={0}
//             value={stock}
//             onChange={(e) => setStock(Number(e.target.value))}
//           />

//           <TextInput
//             label="Discount Rate (%)"
//             type="number"
//             min={0}
//             max={100}
//             value={discountRate}
//             onChange={(e) =>
//               setDiscountRate(Number(e.target.value))
//             }
//           />
//         </div>

//         <div className="px-4 py-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between">
//           <div>
//             <p className="text-xs text-slate-500 mb-0.5">
//               Original Price
//             </p>

//             <p className="text-sm font-bold text-white">
//               ${product.price.toFixed(2)}
//             </p>
//           </div>

//           <span className="text-slate-600 text-lg">→</span>

//           <div className="text-right">
//             <p className="text-xs text-slate-500 mb-0.5">
//               Final Price
//             </p>

//             <p
//               className={`text-sm font-bold ${discountRate > 0
//                 ? "text-emerald-400"
//                 : "text-white"
//                 }`}
//             >
//               ${finalPrice}
//             </p>
//           </div>

//           {discountRate > 0 && (
//             <span className="ml-2 text-xs font-bold px-2 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/20">
//               -{discountRate}%
//             </span>
//           )}
//         </div>

//         <div className="flex gap-3 pt-1">
//           <Btn
//             variant="primary"
//             className="flex-1"
//             onClick={() => onSave(stock, discountRate)}
//           >
//             Save Changes
//           </Btn>

//           <Btn
//             variant="ghost"
//             className="flex-1"
//             onClick={onClose}
//           >
//             Cancel
//           </Btn>
//         </div>
//       </div>
//     </Modal>
//   );
// };

// // ─────────────────────────────────────────────────────────────
// // Form Types
// // ─────────────────────────────────────────────────────────────
// type FormData = {
//   name: string;
//   description: string;
//   price: string;
//   discountRate: string;
//   stock: string;
//   category: string;
//   status: "active" | "draft";
//   tags: string;
//   sku: string;

//   images: Array<{
//     base64: string;
//     preview: string;
//   }>;

//   rating: string;
//   ratingCount: string;
// };

// const EMPTY_IMAGES = Array.from({ length: 4 }, () => ({
//   base64: "",
//   preview: "",
// }));

// const EMPTY_FORM: FormData = {
//   name: "",
//   description: "",
//   price: "",
//   discountRate: "0",
//   stock: "0",
//   category: "",
//   status: "active",
//   tags: "",
//   sku: "",
//   images: EMPTY_IMAGES,
//   rating: "0",
//   ratingCount: "0",
// };

// // ─────────────────────────────────────────────────────────────
// // Multi Image Uploader
// // ─────────────────────────────────────────────────────────────
// const MultiImageUploader = ({
//   images,
//   onChange,
// }: {
//   images: FormData["images"];
//   onChange: (next: FormData["images"]) => void;
// }) => {
//   const fileRefs = [
//     useRef<HTMLInputElement>(null),
//     useRef<HTMLInputElement>(null),
//     useRef<HTMLInputElement>(null),
//     useRef<HTMLInputElement>(null),
//   ];

//   const handleFile = (
//     index: number,
//     e: ChangeEvent<HTMLInputElement>
//   ) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const reader = new FileReader();

//     reader.onload = (ev) => {
//       const base64 = (ev.target?.result as string) ?? "";

//       const next = [...images];

//       next[index] = {
//         base64,
//         preview: base64,
//       };

//       onChange(next);
//     };

//     reader.readAsDataURL(file);
//   };

//   const clearSlot = (index: number) => {
//     const next = [...images];

//     next[index] = {
//       base64: "",
//       preview: "",
//     };

//     onChange(next);
//   };

//   return (
//     <div>
//       <FieldLabel>
//         Product Images (up to 4) — slot 1 is the main image
//       </FieldLabel>

//       <div className="grid grid-cols-4 gap-2">
//         {images.map((img, i) => (
//           <div key={i} className="relative">
//             <div
//               onClick={() => fileRefs[i].current?.click()}
//               className={`w-full aspect-square rounded-xl border-2 border-dashed cursor-pointer transition-colors overflow-hidden flex items-center justify-center
//                 ${i === 0
//                   ? "border-indigo-500/50 hover:border-indigo-400"
//                   : "border-slate-700 hover:border-slate-500"
//                 }
//                 ${img.preview ? "p-0" : "p-2"}`}
//             >
//               {img.preview ? (
//                 <img
//                   src={img.preview}
//                   alt={`slot ${i + 1}`}
//                   className="w-full h-full object-cover rounded-xl"
//                 />
//               ) : (
//                 <div className="text-center text-slate-600 text-xs">
//                   <div className="text-xl">
//                     {i === 0 ? "📸" : "+"}
//                   </div>

//                   <span>
//                     {i === 0 ? "Main" : `#${i + 1}`}
//                   </span>
//                 </div>
//               )}
//             </div>

//             {img.preview && (
//               <button
//                 type="button"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   clearSlot(i);
//                 }}
//                 className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center shadow-lg hover:bg-rose-400"
//               >
//                 ✕
//               </button>
//             )}

//             <input
//               ref={fileRefs[i]}
//               type="file"
//               accept="image/*"
//               className="hidden"
//               onChange={(e) => handleFile(i, e)}
//             />
//           </div>
//         ))}
//       </div>

//       <p className="text-xs text-slate-600 mt-1.5">
//         Slot 1 (main) is used as the product thumbnail
//         everywhere.
//       </p>
//     </div>
//   );
// };

// // ─────────────────────────────────────────────────────────────
// // Product Form Modal
// // ─────────────────────────────────────────────────────────────
// const ProductFormModal = ({
//   product,
//   categories,
//   saving,
//   onClose,
//   onSubmit,
// }: {
//   product: IProduct | null;
//   categories: { _id: string; name: string }[];
//   saving: boolean;
//   onClose: () => void;
//   onSubmit: (data: Partial<ProductInput>) => void;
// }) => {
//   const [form, setForm] = useState<FormData>(() =>
//     product
//       ? {
//         name: product.name,
//         description: product.description,
//         price: String(product.price),
//         discountRate: String(product.discountRate),
//         stock: String(product.stock),

//         category:
//           typeof product.category === "string"
//             ? product.category
//             : product.category._id,

//         status: product.status,
//         tags: product.tags.join(", "),
//         sku: product.sku,

//         images: Array.from({ length: 4 }, (_, i) => ({
//           base64: "",
//           preview: product.images?.[i]?.url ?? "",
//         })),

//         rating: String(product.rating ?? 0),
//         ratingCount: String(product.ratingCount ?? 0),
//       }
//       : {
//         ...EMPTY_FORM,
//         category: categories[0]?._id ?? "",
//       }
//   );

//   const finalPrice = (() => {
//     const p = parseFloat(form.price) || 0;
//     const dr = parseFloat(form.discountRate) || 0;

//     return dr > 0
//       ? (p * (1 - dr / 100)).toFixed(2)
//       : p.toFixed(2);
//   })();

//   const handleSubmit = () => {
//     const payload: Partial<ProductInput> = {
//       name: form.name,
//       description: form.description,
//       price: parseFloat(form.price),
//       discountRate:
//         parseFloat(form.discountRate) || 0,
//       stock: parseInt(form.stock, 10) || 0,
//       category: form.category,
//       status: form.status,

//       tags: form.tags
//         .split(",")
//         .map((t) => t.trim())
//         .filter(Boolean),

//       sku: form.sku,

//       rating: parseFloat(form.rating) || 0,
//       ratingCount:
//         parseInt(form.ratingCount, 10) || 0,
//     };

//     const imagesBase64 = form.images.map(
//       (img) => img.base64 || null
//     );

//     if (imagesBase64.some(Boolean)) {
//       (payload as any).imagesBase64 = imagesBase64;
//     }

//     onSubmit(payload);
//   };

//   return (
//     <Modal
//       title={
//         product
//           ? `Edit — ${product.name}`
//           : "Add New Product"
//       }
//       onClose={onClose}
//     >
//       <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
//         <TextInput
//           label="Product Name *"
//           value={form.name}
//           onChange={(e) =>
//             setForm((f) => ({
//               ...f,
//               name: e.target.value,
//             }))
//           }
//           placeholder="e.g. Wireless Earbuds"
//         />

//         <Textarea
//           label="Description *"
//           value={form.description}
//           onChange={(e) =>
//             setForm((f) => ({
//               ...f,
//               description: e.target.value,
//             }))
//           }
//           placeholder="What is this product?"
//         />

//         <div className="grid grid-cols-2 gap-3">
//           <TextInput
//             label="Price ($) *"
//             type="number"
//             min={0}
//             step="0.01"
//             value={form.price}
//             onChange={(e) =>
//               setForm((f) => ({
//                 ...f,
//                 price: e.target.value,
//               }))
//             }
//             placeholder="0.00"
//           />

//           <TextInput
//             label="Stock *"
//             type="number"
//             min={0}
//             value={form.stock}
//             onChange={(e) =>
//               setForm((f) => ({
//                 ...f,
//                 stock: e.target.value,
//               }))
//             }
//             placeholder="0"
//           />
//         </div>

//         <div className="grid grid-cols-2 gap-3">
//           <div>
//             <TextInput
//               label="Discount Rate (%)"
//               type="number"
//               min={0}
//               max={100}
//               value={form.discountRate}
//               onChange={(e) =>
//                 setForm((f) => ({
//                   ...f,
//                   discountRate: e.target.value,
//                 }))
//               }
//               placeholder="0"
//             />

//             {parseFloat(form.discountRate) > 0 && (
//               <p className="text-xs text-emerald-400 mt-1 font-semibold">
//                 Final price: ${finalPrice}
//               </p>
//             )}
//           </div>

//           <TextInput
//             label="SKU"
//             value={form.sku}
//             onChange={(e) =>
//               setForm((f) => ({
//                 ...f,
//                 sku: e.target.value,
//               }))
//             }
//             placeholder="SKU-001"
//           />
//         </div>

//         <div className="grid grid-cols-2 gap-3">
//           <SelectInput
//             label="Category *"
//             value={form.category}
//             onChange={(e) =>
//               setForm((f) => ({
//                 ...f,
//                 category: e.target.value,
//               }))
//             }
//           >
//             {categories.map((c) => (
//               <option key={c._id} value={c._id}>
//                 {c.name}
//               </option>
//             ))}
//           </SelectInput>

//           <SelectInput
//             label="Status"
//             value={form.status}
//             onChange={(e) =>
//               setForm((f) => ({
//                 ...f,
//                 status: e.target.value as
//                   | "active"
//                   | "draft",
//               }))
//             }
//           >
//             <option value="active">Active</option>
//             <option value="draft">Draft</option>
//           </SelectInput>
//         </div>

//         <TextInput
//           label="Tags (comma-separated)"
//           value={form.tags}
//           onChange={(e) =>
//             setForm((f) => ({
//               ...f,
//               tags: e.target.value,
//             }))
//           }
//           placeholder="sale, new-arrival, top-rated"
//         />

//         <MultiImageUploader
//           images={form.images}
//           onChange={(imgs) =>
//             setForm((f) => ({
//               ...f,
//               images: imgs,
//             }))
//           }
//         />

//         <div>
//           <FieldLabel>
//             Rating (admin override)
//           </FieldLabel>

//           <div className="flex items-center gap-3 flex-wrap">
//             <StarRating
//               value={parseFloat(form.rating) || 0}
//               onChange={(v) =>
//                 setForm((f) => ({
//                   ...f,
//                   rating: String(v),
//                 }))
//               }
//             />

//             <span className="text-sm text-slate-400 font-semibold">
//               {form.rating} / 5
//             </span>

//             <div className="w-24">
//               <TextInput
//                 label=""
//                 type="number"
//                 min={0}
//                 step={1}
//                 value={form.ratingCount}
//                 onChange={(e) =>
//                   setForm((f) => ({
//                     ...f,
//                     ratingCount: e.target.value,
//                   }))
//                 }
//                 placeholder="# reviews"
//               />
//             </div>

//             <span className="text-xs text-slate-500">
//               reviews
//             </span>
//           </div>
//         </div>
//       </div>

//       <div className="flex gap-3 pt-5 border-t border-white/50 mt-5">
//         <Btn
//           variant="primary"
//           className="flex-1"
//           disabled={saving}
//           onClick={handleSubmit}
//         >
//           {saving
//             ? "Saving…"
//             : product
//               ? "Save Changes"
//               : "Add Product"}
//         </Btn>

//         <Btn
//           variant="ghost"
//           className="flex-1"
//           onClick={onClose}
//         >
//           Cancel
//         </Btn>
//       </div>
//     </Modal>
//   );
// };

// // ─────────────────────────────────────────────────────────────
// // Status Badge
// // ─────────────────────────────────────────────────────────────
// const StatusBadge = ({
//   status,
// }: {
//   status: "active" | "draft";
// }) =>
//   status === "active" ? (
//     <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
//       active
//     </span>
//   ) : (
//     <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-500/15 text-slate-400 border border-slate-500/20">
//       draft
//     </span>
//   );

// // ─────────────────────────────────────────────────────────────
// // MAIN
// // ─────────────────────────────────────────────────────────────
// export default function ProductsSection() {
//   const dispatch = useDispatch<AppDispatch>();

//   const {
//     items: products,
//     loading,
//     saving,
//     error,
//   } = useSelector((s: RootState) => s.products);

//   // const categories = useSelector(
//   //   (s: RootState) =>
//   //     (s as any).categories?.items ?? []
//   // ) as { _id: string; name: string }[];
//   const categories = useSelector((s: RootState) => {
//     const slice = (s as any).categories;
//     if (!slice || !Array.isArray(slice.items)) return [] as { _id: string; name: string }[];
//     return slice.items as { _id: string; name: string }[];
//   });


//   const [search, setSearch] = useState("");

//   const [statusFilter, setStatusFilter] =
//     useState<"all" | "active" | "draft">(
//       "all"
//     );

//   const [formTarget, setFormTarget] =
//     useState<IProduct | null | "new">(null);

//   const [quickEdit, setQuickEdit] =
//     useState<IProduct | null>(null);

//   const [confirmDel, setConfirmDel] =
//     useState<IProduct | null>(null);

//   useEffect(() => {
//     dispatch(fetchProducts());
//     dispatch(fetchCategories());
//   }, [dispatch]);

//   const filtered = products.filter((p) => {
//     const matchSearch =
//       p.name
//         .toLowerCase()
//         .includes(search.toLowerCase()) ||
//       p.sku
//         .toLowerCase()
//         .includes(search.toLowerCase());

//     const matchStatus =
//       statusFilter === "all" ||
//       p.status === statusFilter;

//     return matchSearch && matchStatus;
//   });

//   const handleFormSubmit = (
//     data: Partial<ProductInput>
//   ) => {
//     if (formTarget === "new") {
//       toast
//         .promise(
//           dispatch(
//             addProduct(data as ProductInput)
//           ).unwrap(),
//           {
//             loading: "Adding product…",
//             success:
//               "Product added successfully! 🎉",
//             error: (err) =>
//               `Failed to add: ${err}`,
//           }
//         )
//         .then(() => setFormTarget(null))
//         .catch(() => { });
//     } else if (formTarget) {
//       toast
//         .promise(
//           dispatch(
//             updateProduct({
//               id: formTarget._id,
//               data,
//             })
//           ).unwrap(),
//           {
//             loading: "Saving changes…",
//             success: "Product updated! ✅",
//             error: (err) =>
//               `Failed to update: ${err}`,
//           }
//         )
//         .then(() => setFormTarget(null))
//         .catch(() => { });
//     }
//   };

//   const handleQuickSave = (
//     stock: number,
//     discountRate: number
//   ) => {
//     if (!quickEdit) return;

//     toast
//       .promise(
//         dispatch(
//           patchProductInventory({
//             id: quickEdit._id,
//             stock,
//             discountRate,
//           })
//         ).unwrap(),
//         {
//           loading:
//             "Updating stock & discount…",
//           success: "Inventory updated! ⚡",
//           error: (err) =>
//             `Failed to update: ${err}`,
//         }
//       )
//       .then(() => setQuickEdit(null))
//       .catch(() => { });
//   };

//   const handleDelete = () => {
//     if (!confirmDel) return;

//     const name = confirmDel.name;

//     toast
//       .promise(
//         dispatch(
//           deleteProduct(confirmDel._id)
//         ).unwrap(),
//         {
//           loading: "Deleting product…",
//           success: `"${name}" deleted successfully 🗑`,
//           error: (err) =>
//             `Failed to delete: ${err}`,
//         }
//       )
//       .then(() => setConfirmDel(null))
//       .catch(() => { });
//   };

//   return (
//     <div className="max-w-6xl space-y-5">
//       <Toaster
//         position="top-right"
//         toastOptions={{
//           duration: 3500,

//           style: {
//             background: "#1e293b",
//             color: "#f1f5f9",
//             border:
//               "1px solid rgba(255,255,255,0.08)",
//             borderRadius: "12px",
//             fontSize: "13px",
//             fontWeight: 600,
//             padding: "12px 16px",
//           },

//           success: {
//             iconTheme: {
//               primary: "#34d399",
//               secondary: "#0f1420",
//             },
//           },

//           error: {
//             iconTheme: {
//               primary: "#f87171",
//               secondary: "#0f1420",
//             },
//           },

//           loading: {
//             iconTheme: {
//               primary: "#818cf8",
//               secondary: "#0f1420",
//             },
//           },
//         }}
//       />

//       {/* Header */}
//       <div className="flex flex-wrap items-center justify-between gap-3">
//         <div>
//           <h2 className="text-lg font-bold text-white">
//             Manage Products
//           </h2>

//           <p className="text-xs text-slate-500 mt-0.5">
//             {products.length} products listed
//           </p>
//         </div>

//         <div className="flex flex-wrap gap-2 items-center">
//           <div className="flex rounded-xl overflow-hidden border border-slate-700/60">
//             {(
//               ["all", "active", "draft"] as const
//             ).map((f) => (
//               <button
//                 key={f}
//                 onClick={() =>
//                   setStatusFilter(f)
//                 }
//                 className={`px-3 py-1.5 text-xs font-semibold transition-colors ${statusFilter === f
//                   ? "bg-indigo-600 text-white"
//                   : "bg-slate-800/60 text-slate-400 hover:text-white"
//                   }`}
//               >
//                 {f}
//               </button>
//             ))}
//           </div>

//           <input
//             value={search}
//             onChange={(e) =>
//               setSearch(e.target.value)
//             }
//             placeholder="Search name or SKU…"
//             className="px-3.5 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-48"
//           />

//           <Btn
//             variant="primary"
//             onClick={() => setFormTarget("new")}
//           >
//             + Add Product
//           </Btn>
//         </div>
//       </div>

//       {/* Error */}
//       {error && (
//         <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-semibold">
//           ⚠ {error}
//         </div>
//       )}

//       {/* Loading */}
//       {loading && (
//         <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
//           {[...Array(6)].map((_, i) => (
//             <div
//               key={i}
//               className="rounded-2xl h-56 animate-pulse"
//               style={{
//                 background:
//                   "linear-gradient(145deg,#141b2d,#0f1420)",
//                 border:
//                   "1px solid rgba(255,255,255,0.04)",
//               }}
//             />
//           ))}
//         </div>
//       )}

//       {/* Product Grid */}
//       {!loading && (
//         <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
//           {filtered.map((p) => {
//             const catName =
//               typeof p.category === "string"
//                 ? p.category
//                 : p.category.name;

//             const mainImage =
//               p.images?.[0]?.url || p.imageUrl;

//             return (
//               <Card
//                 key={p._id}
//                 className="relative group flex flex-col"
//               >
//                 <div className="flex items-start justify-between mb-3">
//                   <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 shrink-0">
//                     {mainImage ? (
//                       <img
//                         src={mainImage}
//                         alt={p.name}
//                         className="w-full h-full object-cover"
//                       />
//                     ) : (
//                       <div className="w-full h-full flex items-center justify-center text-2xl">
//                         📦
//                       </div>
//                     )}
//                   </div>

//                   <StatusBadge
//                     status={p.status}
//                   />
//                 </div>

//                 <h3 className="text-sm font-bold text-white leading-tight mb-0.5 line-clamp-1">
//                   {p.name}
//                 </h3>

//                 <p className="text-xs text-slate-500 mb-1">
//                   {catName}
//                 </p>

//                 {p.sku && (
//                   <p className="text-xs text-slate-600 font-mono mb-2">
//                     SKU: {p.sku}
//                   </p>
//                 )}

//                 {/* Pricing */}
//                 <div className="flex items-center gap-2 mb-2">
//                   {p.discountRate > 0 ? (
//                     <>
//                       <span className="text-lg font-black text-emerald-400">
//                         $
//                         {p.discountedPrice.toFixed(
//                           2
//                         )}
//                       </span>

//                       <span className="text-xs text-slate-500 line-through">
//                         ${p.price.toFixed(2)}
//                       </span>

//                       <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/20">
//                         -{p.discountRate}%
//                       </span>
//                     </>
//                   ) : (
//                     <span className="text-lg font-black text-white">
//                       ${p.price.toFixed(2)}
//                     </span>
//                   )}
//                 </div>

//                 {/* Rating */}
//                 {p.rating !== undefined && (
//                   <div className="flex items-center gap-1.5 mb-2">
//                     <StarRating
//                       value={Math.round(p.rating)}
//                       readonly
//                     />

//                     <span className="text-xs text-slate-500 font-semibold">
//                       {(p.rating || 0).toFixed(1)} ({p.ratingCount || 0})
//                     </span>
//                   </div>
//                 )}

//                 {/* Stock */}
//                 <div className="flex items-center gap-1.5 mb-4">
//                   <div
//                     className={`w-1.5 h-1.5 rounded-full ${p.stock === 0
//                       ? "bg-rose-500"
//                       : p.stock < 20
//                         ? "bg-amber-400"
//                         : "bg-emerald-500"
//                       }`}
//                   />

//                   <span
//                     className={`text-xs font-semibold ${p.stock === 0
//                       ? "text-rose-400"
//                       : p.stock < 20
//                         ? "text-amber-400"
//                         : "text-slate-400"
//                       }`}
//                   >
//                     {p.stock === 0
//                       ? "Out of stock"
//                       : `${p.stock} in stock`}
//                   </span>
//                 </div>

//                 {/* Tags */}
//                 {p.tags.length > 0 && (
//                   <div className="flex flex-wrap gap-1 mb-3">
//                     {p.tags
//                       .slice(0, 3)
//                       .map((t) => (
//                         <span
//                           key={t}
//                           className="text-xs px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/15"
//                         >
//                           {t}
//                         </span>
//                       ))}
//                   </div>
//                 )}

//                 {/* Actions */}
//                 <div className="flex gap-2 mt-auto">
//                   <Btn
//                     variant="warning"
//                     size="xs"
//                     className="flex-1"
//                     onClick={() =>
//                       setQuickEdit(p)
//                     }
//                   >
//                     ⚡ Quick Edit
//                   </Btn>

//                   <Btn
//                     variant="ghost"
//                     size="xs"
//                     className="flex-1"
//                     onClick={() =>
//                       setFormTarget(p)
//                     }
//                   >
//                     ✏ Edit
//                   </Btn>

//                   <Btn
//                     variant="danger"
//                     size="sm"
//                     onClick={() =>
//                       setConfirmDel(p)
//                     }
//                   >
//                     🗑
//                   </Btn>
//                 </div>
//               </Card>
//             );
//           })}

//           {/* Empty */}
//           {filtered.length === 0 && (
//             <div className="col-span-full py-20 text-center">
//               <div className="text-5xl mb-4">
//                 📦
//               </div>

//               <p className="text-slate-400 font-semibold text-sm">
//                 No products found
//               </p>

//               <p className="text-slate-600 text-xs mt-1">
//                 Try adjusting the search or
//                 filters
//               </p>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Modals */}
//       {formTarget !== null && (
//         <ProductFormModal
//           product={
//             formTarget === "new"
//               ? null
//               : formTarget
//           }
//           categories={categories}
//           saving={saving}
//           onClose={() => setFormTarget(null)}
//           onSubmit={handleFormSubmit}
//         />
//       )}

//       {quickEdit && (
//         <QuickEditModal
//           product={quickEdit}
//           onClose={() => setQuickEdit(null)}
//           onSave={handleQuickSave}
//         />
//       )}

//       {confirmDel && (
//         <ConfirmModal
//           name={confirmDel.name}
//           onConfirm={handleDelete}
//           onCancel={() =>
//             setConfirmDel(null)
//           }
//         />
//       )}
//     </div>
//   );
// }






// components/admin/ProductsSection.tsx
"use client";

import { useEffect, useRef, useState, ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import type { AppDispatch, RootState } from "@/store";

import {
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  patchProductInventory,
  IProduct,
  ProductInput,
} from "@/store/slices/productSlice";
import { fetchCategories } from "@/store/slices/categorySlice";

// ─────────────────────────────────────────────────────────────
// Tiny UI Atoms
// ─────────────────────────────────────────────────────────────
const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-2xl p-5 bg-white border border-slate-200/80 shadow-sm ${className}`}
  >
    {children}
  </div>
);

const Btn = ({
  children,
  variant = "primary",
  size = "sm",
  onClick,
  disabled,
  className = "",
}: {
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "danger" | "success" | "warning";
  size?: "sm" | "xs";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) => {
  const v = {
    primary:
      "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs",
    ghost:
      "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200",
    danger:
      "bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200",
    success:
      "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200",
    warning:
      "bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200",
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

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-semibold text-slate-500 mb-1.5">
    {children}
  </label>
);

const TextInput = ({
  label,
  className = "",
  ...props
}: {
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    {label && <FieldLabel>{label}</FieldLabel>}

    <input
      {...props}
      className={`w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs ${className}`}
    />
  </div>
);

const SelectInput = ({
  label,
  children,
  ...props
}: {
  label: string;
} & React.SelectHTMLAttributes<HTMLSelectElement> & {
  children: React.ReactNode;
}) => (
  <div>
    <FieldLabel>{label}</FieldLabel>

    <select
      {...props}
      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs"
    >
      {children}
    </select>
  </div>
);

const Textarea = ({
  label,
  ...props
}: {
  label: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <div>
    <FieldLabel>{label}</FieldLabel>

    <textarea
      {...props}
      rows={3}
      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none transition-all shadow-xs"
    />
  </div>
);

const Modal = ({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto py-8">
    <div
      className="w-full max-w-lg rounded-2xl p-6 bg-white border border-slate-200 shadow-xl"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>

        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all"
        >
          ✕
        </button>
      </div>

      {children}
    </div>
  </div>
);

// Star Rating ===========================
const StarRating = ({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => {
      const filled = star <= value;

      return (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          aria-label={`Rate ${star} out of 5 stars`}
          className={`text-lg transition-all ${readonly
              ? "cursor-default"
              : "hover:scale-125 cursor-pointer"
            } ${filled
              ? "text-amber-500 fill-current"
              : "text-slate-200 dark:text-slate-300"
            }`}
        >
          ★
        </button>
      );
    })}
  </div>
);

// ─────────────────────────────────────────────────────────────
// Confirm Modal
// ─────────────────────────────────────────────────────────────
const ConfirmModal = ({
  name,
  onConfirm,
  onCancel,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-xs">
    <div
      className="w-full max-w-sm rounded-2xl p-6 bg-white border border-rose-200 shadow-xl"
    >
      <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-2xl mx-auto mb-4 border border-rose-100">
        🗑
      </div>

      <h3 className="text-base font-bold text-slate-900 text-center mb-1">
        Delete Product?
      </h3>

      <p className="text-sm text-slate-500 text-center mb-6">
        <span className="text-slate-900 font-semibold">{name}</span> will be
        permanently removed.
      </p>

      <div className="flex gap-3">
        <Btn
          variant="danger"
          className="flex-1"
          onClick={onConfirm}
        >
          Yes, Delete
        </Btn>

        <Btn
          variant="ghost"
          className="flex-1"
          onClick={onCancel}
        >
          Cancel
        </Btn>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Quick Edit Modal
// ─────────────────────────────────────────────────────────────
const QuickEditModal = ({
  product,
  onClose,
  onSave,
}: {
  product: IProduct;
  onClose: () => void;
  onSave: (stock: number, discountRate: number) => void;
}) => {
  const [stock, setStock] = useState(product.stock);
  const [discountRate, setDiscountRate] = useState(
    product.discountRate
  );

  const finalPrice =
    discountRate > 0
      ? (product.price * (1 - discountRate / 100)).toFixed(2)
      : product.price.toFixed(2);

  return (
    <Modal
      title={`Quick Edit — ${product.name}`}
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <TextInput
            label="Stock Quantity"
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
          />

          <TextInput
            label="Discount Rate (%)"
            type="number"
            min={0}
            max={100}
            value={discountRate}
            onChange={(e) =>
              setDiscountRate(Number(e.target.value))
            }
          />
        </div>

        <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">
              Original Price
            </p>

            <p className="text-sm font-bold text-slate-900">
              ${product.price.toFixed(2)}
            </p>
          </div>

          <span className="text-slate-300 text-lg">→</span>

          <div className="text-right">
            <p className="text-xs text-slate-400 mb-0.5">
              Final Price
            </p>

            <p
              className={`text-sm font-bold ${discountRate > 0
                ? "text-emerald-600"
                : "text-slate-900"
                }`}
            >
              ${finalPrice}
            </p>
          </div>

          {discountRate > 0 && (
            <span className="ml-2 text-xs font-bold px-2 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
              -{discountRate}%
            </span>
          )}
        </div>

        <div className="flex gap-3 pt-1">
          <Btn
            variant="primary"
            className="flex-1"
            onClick={() => onSave(stock, discountRate)}
          >
            Save Changes
          </Btn>

          <Btn
            variant="ghost"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Btn>
        </div>
      </div>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────
// Form Types
// ─────────────────────────────────────────────────────────────
type FormData = {
  name: string;
  description: string;
  price: string;
  discountRate: string;
  stock: string;
  category: string;
  status: "active" | "draft";
  tags: string;
  sku: string;

  images: Array<{
    base64: string;
    preview: string;
  }>;

  rating: string;
  ratingCount: string;
};

const EMPTY_IMAGES = Array.from({ length: 4 }, () => ({
  base64: "",
  preview: "",
}));

const EMPTY_FORM: FormData = {
  name: "",
  description: "",
  price: "",
  discountRate: "0",
  stock: "0",
  category: "",
  status: "active",
  tags: "",
  sku: "",
  images: EMPTY_IMAGES,
  rating: "0",
  ratingCount: "0",
};

// ─────────────────────────────────────────────────────────────
// Multi Image Uploader
// ─────────────────────────────────────────────────────────────
const MultiImageUploader = ({
  images,
  onChange,
}: {
  images: FormData["images"];
  onChange: (next: FormData["images"]) => void;
}) => {
  const fileRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleFile = (
    index: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (ev) => {
      const base64 = (ev.target?.result as string) ?? "";

      const next = [...images];

      next[index] = {
        base64,
        preview: base64,
      };

      onChange(next);
    };

    reader.readAsDataURL(file);
  };

  const clearSlot = (index: number) => {
    const next = [...images];

    next[index] = {
      base64: "",
      preview: "",
    };

    onChange(next);
  };

  return (
    <div>
      <FieldLabel>
        Product Images (up to 4) — slot 1 is the main image
      </FieldLabel>

      <div className="grid grid-cols-4 gap-2">
        {images.map((img, i) => (
          <div key={i} className="relative">
            <div
              onClick={() => fileRefs[i].current?.click()}
              className={`w-full aspect-square rounded-xl border-2 border-dashed cursor-pointer transition-colors overflow-hidden flex items-center justify-center bg-slate-50
                ${i === 0
                  ? "border-indigo-400/70 hover:border-indigo-500"
                  : "border-slate-200 hover:border-slate-300"
                }
                ${img.preview ? "p-0" : "p-2"}`}
            >
              {img.preview ? (
                <img
                  src={img.preview}
                  alt={`slot ${i + 1}`}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="text-center text-slate-400 text-xs">
                  <div className="text-xl">
                    {i === 0 ? "📸" : "+"}
                  </div>

                  <span className="font-medium">
                    {i === 0 ? "Main" : `#${i + 1}`}
                  </span>
                </div>
              )}
            </div>

            {img.preview && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearSlot(i);
                }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center shadow-md hover:bg-rose-600"
              >
                ✕
              </button>
            )}

            <input
              ref={fileRefs[i]}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(i, e)}
            />
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400 mt-1.5">
        Slot 1 (main) is used as the product thumbnail
        everywhere.
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Product Form Modal
// ─────────────────────────────────────────────────────────────
const ProductFormModal = ({
  product,
  categories,
  saving,
  onClose,
  onSubmit,
}: {
  product: IProduct | null;
  categories: { _id: string; name: string }[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<ProductInput>) => void;
}) => {
  const [form, setForm] = useState<FormData>(() =>
    product
      ? {
        name: product.name,
        description: product.description,
        price: String(product.price),
        discountRate: String(product.discountRate),
        stock: String(product.stock),

        category:
          typeof product.category === "string"
            ? product.category
            : product.category._id,

        status: product.status,
        tags: product.tags.join(", "),
        sku: product.sku,

        images: Array.from({ length: 4 }, (_, i) => ({
          base64: "",
          preview: product.images?.[i]?.url ?? "",
        })),

        rating: String(product.rating ?? 0),
        ratingCount: String(product.ratingCount ?? 0),
      }
      : {
        ...EMPTY_FORM,
        category: categories[0]?._id ?? "",
      }
  );

  const finalPrice = (() => {
    const p = parseFloat(form.price) || 0;
    const dr = parseFloat(form.discountRate) || 0;

    return dr > 0
      ? (p * (1 - dr / 100)).toFixed(2)
      : p.toFixed(2);
  })();

  const handleSubmit = () => {
    const payload: Partial<ProductInput> = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      discountRate:
        parseFloat(form.discountRate) || 0,
      stock: parseInt(form.stock, 10) || 0,
      category: form.category,
      status: form.status,

      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),

      sku: form.sku,

      rating: parseFloat(form.rating) || 0,
      ratingCount:
        parseInt(form.ratingCount, 10) || 0,
    };

    const imagesBase64 = form.images.map(
      (img) => img.base64 || null
    );

    if (imagesBase64.some(Boolean)) {
      (payload as any).imagesBase64 = imagesBase64;
    }

    onSubmit(payload);
  };

  return (
    <Modal
      title={
        product
          ? `Edit — ${product.name}`
          : "Add New Product"
      }
      onClose={onClose}
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <TextInput
          label="Product Name *"
          value={form.name}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              name: e.target.value,
            }))
          }
          placeholder="e.g. Wireless Earbuds"
        />

        <Textarea
          label="Description *"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              description: e.target.value,
            }))
          }
          placeholder="What is this product?"
        />

        <div className="grid grid-cols-2 gap-3">
          <TextInput
            label="Price ($) *"
            type="number"
            min={0}
            step="0.01"
            value={form.price}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                price: e.target.value,
              }))
            }
            placeholder="0.00"
          />

          <TextInput
            label="Stock *"
            type="number"
            min={0}
            value={form.stock}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                stock: e.target.value,
              }))
            }
            placeholder="0"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <TextInput
              label="Discount Rate (%)"
              type="number"
              min={0}
              max={100}
              value={form.discountRate}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  discountRate: e.target.value,
                }))
              }
              placeholder="0"
            />

            {parseFloat(form.discountRate) > 0 && (
              <p className="text-xs text-emerald-600 mt-1 font-semibold">
                Final price: ${finalPrice}
              </p>
            )}
          </div>

          <TextInput
            label="SKU"
            value={form.sku}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                sku: e.target.value,
              }))
            }
            placeholder="SKU-001"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SelectInput
            label="Category *"
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                category: e.target.value,
              }))
            }
          >
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </SelectInput>

          <SelectInput
            label="Status"
            value={form.status}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                status: e.target.value as
                  | "active"
                  | "draft",
              }))
            }
          >
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </SelectInput>
        </div>

        <TextInput
          label="Tags (comma-separated)"
          value={form.tags}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              tags: e.target.value,
            }))
          }
          placeholder="sale, new-arrival, top-rated"
        />

        <MultiImageUploader
          images={form.images}
          onChange={(imgs) =>
            setForm((f) => ({
              ...f,
              images: imgs,
            }))
          }
        />

        <div>
          <FieldLabel>
            Rating (admin override)
          </FieldLabel>

          <div className="flex items-center gap-3 flex-wrap">
            <StarRating
              value={parseFloat(form.rating) || 0}
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  rating: String(v),
                }))
              }
            />

            <span className="text-sm text-slate-500 font-semibold">
              {form.rating} / 5
            </span>

            <div className="w-24">
              <TextInput
                label=""
                type="number"
                min={0}
                step={1}
                value={form.ratingCount}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    ratingCount: e.target.value,
                  }))
                }
                placeholder="# reviews"
              />
            </div>

            <span className="text-xs text-slate-400">
              reviews
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-5 border-t border-slate-100 mt-5">
        <Btn
          variant="primary"
          className="flex-1"
          disabled={saving}
          onClick={handleSubmit}
        >
          {saving
            ? "Saving…"
            : product
              ? "Save Changes"
              : "Add Product"}
        </Btn>

        <Btn
          variant="ghost"
          className="flex-1"
          onClick={onClose}
        >
          Cancel
        </Btn>
      </div>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────────────────────
const StatusBadge = ({
  status,
}: {
  status: "active" | "draft";
}) =>
  status === "active" ? (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
      active
    </span>
  ) : (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-200">
      draft
    </span>
  );

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
export default function ProductsSection() {
  const dispatch = useDispatch<AppDispatch>();

  const {
    items: products,
    loading,
    saving,
    error,
  } = useSelector((s: RootState) => s.products);

  const categories = useSelector((s: RootState) => {
    const slice = (s as any).categories;
    if (!slice || !Array.isArray(slice.items)) return [] as { _id: string; name: string }[];
    return slice.items as { _id: string; name: string }[];
  });

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<"all" | "active" | "draft">(
      "all"
    );

  const [formTarget, setFormTarget] =
    useState<IProduct | null | "new">(null);

  const [quickEdit, setQuickEdit] =
    useState<IProduct | null>(null);

  const [confirmDel, setConfirmDel] =
    useState<IProduct | null>(null);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      p.sku
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "all" ||
      p.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const handleFormSubmit = (
    data: Partial<ProductInput>
  ) => {
    if (formTarget === "new") {
      toast
        .promise(
          dispatch(
            addProduct(data as ProductInput)
          ).unwrap(),
          {
            loading: "Adding product…",
            success:
              "Product added successfully! 🎉",
            error: (err) =>
              `Failed to add: ${err}`,
          }
        )
        .then(() => setFormTarget(null))
        .catch(() => { });
    } else if (formTarget) {
      toast
        .promise(
          dispatch(
            updateProduct({
              id: formTarget._id,
              data,
            })
          ).unwrap(),
          {
            loading: "Saving changes…",
            success: "Product updated! ✅",
            error: (err) =>
              `Failed to update: ${err}`,
          }
        )
        .then(() => setFormTarget(null))
        .catch(() => { });
    }
  };

  const handleQuickSave = (
    stock: number,
    discountRate: number
  ) => {
    if (!quickEdit) return;

    toast
      .promise(
        dispatch(
          patchProductInventory({
            id: quickEdit._id,
            stock,
            discountRate,
          })
        ).unwrap(),
        {
          loading:
            "Updating stock & discount…",
          success: "Inventory updated! ⚡",
          error: (err) =>
            `Failed to update: ${err}`,
        }
      )
      .then(() => setQuickEdit(null))
      .catch(() => { });
  };

  const handleDelete = () => {
    if (!confirmDel) return;

    const name = confirmDel.name;

    toast
      .promise(
        dispatch(
          deleteProduct(confirmDel._id)
        ).unwrap(),
        {
          loading: "Deleting product…",
          success: `"${name}" deleted successfully 🗑`,
          error: (err) =>
            `Failed to delete: ${err}`,
        }
      )
      .then(() => setConfirmDel(null))
      .catch(() => { });
  };

  return (
    <div className="max-w-6xl space-y-5">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,

          style: {
            background: "#ffffff",
            color: "#0f172a",
            border:
              "1px solid #e2e8f0",
            borderRadius: "12px",
            fontSize: "13px",
            fontWeight: 600,
            padding: "12px 16px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
          },

          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
          },

          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
          },

          loading: {
            iconTheme: {
              primary: "#4f46e5",
              secondary: "#ffffff",
            },
          },
        }}
      />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Manage Products
          </h2>

          <p className="text-xs text-slate-500 mt-0.5">
            {products.length} products listed
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-white">
            {(
              ["all", "active", "draft"] as const
            ).map((f) => (
              <button
                key={f}
                onClick={() =>
                  setStatusFilter(f)
                }
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${statusFilter === f
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-50 text-slate-500 hover:text-slate-900"
                  }`}
              >
                {f}
              </button>
            ))}
          </div>

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search name or SKU…"
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-48"
          />

          <Btn
            variant="primary"
            onClick={() => setFormTarget("new")}
          >
            + Add Product
          </Btn>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-semibold">
          ⚠ {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl h-56 bg-slate-100 border border-slate-200/60 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Product Grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const catName =
              typeof p.category === "string"
                ? p.category
                : p.category.name;

            const mainImage =
              p.images?.[0]?.url || p.imageUrl;

            return (
              <Card
                key={p._id}
                className="relative group flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                    {mainImage ? (
                      <img
                        src={mainImage}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl bg-slate-50">
                        📦
                      </div>
                    )}
                  </div>

                  <StatusBadge
                    status={p.status}
                  />
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-tight mb-0.5 line-clamp-1">
                  {p.name}
                </h3>

                <p className="text-xs text-slate-500 mb-1">
                  {catName}
                </p>

                {p.sku && (
                  <p className="text-xs text-slate-400 font-mono mb-2">
                    SKU: {p.sku}
                  </p>
                )}

                {/* Pricing */}
                <div className="flex items-center gap-2 mb-2">
                  {p.discountRate > 0 ? (
                    <>
                      <span className="text-lg font-black text-emerald-600">
                        $
                        {p.discountedPrice.toFixed(
                          2
                        )}
                      </span>

                      <span className="text-xs text-slate-400 line-through">
                        ${p.price.toFixed(2)}
                      </span>

                      <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                        -{p.discountRate}%
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-black text-slate-900">
                      ${p.price.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Rating */}
                {p.rating !== undefined && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <StarRating
                      value={Math.round(p.rating)}
                      readonly
                    />

                    <span className="text-xs text-slate-400 font-semibold">
                      {(p.rating || 0).toFixed(1)} ({p.ratingCount || 0})
                    </span>
                  </div>
                )}

                {/* Stock */}
                <div className="flex items-center gap-1.5 mb-4">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${p.stock === 0
                      ? "bg-rose-500"
                      : p.stock < 20
                        ? "bg-amber-400"
                        : "bg-emerald-500"
                      }`}
                  />

                  <span
                    className={`text-xs font-semibold ${p.stock === 0
                      ? "text-rose-600"
                      : p.stock < 20
                        ? "text-amber-600"
                        : "text-slate-500"
                      }`}
                  >
                    {p.stock === 0
                      ? "Out of stock"
                      : `${p.stock} in stock`}
                  </span>
                </div>

                {/* Tags */}
                {p.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {p.tags
                      .slice(0, 3)
                      .map((t) => (
                        <span
                          key={t}
                          className="text-xs px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100"
                        >
                          {t}
                        </span>
                      ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                  <Btn
                    variant="warning"
                    size="xs"
                    className="flex-1"
                    onClick={() =>
                      setQuickEdit(p)
                    }
                  >
                    ⚡ Quick Edit
                  </Btn>

                  <Btn
                    variant="ghost"
                    size="xs"
                    className="flex-1"
                    onClick={() =>
                      setFormTarget(p)
                    }
                  >
                    ✏ Edit
                  </Btn>

                  <Btn
                    variant="danger"
                    size="sm"
                    onClick={() =>
                      setConfirmDel(p)
                    }
                  >
                    🗑
                  </Btn>
                </div>
              </Card>
            );
          })}

          {/* Empty */}
          {filtered.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="text-5xl mb-4">
                📦
              </div>

              <p className="text-slate-400 font-semibold text-sm">
                No products found
              </p>

              <p className="text-slate-500 text-xs mt-1">
                Try adjusting the search or
                filters
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {formTarget !== null && (
        <ProductFormModal
          product={
            formTarget === "new"
              ? null
              : formTarget
          }
          categories={categories}
          saving={saving}
          onClose={() => setFormTarget(null)}
          onSubmit={handleFormSubmit}
        />
      )}

      {quickEdit && (
        <QuickEditModal
          product={quickEdit}
          onClose={() => setQuickEdit(null)}
          onSave={handleQuickSave}
        />
      )}

      {confirmDel && (
        <ConfirmModal
          name={confirmDel.name}
          onConfirm={handleDelete}
          onCancel={() =>
            setConfirmDel(null)
          }
        />
      )}
    </div>
  );
}

