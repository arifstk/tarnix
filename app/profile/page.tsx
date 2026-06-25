// // app/profile/page.tsx
// "use client";

// import { useSession } from "next-auth/react";
// import { useRef, useState, useEffect } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import toast from "react-hot-toast";
// import { useRouter } from "next/navigation";

// // ─── Types ────────────────────────────────────────────────────
// type Role = "user" | "admin" | "deliveryBoy";

// // ─── Helpers ──────────────────────────────────────────────────
// const avatarGradients: Record<string, string> = {
//   A: "from-violet-500 to-indigo-600",
//   B: "from-sky-500 to-blue-600",
//   C: "from-emerald-500 to-teal-600",
//   D: "from-amber-500 to-orange-600",
//   E: "from-rose-500 to-pink-600",
// };

// function getGradient(name: string) {
//   const gradients = Object.values(avatarGradients);
//   return gradients[name.charCodeAt(0) % gradients.length];
// }

// const roleConfig: Record<Role, { label: string; color: string }> = {
//   user: { label: "Customer", color: "bg-sky-100 text-sky-700 border-sky-200" },
//   admin: { label: "Admin", color: "bg-violet-100 text-violet-700 border-violet-200" },
//   deliveryBoy: { label: "Delivery Boy", color: "bg-amber-100 text-amber-700 border-amber-200" },
// };

// // ─── Reusable UI ──────────────────────────────────────────────
// const inputClass =
//   "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all disabled:bg-slate-50 disabled:text-slate-400";

// function SectionCard({
//   title,
//   subtitle,
//   children,
//   icon,
// }: {
//   title: string;
//   subtitle?: string;
//   children: React.ReactNode;
//   icon?: string;
// }) {
//   return (
//     <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
//       <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
//         {icon && (
//           <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-base">
//             {icon}
//           </div>
//         )}
//         <div>
//           <h2 className="text-sm font-bold text-slate-800">{title}</h2>
//           {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
//         </div>
//       </div>
//       <div className="px-6 py-5">{children}</div>
//     </div>
//   );
// }

// function PasswordInput({
//   value,
//   onChange,
//   placeholder,
// }: {
//   value: string;
//   onChange: (v: string) => void;
//   placeholder: string;
// }) {
//   const [show, setShow] = useState(false);
//   return (
//     <div className="relative">
//       <input
//         type={show ? "text" : "password"}
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         placeholder={placeholder}
//         className={`${inputClass} pr-11`}
//       />
//       <button
//         type="button"
//         onClick={() => setShow((v) => !v)}
//         className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
//       >
//         {show ? (
//           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
//           </svg>
//         ) : (
//           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//           </svg>
//         )}
//       </button>
//     </div>
//   );
// }

// // ─── Password strength ────────────────────────────────────────
// function PasswordStrength({ password }: { password: string }) {
//   if (!password) return null;
//   const rules = [
//     { label: "At least 8 characters", ok: password.length >= 8 },
//     { label: "One uppercase letter", ok: /[A-Z]/.test(password) },
//     { label: "One lowercase letter", ok: /[a-z]/.test(password) },
//     { label: "One number", ok: /[0-9]/.test(password) },
//   ];
//   const score = rules.filter((r) => r.ok).length;
//   const bar = ["bg-rose-400", "bg-amber-400", "bg-yellow-400", "bg-emerald-400"][score - 1] || "bg-slate-200";
//   return (
//     <div className="mt-2.5 space-y-2">
//       <div className="flex gap-1">
//         {[0, 1, 2, 3].map((i) => (
//           <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i < score ? bar : "bg-slate-200"}`} />
//         ))}
//       </div>
//       <div className="grid grid-cols-2 gap-1">
//         {rules.map((r) => (
//           <p key={r.label} className={`text-xs flex items-center gap-1 ${r.ok ? "text-emerald-600" : "text-slate-400"}`}>
//             <span>{r.ok ? "✓" : "○"}</span> {r.label}
//           </p>
//         ))}
//       </div>
//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════════════
// export default function ProfilePage() {
//   const { data: session, update, status } = useSession();
//   const router = useRouter();
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // ── Avatar ──
//   const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
//   const [avatarUploading, setAvatarUploading] = useState(false);

//   // ── Profile form ──
//   const [profile, setProfile] = useState({ name: "", email: "", mobile: "" });
//   const [profileSaving, setProfileSaving] = useState(false);

