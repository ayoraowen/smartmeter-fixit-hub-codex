import { NavLink } from "react-router-dom";
import { Home, Book, AlertCircle, Grid3X3, Users, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/directory", label: "Meter Directory", icon: Grid3X3 },
  { to: "/behaviors", label: "Behaviour Guides", icon: Activity },
  { to: "/error-codes", label: "Error Codes", icon: AlertCircle },
  { to: "/guides", label: "Troubleshooting Guides", icon: Book },
  // { to: "/community", label: "Community", icon: Users },
];

export function Navigation() {
  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex space-x-8">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-2 py-4 px-2 border-b-2 border-transparent text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground hover:border-muted"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}