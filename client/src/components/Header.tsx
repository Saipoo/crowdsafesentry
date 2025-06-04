import { useState } from "react";
import { Bell, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  selectedRole: string;
  onRoleChange: (role: string) => void;
}

export default function Header({ selectedRole, onRoleChange }: HeaderProps) {
  const { user } = useAuth();
  const [language, setLanguage] = useState("en");

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 flex items-center">
              <Shield className="text-primary text-2xl mr-2" />
              <h1 className="text-xl font-bold text-gray-900">CrowdSafe</h1>
            </div>
            <div className="hidden md:block">
              <nav className="flex space-x-8">
                <a 
                  href="#dashboard" 
                  className={`pb-2 text-sm font-medium ${
                    selectedRole === 'public' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Dashboard
                </a>
                <a 
                  href="#events" 
                  className="text-gray-500 hover:text-gray-700 pb-2 text-sm font-medium"
                >
                  Events
                </a>
                <a 
                  href="#monitoring" 
                  className="text-gray-500 hover:text-gray-700 pb-2 text-sm font-medium"
                >
                  Monitoring
                </a>
                <a 
                  href="#safety" 
                  className="text-gray-500 hover:text-gray-700 pb-2 text-sm font-medium"
                >
                  Safety
                </a>
              </nav>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="kn">ಕನ್ನಡ</SelectItem>
                <SelectItem value="hi">हिंदी</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Role Selector */}
            <Select value={selectedRole} onValueChange={onRoleChange}>
              <SelectTrigger className="w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public View</SelectItem>
                <SelectItem value="organizer">Event Organizer</SelectItem>
                <SelectItem value="police">Police Dashboard</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative p-2">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Button>
            
            {/* User Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = "/api/logout"}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
