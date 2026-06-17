"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/hot-deals", label: "Hot Deals" },
  { href: "/about", label: "About Us" },
];

type UserNavProps = {
  role: "user" | "admin" | "deliveryBoy" | null;
}

const UserNav = ({ role }: UserNavProps) => {
  const pathname = usePathname();
  if (role === "admin" || role === "deliveryBoy") return null;

  return (
    <nav className="hidden md:flex items-center gap-6">
      {NAV_LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`relative group text-sm text-gray-800 font-medium transition-colors duration-200 py-1 ${active ? "text-blue-500" : "hover:text-gray-800"
              }`}
          >
            {link.label}
            {link.label === "Hot Deals" && (
              <span className="absolute -top-2 -right-3 text-xs bg-rose-500 text-white px-1 rounded-full tracking-tighter">
                HOT
              </span>
            )}
            <span className={`absolute -bottom-0.5 right-1/2 h-0.5 bg-indigo-400 transition-all duration-300 ease-out ${active ? "w-1/2" : "w-0 group-hover:w-1/2"}`} />
            <span className={`absolute -bottom-0.5 left-1/2 h-0.5 bg-indigo-400 transition-all duration-300 ease-out ${active ? "w-1/2" : "w-0 group-hover:w-1/2"}`} />
          </Link>
        );
      })}
    </nav>
  );
};

export default UserNav;