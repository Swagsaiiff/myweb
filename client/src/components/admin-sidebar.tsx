interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  const menuItems = [
    { id: "dashboard", icon: "fas fa-tachometer-alt", label: "Dashboard" },
    { id: "orders", icon: "fas fa-shopping-cart", label: "Orders" },
    { id: "money-requests", icon: "fas fa-money-bill-wave", label: "Add Money Requests" },
    { id: "analytics", icon: "fas fa-chart-bar", label: "Analytics" },
    { id: "packages", icon: "fas fa-box", label: "Manage Packages" },
    { id: "games", icon: "fas fa-gamepad", label: "Manage Games" },
    { id: "settings", icon: "fas fa-cog", label: "Settings" },
  ];

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <div className="w-64 bg-[hsl(var(--gaming-blue))] min-h-screen p-6">
      <div className="space-y-4">
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
              activeTab === item.id
                ? "text-[hsl(var(--gaming-bright))] bg-[hsl(var(--gaming-accent))]"
                : "text-gray-300 hover:text-white hover:bg-[hsl(var(--gaming-accent))]"
            }`}
          >
            <i className={item.icon}></i>
            <span className="font-medium">{item.label}</span>
          </div>
        ))}
        
        <div className="pt-4 border-t border-[hsl(var(--gaming-accent))]">
          <div
            onClick={handleLogout}
            className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer text-gray-300 hover:text-white hover:bg-[hsl(var(--gaming-error))] transition-colors"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span className="font-medium">Logout</span>
          </div>
        </div>
      </div>
    </div>
  );
}