//   // ── Password form ──
//   const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
//   const [pwSaving, setPwSaving] = useState(false);

//   // ── Populate once session loads ──
//   useEffect(() => {
//     if (status === "authenticated" && session?.user) {
//       setProfile({
//         name: session.user.name ?? "",
//         email: session.user.email ?? "",
//         mobile: (session.user as any).mobile ?? "",
//       });
//       setAvatarSrc(session.user.image || null);
//     }
//   }, [status, session]);

//   if (status === "loading") {
//     return (
//       <div className="min-h-screen bg-slate-50 flex items-center justify-center">
//         <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
//       </div>
//     );
//   }

//   if (status === "unauthenticated") {
//     router.push("/login");
//     return null;
//   }

//   const user = session!.user as any;
//   const role = (user.role as Role) || "user";
//   const roleInfo = roleConfig[role];
//   const isGoogle = user.provider === "google" || (!user.password && !!user.image?.includes("google"));
//   const initial = (user.name?.[0] ?? "U").toUpperCase();
//   const gradient = getGradient(user.name ?? "U");

//   // ── Avatar upload ──
//   const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     if (file.size > 5 * 1024 * 1024) {
//       toast.error("Image must be under 5MB.");
//       return;
//     }

//     setAvatarSrc(URL.createObjectURL(file));
//     setAvatarUploading(true);
//     try {
//       const fd = new FormData();
//       fd.append("file", file);
//       const res = await fetch("/api/user/upload-avatar", { method: "POST", body: fd });
//       const data = await res.json();
//       if (data.success) {
//         setAvatarSrc(data.url);
//         await update({ image: data.url });
//         toast.success("Avatar updated!");
//       } else {
//         toast.error(data.error || "Upload failed.");
//         setAvatarSrc(user.image || null);
//       }
//     } catch {
//       toast.error("Upload failed.");
//       setAvatarSrc(user.image || null);
//     } finally {
//       setAvatarUploading(false);
//       if (fileInputRef.current) fileInputRef.current.value = "";
//     }
//   };

//   // ── Profile save ──
//   const handleProfileSave = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!profile.name.trim()) { toast.error("Name is required."); return; }
//     if (!profile.email.trim()) { toast.error("Email is required."); return; }

//     setProfileSaving(true);
//     try {
//       const res = await fetch("/api/user/update-profile", {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(profile),
//       });
//       const data = await res.json();
//       if (data.success) {
//         await update({ name: data.user.name, email: data.user.email });
//         toast.success("Profile updated!");
//       } else {
//         toast.error(data.error || "Failed to save.");
//       }
//     } catch {
//       toast.error("Something went wrong.");
//     } finally {
//       setProfileSaving(false);
//     }
//   };

//   // ── Password save ──
//   const handlePasswordSave = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (pw.newPassword !== pw.confirmPassword) {
//       toast.error("Passwords do not match.");
//       return;
//     }
//     if (pw.newPassword.length < 8) {
//       toast.error("Password must be at least 8 characters.");
//       return;
//     }

//     setPwSaving(true);
//     try {
//       const res = await fetch("/api/user/change-password", {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(pw),
//       });
//       const data = await res.json();
//       if (data.success) {
//         toast.success("Password changed!");
//         setPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
//       } else {
//         toast.error(data.error || "Failed to change password.");
//       }
//     } catch {
//       toast.error("Something went wrong.");
//     } finally {
//       setPwSaving(false);
//     }
//   };

//   // ── Dashboard link based on role ──
//   const dashboardLink =
//     role === "admin" ? "/admin/dashboard" :
//       role === "deliveryBoy" ? "/delivery/dashboard" : null;

//   return (
//     <main className="min-h-screen bg-slate-50 py-10 px-4">
//       <div className="max-w-2xl mx-auto space-y-5">

//         {/* ── Page header ── */}
//         <div className="flex items-center justify-between flex-wrap gap-3">
//           <div>
//             <h1 className="text-2xl font-black text-slate-800">My Profile</h1>
//             <p className="text-sm text-slate-400 mt-0.5">
//               Manage your account information and settings
//             </p>
//           </div>
//           {dashboardLink && (
//             <Link
//               href={dashboardLink}
//               className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
//             >
//               <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
//               </svg>
//               Dashboard
//             </Link>
//           )}
//         </div>

