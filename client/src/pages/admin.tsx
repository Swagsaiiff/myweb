import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import AdminSidebar from "@/components/admin-sidebar";
import AdminStats from "@/components/admin-stats";
import AdminOrders from "@/components/admin-orders";
import AdminMoneyRequests from "@/components/admin-money-requests";
import { useState } from "react";

export default function Admin() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      toast({
        title: "Unauthorized",
        description: "Admin access required. Redirecting...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--gaming-dark))] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--gaming-dark))]">
      {/* Header */}
      <nav className="bg-[hsl(var(--gaming-blue))] shadow-lg border-b border-[hsl(var(--gaming-accent))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <i className="fas fa-gamepad text-[hsl(var(--gaming-bright))] text-2xl mr-2"></i>
                <span className="text-xl font-bold text-white">GameTopup+ Admin</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user?.profileImageUrl && (
                <img 
                  src={user.profileImageUrl} 
                  alt="Admin Profile" 
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <span className="text-sm text-gray-300">{user?.email}</span>
              <button 
                onClick={() => window.location.href = '/api/logout'}
                className="text-gray-300 hover:text-white"
              >
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="flex-1 p-8">
          {activeTab === "dashboard" && <AdminStats />}
          {activeTab === "orders" && <AdminOrders />}
          {activeTab === "money-requests" && <AdminMoneyRequests />}
        </div>
      </div>
    </div>
  );
}
