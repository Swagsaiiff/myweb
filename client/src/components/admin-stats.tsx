import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="text-center text-gray-400">Loading statistics...</div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-white">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="gaming-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-white">{stats?.totalOrders || 0}</p>
              </div>
              <i className="fas fa-shopping-cart text-[hsl(var(--gaming-bright))] text-2xl"></i>
            </div>
          </CardContent>
        </Card>
        
        <Card className="gaming-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Revenue</p>
                <p className="text-2xl font-bold text-white">৳{stats?.totalRevenue || "0"}</p>
              </div>
              <i className="fas fa-dollar-sign text-[hsl(var(--gaming-success))] text-2xl"></i>
            </div>
          </CardContent>
        </Card>
        
        <Card className="gaming-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Users</p>
                <p className="text-2xl font-bold text-white">{stats?.activeUsers || 0}</p>
              </div>
              <i className="fas fa-users text-[hsl(var(--gaming-warning))] text-2xl"></i>
            </div>
          </CardContent>
        </Card>
        
        <Card className="gaming-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Orders</p>
                <p className="text-2xl font-bold text-white">{stats?.pendingOrders || 0}</p>
              </div>
              <i className="fas fa-clock text-[hsl(var(--gaming-error))] text-2xl"></i>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Welcome Message */}
      <Card className="gaming-card">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4 text-white">Welcome to Admin Dashboard</h2>
          <p className="text-gray-400">
            Use the sidebar to navigate through different sections. You can manage orders, 
            approve add money requests, view analytics, and configure games and packages.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
