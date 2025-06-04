import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, AlertTriangle, CheckCircle } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 flex items-center">
                <Shield className="text-primary text-2xl mr-2" />
                <h1 className="text-xl font-bold text-gray-900">CrowdSafe</h1>
              </div>
            </div>
            <Button onClick={() => window.location.href = "/api/login"}>
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            AI-Powered Crowd Safety Platform
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Preventing stampedes and ensuring safety during public gatherings in Bengaluru through intelligent crowd prediction and police-approved event management.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <Button
              size="lg"
              onClick={() => window.location.href = "/api/login"}
              className="w-full sm:w-auto"
            >
              Get Started
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Users className="mx-auto h-12 w-12 text-primary" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Crowd Prediction</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    AI-powered crowd size prediction using historical data and social media analytics.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Police Approval</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Strict approval process ensures no events proceed without police authorization.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertTriangle className="mx-auto h-12 w-12 text-orange-500" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Real-time Monitoring</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Live crowd density monitoring with automated alerts for safety personnel.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Shield className="mx-auto h-12 w-12 text-blue-500" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Safety First</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Comprehensive safety advisories and emergency response coordination.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="mt-16 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contacts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">Police</p>
              <p className="text-lg font-bold text-blue-600">100</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">Ambulance</p>
              <p className="text-lg font-bold text-green-600">108</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">Fire</p>
              <p className="text-lg font-bold text-red-600">101</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
