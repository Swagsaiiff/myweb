import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="bg-[hsl(var(--gaming-blue))] shadow-lg border-b border-[hsl(var(--gaming-accent))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <i className="fas fa-gamepad text-[hsl(var(--gaming-bright))] text-2xl mr-2"></i>
              <span className="text-xl font-bold text-white">GameTopup+</span>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#dashboard" className="text-white hover:text-[hsl(var(--gaming-bright))] transition-colors">
              Dashboard
            </a>
            <a href="#orders" className="text-gray-300 hover:text-white transition-colors">
              Order History
            </a>
            <a href="#wallet" className="text-gray-300 hover:text-white transition-colors">
              Wallet
            </a>
            <a href="#profile" className="text-gray-300 hover:text-white transition-colors">
              Profile
            </a>
            {user?.role === 'admin' && (
              <a href="/admin" className="text-gray-300 hover:text-white transition-colors">
                Admin Panel
              </a>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {user?.profileImageUrl && (
              <img 
                src={user.profileImageUrl} 
                alt="User Profile" 
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <span className="text-sm text-gray-300">
              {user?.firstName || user?.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/api/logout'}
              className="text-gray-300 hover:text-white"
            >
              <i className="fas fa-sign-out-alt"></i>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
