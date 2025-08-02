import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function AdminOrders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: orders, isLoading } = useQuery({
    queryKey: ['/api/admin/orders'],
    retry: false,
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      await apiRequest("PATCH", `/api/admin/orders/${orderId}`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Order Updated",
        description: "Order status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      });
    },
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCompleteOrder = (orderId: string) => {
    updateOrderMutation.mutate({ orderId, status: 'completed' });
  };

  const handleCancelOrder = (orderId: string) => {
    updateOrderMutation.mutate({ orderId, status: 'cancelled' });
  };

  if (isLoading) {
    return (
      <div className="text-center text-gray-400">Loading orders...</div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-white">Orders Management</h1>
      
      <Card className="gaming-card">
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[hsl(var(--gaming-accent))]">
                  <th className="pb-3 text-gray-400">Order ID</th>
                  <th className="pb-3 text-gray-400">User</th>
                  <th className="pb-3 text-gray-400">Game</th>
                  <th className="pb-3 text-gray-400">Package</th>
                  <th className="pb-3 text-gray-400">UID</th>
                  <th className="pb-3 text-gray-400">Amount</th>
                  <th className="pb-3 text-gray-400">Status</th>
                  <th className="pb-3 text-gray-400">Date</th>
                  <th className="pb-3 text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!orders || orders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-400">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order: any) => (
                    <tr key={order.id} className="border-b border-[hsl(var(--gaming-accent))]/30">
                      <td className="py-3 font-mono text-sm">#{order.id.slice(-8)}</td>
                      <td className="py-3">{order.userEmail}</td>
                      <td className="py-3">{order.gameName}</td>
                      <td className="py-3">{order.packageName}</td>
                      <td className="py-3">{order.gameUid}</td>
                      <td className="py-3 text-[hsl(var(--gaming-success))] font-bold">৳{order.amount}</td>
                      <td className="py-3">{getStatusBadge(order.status)}</td>
                      <td className="py-3 text-gray-400 text-sm">{formatDate(order.createdAt)}</td>
                      <td className="py-3">
                        {order.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleCompleteOrder(order.id)}
                              disabled={updateOrderMutation.isPending}
                              className="gaming-success text-xs"
                            >
                              Complete
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleCancelOrder(order.id)}
                              disabled={updateOrderMutation.isPending}
                              className="gaming-error text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
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
  );
}
