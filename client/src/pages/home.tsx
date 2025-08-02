import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import GameCard from "@/components/game-card";
import RecentOrders from "@/components/recent-orders";
import WalletSection from "@/components/wallet-section";
import OrderHistory from "@/components/order-history";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  const { data: games } = useQuery({
    queryKey: ['/api/games'],
    retry: false,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--gaming-dark))] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--gaming-dark))] text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="gaming-gradient py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Top-up Your <span className="text-[hsl(var(--gaming-success))]">Gaming</span> Experience
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Fast, secure, and reliable game currency top-ups for all your favorite games
          </p>
          <div className="flex justify-center space-x-4">
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <i className="fas fa-wallet text-[hsl(var(--gaming-success))]"></i>
                <span className="text-sm text-gray-300">Balance:</span>
                <span className="font-bold text-[hsl(var(--gaming-success))]">
                  ৳{user?.balance || "0"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-16 bg-[hsl(var(--gaming-dark))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Choose Your Game</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {games?.map((game: any) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      </section>

      {/* Recent Orders */}
      <RecentOrders />

      {/* Wallet Section */}
      <WalletSection />

      {/* Order History */}
      <OrderHistory />

      {/* Footer */}
      <footer className="bg-[hsl(var(--gaming-blue))] border-t border-[hsl(var(--gaming-accent))] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <i className="fas fa-gamepad text-[hsl(var(--gaming-bright))] text-2xl mr-2"></i>
                <span className="text-xl font-bold">GameTopup+</span>
              </div>
              <p className="text-gray-400">
                Fast, secure, and reliable game currency top-ups for all your favorite games.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Dashboard</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Order History</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Wallet</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Profile</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-facebook text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-twitter text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-discord text-xl"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-[hsl(var(--gaming-accent))] mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 GameTopup+. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
