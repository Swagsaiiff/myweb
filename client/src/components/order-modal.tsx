import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface OrderModalProps {
  game: {
    id: string;
    displayName: string;
  };
  package: {
    id: string;
    name: string;
    price: string;
  };
  onClose: () => void;
}

export default function OrderModal({ game, package: pkg, onClose }: OrderModalProps) {
  const [gameUid, setGameUid] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createOrderMutation = useMutation({
    mutationFn: async (data: { gameId: string; packageId: string; gameUid: string }) => {
      await apiRequest("POST", "/api/orders", data);
    },
    onSuccess: () => {
      toast({
        title: "Order Placed Successfully",
        description: "Your order has been placed and is being processed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      onClose();
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
        title: "Order Failed",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameUid.trim()) {
      toast({
        title: "Invalid UID",
        description: "Please enter your game UID",
        variant: "destructive",
      });
      return;
    }

    createOrderMutation.mutate({
      gameId: game.id,
      packageId: pkg.id,
      gameUid: gameUid.trim(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[hsl(var(--gaming-blue))] rounded-xl p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Place Order</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="game">Game</Label>
            <Input
              id="game"
              value={game.displayName}
              readOnly
              className="bg-[hsl(var(--gaming-dark))] border-[hsl(var(--gaming-accent))]"
            />
          </div>
          
          <div>
            <Label htmlFor="package">Package</Label>
            <Input
              id="package"
              value={`${pkg.name} - ৳${pkg.price}`}
              readOnly
              className="bg-[hsl(var(--gaming-dark))] border-[hsl(var(--gaming-accent))]"
            />
          </div>
          
          <div>
            <Label htmlFor="gameUid">Game UID</Label>
            <Input
              id="gameUid"
              value={gameUid}
              onChange={(e) => setGameUid(e.target.value)}
              placeholder="Enter your game UID"
              required
              className="bg-[hsl(var(--gaming-dark))] border-[hsl(var(--gaming-accent))]"
            />
          </div>
          
          <div className="flex justify-between items-center bg-[hsl(var(--gaming-dark))] p-4 rounded-lg">
            <span>Total Amount:</span>
            <span className="text-[hsl(var(--gaming-success))] font-bold text-xl">৳{pkg.price}</span>
          </div>
          
          <Button
            type="submit"
            disabled={createOrderMutation.isPending}
            className="w-full gaming-success font-bold py-3"
          >
            {createOrderMutation.isPending ? "Placing Order..." : "Place Order"}
          </Button>
        </form>
      </div>
    </div>
  );
}