//         {/* ── Avatar + identity card ── */}
//         <SectionCard title="Profile Picture" subtitle="Click avatar to upload a new photo (max 5MB)" icon="📷">
//           <div className="flex items-center gap-5">

//             {/* Clickable avatar */}
//             <div className="relative group shrink-0">
//               <button
//                 type="button"
//                 onClick={() => fileInputRef.current?.click()}
//                 disabled={avatarUploading}
//                 className="relative w-20 h-20 rounded-full overflow-hidden focus:outline-none focus:ring-4 focus:ring-indigo-300 cursor-pointer"
//               >
//                 {avatarSrc ? (
//                   <Image
//                     src={avatarSrc}
//                     alt="Avatar"
//                     fill
//                     className="object-cover"
//                     referrerPolicy="no-referrer"
//                   />
//                 ) : (
//                   <div className={`w-full h-full bg-linear-to-br ${gradient} flex items-center justify-center text-white text-2xl font-black`}>
//                     {initial}
//                   </div>
//                 )}
//                 {/* Hover overlay */}
//                 <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
//                   {avatarUploading ? (
//                     <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
//                     </svg>
//                   ) : (
//                     <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
//                     </svg>
//                   )}
//                 </div>
//               </button>
//               <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
//             </div>

//             {/* Identity info */}
//             <div className="min-w-0">
//               <p className="font-bold text-slate-800 truncate">{user.name}</p>
//               <p className="text-sm text-slate-500 truncate">{user.email}</p>
//               <div className="flex flex-wrap gap-2 mt-2">
//                 <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${roleInfo.color}`}>
//                   {roleInfo.label}
//                 </span>
//                 {isGoogle && (
//                   <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
//                     🔵 Google Account
//                   </span>
//                 )}
//               </div>
//             </div>
//           </div>
//         </SectionCard>

//         {/* ── Account info ── */}
//         <SectionCard title="Account Information" subtitle="Read-only details about your account" icon="ℹ️">
//           <div className="grid grid-cols-2 gap-4">
//             {[
//               { label: "User ID", value: user.id, mono: true },
//               { label: "Sign-in", value: isGoogle ? "Google" : "Email & Password", mono: false },
//               { label: "Role", value: roleInfo.label, mono: false },
//               { label: "Email Verified", value: "Yes", mono: false },
//             ].map((item) => (
//               <div key={item.label}>
//                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
//                   {item.label}
//                 </p>
//                 <p className={`text-sm text-slate-700 ${item.mono ? "font-mono text-xs break-all" : "font-semibold"}`}>
//                   {item.value}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </SectionCard>

//         {/* ── Quick links based on role ── */}
//         {role === "user" && (
//           <SectionCard title="Quick Links" icon="🔗">
//             <div className="grid grid-cols-2 gap-3">
//               {[
//                 { label: "My Orders", href: "/my-orders", icon: "📦" },
//                 { label: "Shop Now", href: "/products", icon: "🛍" },
//                 { label: "Cart", href: "/cart", icon: "🛒" },
//                 { label: "Contact Us", href: "/contact", icon: "💬" },
//               ].map((link) => (
//                 <Link
//                   key={link.href}
//                   href={link.href}
//                   className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-all"
//                 >
//                   <span>{link.icon}</span>
//                   {link.label}
//                 </Link>
//               ))}
//             </div>
//           </SectionCard>
//         )}

//         {/* ── Edit profile ── */}
//         <SectionCard title="Edit Profile" subtitle="Update your name, email, and mobile number" icon="✏️">
//           <form onSubmit={handleProfileSave} className="space-y-4">
//             <div>
//               <label className="block text-xs font-bold text-slate-500 mb-1.5">
//                 Full Name <span className="text-rose-400">*</span>
//               </label>
//               <input
//                 type="text"
//                 value={profile.name}
//                 onChange={(e) => setProfile({ ...profile, name: e.target.value })}
//                 placeholder="Your full name"
//                 className={inputClass}
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-slate-500 mb-1.5">
//                 Email Address <span className="text-rose-400">*</span>
//               </label>
//               <input
//                 type="email"
//                 value={profile.email}
//                 onChange={(e) => setProfile({ ...profile, email: e.target.value })}
//                 placeholder="you@example.com"
//                 className={inputClass}
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-slate-500 mb-1.5">
//                 Mobile Number
//               </label>
//               <input
//                 type="tel"
//                 value={profile.mobile}
//                 onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
//                 placeholder="+880 1700-000000"
//                 className={inputClass}
//               />
//             </div>
//             <div className="flex justify-end pt-1">
//               <button
//                 type="submit"
//                 disabled={profileSaving}
//                 className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {profileSaving ? (
//                   <span className="flex items-center gap-2">
//                     <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
//                     </svg>
//                     Saving…
//                   </span>
//                 ) : "Save Changes"}
//               </button>
//             </div>
//           </form>
//         </SectionCard>

