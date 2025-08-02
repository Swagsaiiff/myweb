import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function WalletSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const addMoneyMutation = useMutation({
    mutationFn: async (data: { amount: string; senderNumber: string; transactionId: string }) => {
      await apiRequest("POST", "/api/add-money-requests", data);
    },
    onSuccess: () => {
      toast({
        title: "Request Submitted",
        description: "Your add money request has been submitted and is pending approval.",
      });
      setAmount("");
      setSenderNumber("");
      setTransactionId("");
      queryClient.invalidateQueries({ queryKey: ['/api/add-money-requests'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Request Failed",
        description: error.message || "Failed to submit add money request",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !senderNumber || !transactionId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(amount) < 10) {
      toast({
        title: "Invalid Amount",
        description: "Minimum amount is ৳10",
        variant: "destructive",
      });
      return;
    }

    addMoneyMutation.mutate({
      amount,
      senderNumber,
      transactionId,
    });
  };

  return (
    <section id="wallet" className="py-16 bg-[hsl(var(--gaming-blue))]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">Wallet Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Current Balance */}
          <Card className="gaming-card">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <i className="fas fa-wallet text-[hsl(var(--gaming-success))] mr-2"></i>
                Current Balance
              </h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-[hsl(var(--gaming-success))] mb-2">
                  ৳{user?.balance || "0"}
                </div>
                <p className="text-gray-400">Available for top-ups</p>
              </div>
            </CardContent>
          </Card>

          {/* Add Money Form */}
          <Card className="gaming-card">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <i className="fas fa-plus text-[hsl(var(--gaming-bright))] mr-2"></i>
                Add Money
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="10"
                    required
                    className="bg-[hsl(var(--gaming-blue))] border-[hsl(var(--gaming-accent))]"
                  />
                </div>
                <div>
                  <Label htmlFor="senderNumber">Sender Number</Label>
                  <Input
                    id="senderNumber"
                    type="tel"
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    placeholder="01xxxxxxxxx"
                    required
                    className="bg-[hsl(var(--gaming-blue))] border-[hsl(var(--gaming-accent))]"
                  />
                </div>
                <div>
                  <Label htmlFor="transactionId">Transaction ID</Label>
                  <Input
                    id="transactionId"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter transaction ID"
                    required
                    className="bg-[hsl(var(--gaming-blue))] border-[hsl(var(--gaming-accent))]"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={addMoneyMutation.isPending}
                  className="w-full gaming-button font-bold py-3"
                >
                  {addMoneyMutation.isPending ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
