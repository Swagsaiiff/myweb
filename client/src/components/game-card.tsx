import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import OrderModal from "./order-modal";

interface GameCardProps {
  game: {
    id: string;
    name: string;
    displayName: string;
    currency: string;
    icon: string;
  };
}

export default function GameCard({ game }: GameCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  const { data: packages } = useQuery({
    queryKey: ['/api/games', game.id, 'packages'],
    retry: false,
  });

  const getIconColor = (gameName: string) => {
    const colors: { [key: string]: string } = {
      freefire: "text-orange-500",
      pubg: "text-yellow-500",
      mobilelegends: "text-blue-500",
      minecraft: "text-green-500",
      valorant: "text-red-500",
      roblox: "text-yellow-400",
    };
    return colors[gameName] || "text-gray-500";
  };

  const handlePackageSelect = (pkg: any) => {
    setSelectedPackage(pkg);
    setShowModal(true);
  };

  return (
    <>
      <Card className="gaming-card hover:transform hover:scale-105 transition-all duration-300 cursor-pointer">
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <i className={`${game.icon} ${getIconColor(game.name)} text-4xl mb-2`}></i>
            <h3 className="text-xl font-bold">{game.displayName}</h3>
            <p className="text-gray-400">{game.currency}</p>
          </div>
          <div className="space-y-3">
            {packages?.slice(0, 3).map((pkg: any) => (
              <div
                key={pkg.id}
                onClick={() => handlePackageSelect(pkg)}
                className="flex justify-between items-center bg-[hsl(var(--gaming-dark))] p-3 rounded-lg hover:bg-[hsl(var(--gaming-accent))] transition-colors cursor-pointer"
              >
                <span>{pkg.name}</span>
                <span className="text-[hsl(var(--gaming-success))] font-bold">৳{pkg.price}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {showModal && selectedPackage && (
        <OrderModal
          game={game}
          package={selectedPackage}
          onClose={() => {
            setShowModal(false);
            setSelectedPackage(null);
          }}
        />
      )}
    </>
  );
}
