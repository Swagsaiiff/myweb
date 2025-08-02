import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function OrderHistory() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  
  const { data: orders, isLoading: ordersLoading, error } = useQuery({
    queryKey: ['/api/orders'],
    retry: false,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading || ordersLoading) {
    return (
      <section id="orders" className="py-16 bg-[hsl(var(--gaming-dark))]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Order History</h2>
          <div className="text-center text-gray-400">Loading order history...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="orders" className="py-16 bg-[hsl(var(--gaming-dark))]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">Order History</h2>
        <Card className="gaming-card">
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[hsl(var(--gaming-accent))]">
                    <th className="pb-3 text-gray-400">Order ID</th>
                    <th className="pb-3 text-gray-400">Game</th>
                    <th className="pb-3 text-gray-400">Package</th>
                    <th className="pb-3 text-gray-400">UID</th>
                    <th className="pb-3 text-gray-400">Amount</th>
                    <th className="pb-3 text-gray-400">Status</th>
                    <th className="pb-3 text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {!orders || orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-400">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    orders.map((order: any) => (
                      <tr key={order.id} className="border-b border-[hsl(var(--gaming-accent))]/30">
                        <td className="py-3 font-mono text-sm">#{order.id.slice(-8)}</td>
                        <td className="py-3">{order.gameName}</td>
                        <td className="py-3">{order.packageName}</td>
                        <td className="py-3">{order.gameUid}</td>
                        <td className="py-3 text-[hsl(var(--gaming-success))] font-bold">৳{order.amount}</td>
                        <td className="py-3">{getStatusBadge(order.status)}</td>
                        <td className="py-3 text-gray-400">{formatDate(order.createdAt)}</td>
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
