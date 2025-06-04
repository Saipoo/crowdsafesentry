import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PublicView from "@/components/dashboard/PublicView";
import OrganizerView from "@/components/dashboard/OrganizerView";
import PoliceView from "@/components/dashboard/PoliceView";

export default function Dashboard() {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>("public");

  const renderView = () => {
    switch (selectedRole) {
      case "organizer":
        return <OrganizerView />;
      case "police":
        return <PoliceView />;
      default:
        return <PublicView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header selectedRole={selectedRole} onRoleChange={setSelectedRole} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </main>
      <Footer />
    </div>
  );
}
