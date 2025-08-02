import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gamepad2, Shield, Zap, Star } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--gaming-dark))] to-[hsl(var(--gaming-blue))]">
      {/* Header */}
      <nav className="border-b border-[hsl(var(--gaming-accent))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Gamepad2 className="text-[hsl(var(--gaming-bright))] text-2xl mr-2" />
              <span className="text-xl font-bold text-white">GameTopup+</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="gaming-button"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Top-up Your <span className="text-[hsl(var(--gaming-success))]">Gaming</span> Experience
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Fast, secure, and reliable game currency top-ups for all your favorite games. 
            Join thousands of gamers who trust GameTopup+ for their gaming needs.
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/api/login'}
            className="gaming-button text-lg px-8 py-4"
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose GameTopup+?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="gaming-card">
              <CardContent className="p-6 text-center">
                <Zap className="text-[hsl(var(--gaming-warning))] text-4xl mb-4 mx-auto" />
                <h3 className="text-xl font-bold mb-2">Instant Delivery</h3>
                <p className="text-gray-400">
                  Get your game currency delivered instantly after payment confirmation
                </p>
              </CardContent>
            </Card>
            
            <Card className="gaming-card">
              <CardContent className="p-6 text-center">
                <Shield className="text-[hsl(var(--gaming-success))] text-4xl mb-4 mx-auto" />
                <h3 className="text-xl font-bold mb-2">100% Secure</h3>
                <p className="text-gray-400">
                  Advanced security measures to protect your account and transactions
                </p>
              </CardContent>
            </Card>
            
            <Card className="gaming-card">
              <CardContent className="p-6 text-center">
                <Star className="text-[hsl(var(--gaming-bright))] text-4xl mb-4 mx-auto" />
                <h3 className="text-xl font-bold mb-2">24/7 Support</h3>
                <p className="text-gray-400">
                  Round-the-clock customer support to help you with any issues
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Supported Games Preview */}
      <section className="py-16 bg-[hsl(var(--gaming-blue))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Supported Games</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
            {[
              { name: "Free Fire", icon: "🔥" },
              { name: "PUBG Mobile", icon: "🎯" },
              { name: "Mobile Legends", icon: "🛡️" },
              { name: "Minecraft", icon: "🧊" },
              { name: "Valorant", icon: "🎯" },
              { name: "Roblox", icon: "🎮" },
            ].map((game, index) => (
              <Card key={index} className="gaming-card text-center p-4">
                <div className="text-3xl mb-2">{game.icon}</div>
                <h3 className="font-medium">{game.name}</h3>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[hsl(var(--gaming-blue))] border-t border-[hsl(var(--gaming-accent))] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Gamepad2 className="text-[hsl(var(--gaming-bright))] text-2xl mr-2" />
            <span className="text-xl font-bold">GameTopup+</span>
          </div>
          <p className="text-gray-400">&copy; 2024 GameTopup+. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