//         {/* ── Change password ── */}
//         {!isGoogle ? (
//           <SectionCard title="Change Password" subtitle="Use a strong password with uppercase, lowercase, and numbers" icon="🔒">
//             <form onSubmit={handlePasswordSave} className="space-y-4">
//               <div>
//                 <label className="block text-xs font-bold text-slate-500 mb-1.5">
//                   Current Password
//                 </label>
//                 <PasswordInput
//                   value={pw.currentPassword}
//                   onChange={(v) => setPw({ ...pw, currentPassword: v })}
//                   placeholder="Enter current password"
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-bold text-slate-500 mb-1.5">
//                   New Password
//                 </label>
//                 <PasswordInput
//                   value={pw.newPassword}
//                   onChange={(v) => setPw({ ...pw, newPassword: v })}
//                   placeholder="At least 8 characters"
//                 />
//                 <PasswordStrength password={pw.newPassword} />
//               </div>
//               <div>
//                 <label className="block text-xs font-bold text-slate-500 mb-1.5">
//                   Confirm New Password
//                 </label>
//                 <PasswordInput
//                   value={pw.confirmPassword}
//                   onChange={(v) => setPw({ ...pw, confirmPassword: v })}
//                   placeholder="Re-enter new password"
//                 />
//                 {pw.confirmPassword && (
//                   <p className={`text-xs mt-1.5 font-semibold ${pw.newPassword === pw.confirmPassword ? "text-emerald-600" : "text-rose-500"}`}>
//                     {pw.newPassword === pw.confirmPassword ? "✓ Passwords match" : "✕ Passwords do not match"}
//                   </p>
//                 )}
//               </div>

//               <div className="flex justify-end pt-1">
//                 <button
//                   type="submit"
//                   disabled={pwSaving || !pw.currentPassword || pw.newPassword !== pw.confirmPassword}
//                   className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {pwSaving ? (
//                     <span className="flex items-center gap-2">
//                       <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
//                       </svg>
//                       Changing…
//                     </span>
//                   ) : "Change Password"}
//                 </button>
//               </div>
//             </form>
//           </SectionCard>
//         ) : (
//           <SectionCard title="Change Password" icon="🔒">
//             <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
//               <span className="text-xl shrink-0">ℹ️</span>
//               <p className="text-sm text-slate-600">
//                 You signed in with Google. To change your password, visit your{" "}

//                 href="https://myaccount.google.com/security"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-indigo-600 hover:underline font-semibold"
//                 >
//                 Google Account settings
//               </a>
//               .
//             </p>
//           </div>
//           </SectionCard>
//         )}

//       {/* ── Danger zone ── */}
//       <SectionCard title="Account" icon="⚙️">
//         <div className="flex items-center justify-between flex-wrap gap-3">
//           <div>
//             <p className="text-sm font-semibold text-slate-700">Sign out of your account</p>
//             <p className="text-xs text-slate-400 mt-0.5">You will be redirected to the login page</p>
//           </div>
//           <Link
//             href="/api/auth/signout"
//             className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-sm font-bold transition-all"
//           >
//             Sign Out
//           </Link>
//         </div>
//       </SectionCard>

//     </div>
//     </main >
//   );
// }





// app/profile/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────
type Role = "user" | "admin" | "deliveryBoy";

// ─── Helpers ──────────────────────────────────────────────────
const avatarGradients: Record<string, string> = {
  A: "from-violet-500 to-indigo-600",
  B: "from-sky-500 to-blue-600",
  C: "from-emerald-500 to-teal-600",
  D: "from-amber-500 to-orange-600",
  E: "from-rose-500 to-pink-600",
};

function getGradient(name: string) {
  const gradients = Object.values(avatarGradients);
  return gradients[name.charCodeAt(0) % gradients.length];
}

