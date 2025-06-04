import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PublicView from "@/components/dashboard/PublicView";
import OrganizerView from "@/components/dashboard/OrganizerView";
import PoliceView from "@/components/dashboard/PoliceView";
import AnalyticsDashboard from "@/components/dashboard/AnalyticsDashboard";
import RealTimeMonitoring from "@/components/dashboard/RealTimeMonitoring";
import AIChatbot from "@/components/dashboard/AIChatbot";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>("public");

  const renderRoleBasedContent = () => {
    switch (selectedRole) {
      case "organizer":
        return (
          <Tabs defaultValue="events" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="events">My Events</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            </TabsList>
            <TabsContent value="events">
              <OrganizerView />
            </TabsContent>
            <TabsContent value="analytics">
              <AnalyticsDashboard />
            </TabsContent>
            <TabsContent value="assistant">
              <AIChatbot />
            </TabsContent>
            <TabsContent value="monitoring">
              <RealTimeMonitoring />
            </TabsContent>
          </Tabs>
        );
      case "police":
        return (
          <Tabs defaultValue="approvals" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="approvals">Event Approvals</TabsTrigger>
              <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
            </TabsList>
            <TabsContent value="approvals">
              <PoliceView />
            </TabsContent>
            <TabsContent value="monitoring">
              <RealTimeMonitoring />
            </TabsContent>
            <TabsContent value="analytics">
              <AnalyticsDashboard />
            </TabsContent>
            <TabsContent value="assistant">
              <AIChatbot />
            </TabsContent>
          </Tabs>
        );
      default:
        return (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Event Overview</TabsTrigger>
              <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
              <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
              <TabsTrigger value="analytics">Safety Analytics</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <PublicView />
            </TabsContent>
            <TabsContent value="monitoring">
              <RealTimeMonitoring />
            </TabsContent>
            <TabsContent value="assistant">
              <AIChatbot />
            </TabsContent>
            <TabsContent value="analytics">
              <AnalyticsDashboard />
            </TabsContent>
          </Tabs>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header selectedRole={selectedRole} onRoleChange={setSelectedRole} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderRoleBasedContent()}
      </main>
      <Footer />
    </div>
  );
}
