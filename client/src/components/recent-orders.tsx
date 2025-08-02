import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RecentOrders() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['/api/orders/recent'],
    retry: false,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="gaming-success">Complete</Badge>;
      case 'pending':
        return <Badge className="gaming-warning">Pending</Badge>;
      case 'cancelled':
        return <Badge className="gaming-error">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hr ago`;
    return `${Math.floor(diffInMinutes / 1440)} day ago`;
  };

  const maskEmail = (email: string) => {
    if (!email) return "Anonymous";
    const [name, domain] = email.split('@');
    return `${name.slice(0, 3)}***@${domain}`;
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-[hsl(var(--gaming-blue))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Recent Orders</h2>
          <div className="text-center text-gray-400">Loading recent orders...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-[hsl(var(--gaming-blue))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">Recent Orders</h2>
        <Card className="gaming-card">
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[hsl(var(--gaming-accent))]">
                    <th className="pb-3 text-gray-400">User</th>
                    <th className="pb-3 text-gray-400">Game</th>
                    <th className="pb-3 text-gray-400">Package</th>
                    <th className="pb-3 text-gray-400">Status</th>
                    <th className="pb-3 text-gray-400">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {orders?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400">
                        No recent orders found
                      </td>
                    </tr>
                  ) : (
                    orders?.map((order: any) => (
                      <tr key={order.id} className="border-b border-[hsl(var(--gaming-accent))]/30">
                        <td className="py-3">
                          <span>{maskEmail(order.userEmail)}</span>
                        </td>
                        <td className="py-3">{order.gameName}</td>
                        <td className="py-3">{order.packageName}</td>
                        <td className="py-3">{getStatusBadge(order.status)}</td>
                        <td className="py-3 text-gray-400">
                          {formatTimeAgo(order.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