const roleConfig: Record<Role, { label: string; color: string }> = {
  user: { label: "Customer", color: "bg-sky-100 text-sky-700 border-sky-200" },
  admin: { label: "Admin", color: "bg-violet-100 text-violet-700 border-violet-200" },
  deliveryBoy: { label: "Delivery Boy", color: "bg-amber-100 text-amber-700 border-amber-200" },
};

// ─── Reusable UI ──────────────────────────────────────────────
const inputClass =
  "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all disabled:bg-slate-50 disabled:text-slate-400";

function SectionCard({
  title,
  subtitle,
  children,
  icon,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  icon?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-base">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-sm font-bold text-slate-800">{title}</h2>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputClass} pr-11`}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
      >
        {show ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
    </div>
  );
}

// ─── Password strength ────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const rules = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "One uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "One lowercase letter", ok: /[a-z]/.test(password) },
    { label: "One number", ok: /[0-9]/.test(password) },
  ];
  const score = rules.filter((r) => r.ok).length;
  const bar = ["bg-rose-400", "bg-amber-400", "bg-yellow-400", "bg-emerald-400"][score - 1] || "bg-slate-200";
  return (
    <div className="mt-2.5 space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i < score ? bar : "bg-slate-200"}`} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1">
        {rules.map((r) => (
          <p key={r.label} className={`text-xs flex items-center gap-1 ${r.ok ? "text-emerald-600" : "text-slate-400"}`}>
            <span>{r.ok ? "✓" : "○"}</span> {r.label}
          </p>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
export default function ProfilePage() {
  const { data: session, update, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Avatar ──
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // ── Profile form ──
  const [profile, setProfile] = useState({ name: "", email: "", mobile: "" });
  const [profileSaving, setProfileSaving] = useState(false);

  // ── Password form ──
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwSaving, setPwSaving] = useState(false);

  // ── Redirect hook ──
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // ── Populate once session loads ──
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setProfile({
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        mobile: (session.user as any).mobile ?? "",
      });
      setAvatarSrc(session.user.image || null);
    }
  }, [status, session]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const user = session!.user as any;
  const role = (user.role as Role) || "user";
  const roleInfo = roleConfig[role];
  const isGoogle = user.provider === "google" || (!user.password && !!user.image?.includes("google"));
  const initial = (user.name?.[0] ?? "U").toUpperCase();
  const gradient = getGradient(user.name ?? "U");

  // ── Avatar upload ──
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.");
      return;
    }

    setAvatarSrc(URL.createObjectURL(file));
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/user/upload-avatar", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        setAvatarSrc(data.url);
        await update({ image: data.url });
        toast.success("Avatar updated!");
      } else {
        toast.error(data.error || "Upload failed.");
        setAvatarSrc(user.image || null);
      }
    } catch {
      toast.error("Upload failed.");
      setAvatarSrc(user.image || null);
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── Profile save ──
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name.trim()) { toast.error("Name is required."); return; }
    if (!profile.email.trim()) { toast.error("Email is required."); return; }

    setProfileSaving(true);
    try {
      const res = await fetch("/api/user/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (data.success) {
        await update({ name: data.user.name, email: data.user.email });
        toast.success("Profile updated!");
      } else {
        toast.error(data.error || "Failed to save.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setProfileSaving(false);
    }
  };

  // ── Password save ──
  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (pw.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setPwSaving(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pw),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Password changed!");
        setPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(data.error || "Failed to change password.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setPwSaving(false);
    }
  };

  // ── Dashboard link based on role ──
  const dashboardLink =
    role === "admin" ? "/admin/dashboard" :
      role === "deliveryBoy" ? "/delivery/dashboard" : null;

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-800">My Profile</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Manage your account information and settings
            </p>
          </div>
          {dashboardLink && (
            <Link
              href={dashboardLink}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              Dashboard
            </Link>
          )}
        </div>

        {/* ── Avatar + identity card ── */}
        <SectionCard title="Profile Picture" subtitle="Click avatar to upload a new photo (max 5MB)" icon="📷">
          <div className="flex items-center gap-5">

            {/* Clickable avatar */}
            <div className="relative group shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="relative w-20 h-20 rounded-full overflow-hidden focus:outline-none focus:ring-4 focus:ring-indigo-300 cursor-pointer"
              >
                {avatarSrc ? (
                  <Image
                    src={avatarSrc}
                    alt="Avatar"
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className={`w-full h-full bg-linear-to-br ${gradient} flex items-center justify-center text-white text-2xl font-black`}>
                    {initial}
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  {avatarUploading ? (
                    <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </div>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            {/* Identity info */}
            <div className="min-w-0">
              <p className="font-bold text-slate-800 truncate">{user.name}</p>
              <p className="text-sm text-slate-500 truncate">{user.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${roleInfo.color}`}>
                  {roleInfo.label}
                </span>
                {isGoogle && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                    🔵 Google Account
                  </span>
                )}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── Account info ── */}
        <SectionCard title="Account Information" subtitle="Read-only details about your account" icon="ℹ️">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "User ID", value: user.id, mono: true },
              { label: "Sign-in", value: isGoogle ? "Google" : "Email & Password", mono: false },
              { label: "Role", value: roleInfo.label, mono: false },
              { label: "Email Verified", value: "Yes", mono: false },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {item.label}
                </p>
                <p className={`text-sm text-slate-700 ${item.mono ? "font-mono text-xs break-all" : "font-semibold"}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── Quick links based on role ── */}
        {role === "user" && (
          <SectionCard title="Quick Links" icon="🔗">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "My Orders", href: "/my-orders", icon: "📦" },
                { label: "Shop Now", href: "/products", icon: "🛍" },
                { label: "Cart", href: "/cart", icon: "🛒" },
                { label: "Contact Us", href: "/contact", icon: "💬" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-all"
                >
                  <span>{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ── Edit profile ── */}
        <SectionCard title="Edit Profile" subtitle="Update your name, email, and mobile number" icon="✏️">
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Your full name"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">
                Email Address <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">
                Mobile Number
              </label>
              <input
                type="text"
                value={profile.mobile}
                onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                placeholder="+880 1700-000000"
                className={inputClass}
              />
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={profileSaving}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {profileSaving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Saving…
                  </span>
                ) : "Save Changes"}
              </button>
            </div>
          </form>
        </SectionCard>

        {/* ── Change password ── */}
        {!isGoogle ? (
          <SectionCard title="Change Password" subtitle="Use a strong password with uppercase, lowercase, and numbers" icon="🔒">
            <form onSubmit={handlePasswordSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  Current Password
                </label>
                <PasswordInput
                  value={pw.currentPassword}
                  onChange={(v) => setPw({ ...pw, currentPassword: v })}
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  New Password
                </label>
                <PasswordInput
                  value={pw.newPassword}
                  onChange={(v) => setPw({ ...pw, newPassword: v })}
                  placeholder="At least 8 characters"
                />
                <PasswordStrength password={pw.newPassword} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  Confirm New Password
                </label>
                <PasswordInput
                  value={pw.confirmPassword}
                  onChange={(v) => setPw({ ...pw, confirmPassword: v })}
                  placeholder="Re-enter new password"
                />
                {pw.confirmPassword && (
                  <p className={`text-xs mt-1.5 font-semibold ${pw.newPassword === pw.confirmPassword ? "text-emerald-600" : "text-rose-500"}`}>
                    {pw.newPassword === pw.confirmPassword ? "✓ Passwords match" : "✕ Passwords do not match"}
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={pwSaving || !pw.currentPassword || pw.newPassword !== pw.confirmPassword}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {pwSaving ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Changing…
                    </span>
                  ) : "Change Password"}
                </button>
              </div>
            </form>
          </SectionCard>
        ) : (
          <SectionCard title="Change Password" icon="🔒">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xl shrink-0">ℹ️</span>
              <p className="text-sm text-slate-600">
                You signed in with Google. To change your password, visit your{" "}
                <a
                  href="https://myaccount.google.com/security"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline font-semibold"
                >
                  Google Account settings
                </a>
                .
              </p>
            </div>
          </SectionCard>
        )}

        {/* ── Danger zone ── */}
        <SectionCard title="Account" icon="⚙️">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-700">Sign out of your account</p>
              <p className="text-xs text-slate-400 mt-0.5">You will be redirected to the login page</p>
            </div>
            <Link
              href="/api/auth/signout"
              className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-sm font-bold transition-all"
            >
              Sign Out
            </Link>
          </div>
        </SectionCard>

      </div>
    </main>
  );
}