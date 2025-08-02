import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function AdminMoneyRequests() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: requests, isLoading } = useQuery({
    queryKey: ['/api/admin/add-money-requests'],
    retry: false,
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: string }) => {
      await apiRequest("PATCH", `/api/admin/add-money-requests/${requestId}`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Request Updated",
        description: "Add money request has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/add-money-requests'] });
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
        description: error.message || "Failed to update request status",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="gaming-success">Approved</Badge>;
      case 'pending':
        return <Badge className="gaming-warning">Pending</Badge>;
      case 'rejected':
        return <Badge className="gaming-error">Rejected</Badge>;
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

  const handleApproveRequest = (requestId: string) => {
    updateRequestMutation.mutate({ requestId, status: 'approved' });
  };

  const handleRejectRequest = (requestId: string) => {
    updateRequestMutation.mutate({ requestId, status: 'rejected' });
  };

  if (isLoading) {
    return (
      <div className="text-center text-gray-400">Loading add money requests...</div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-white">Add Money Requests</h1>
      
      <Card className="gaming-card">
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[hsl(var(--gaming-accent))]">
                  <th className="pb-3 text-gray-400">Request ID</th>
                  <th className="pb-3 text-gray-400">User</th>
                  <th className="pb-3 text-gray-400">Amount</th>
                  <th className="pb-3 text-gray-400">Sender Number</th>
                  <th className="pb-3 text-gray-400">Transaction ID</th>
                  <th className="pb-3 text-gray-400">Status</th>
                  <th className="pb-3 text-gray-400">Date</th>
                  <th className="pb-3 text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!requests || requests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      No add money requests found
                    </td>
                  </tr>
                ) : (
                  requests.map((request: any) => (
                    <tr key={request.id} className="border-b border-[hsl(var(--gaming-accent))]/30">
                      <td className="py-3 font-mono text-sm">#{request.id.slice(-8)}</td>
                      <td className="py-3">{request.userEmail}</td>
                      <td className="py-3 text-[hsl(var(--gaming-success))] font-bold">৳{request.amount}</td>
                      <td className="py-3">{request.senderNumber}</td>
                      <td className="py-3 font-mono text-sm">{request.transactionId}</td>
                      <td className="py-3">{getStatusBadge(request.status)}</td>
                      <td className="py-3 text-gray-400 text-sm">{formatDate(request.createdAt)}</td>
                      <td className="py-3">
                        {request.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveRequest(request.id)}
                              disabled={updateRequestMutation.isPending}
                              className="gaming-success text-xs"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleRejectRequest(request.id)}
                              disabled={updateRequestMutation.isPending}
                              className="gaming-error text-xs"
                            >
                              Reject
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
