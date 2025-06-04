import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calendar, MapPin, Users, Clock, Shield, Info, Route, Phone } from "lucide-react";

export default function PublicView() {
  const { data: approvedEvents = [] } = useQuery({
    queryKey: ["/api/events/approved"],
  });

  const { data: safetyAdvisories = [] } = useQuery({
    queryKey: ["/api/safety-advisories"],
  });

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Emergency Alert Banner */}
      {safetyAdvisories.length > 0 && safetyAdvisories[0].severity === 'alert' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="text-red-500 text-lg mt-0.5 mr-3" />
            <div>
              <h3 className="text-red-800 font-medium">{safetyAdvisories[0].title}</h3>
              <p className="text-red-700 text-sm mt-1">{safetyAdvisories[0].description}</p>
              <div className="mt-2">
                <Button variant="link" className="text-red-600 text-sm font-medium hover:text-red-800 p-0">
                  View Safety Guidelines <i className="fas fa-arrow-right ml-1"></i>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="text-green-500 text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Events</p>
                <p className="text-2xl font-bold text-gray-900">{approvedEvents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="text-primary text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Attendees</p>
                <p className="text-2xl font-bold text-gray-900">
                  {approvedEvents.reduce((total: number, event: any) => total + (event.expectedAttendance || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Shield className="text-yellow-500 text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Safety Score</p>
                <p className="text-2xl font-bold text-gray-900">8.7/10</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="text-gray-500 text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Response</p>
                <p className="text-2xl font-bold text-gray-900">2.3 min</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Events & Safety Advisories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Approved Events */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Approved Events Today</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {approvedEvents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No approved events today</p>
              ) : (
                approvedEvents.map((event: any) => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium text-gray-900">{event.title}</h3>
                          <Badge className="bg-green-100 text-green-800">
                            Approved
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><MapPin className="inline w-4 h-4 mr-2" />{event.location}</p>
                          <p><Clock className="inline w-4 h-4 mr-2" />{event.startTime} - {event.endTime}</p>
                          <p><Users className="inline w-4 h-4 mr-2" />Expected: {event.expectedAttendance?.toLocaleString()} people</p>
                        </div>
                        <div className="mt-2 flex items-center space-x-4">
                          <Badge className={`${getRiskColor('medium')}`}>
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Medium Risk
                          </Badge>
                          <Button variant="link" className="text-primary text-xs font-medium hover:text-primary/80 p-0">
                            View Safety Plan <i className="fas fa-external-link-alt ml-1"></i>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              <div className="text-center pt-4">
                <Button variant="link" className="text-primary text-sm font-medium hover:text-primary/80">
                  View All Events <i className="fas fa-arrow-right ml-1"></i>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Safety Advisories */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Safety Advisories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {safetyAdvisories.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No active advisories</p>
              ) : (
                safetyAdvisories.slice(0, 3).map((advisory: any) => (
                  <div key={advisory.id} className="flex items-start space-x-3">
                    <Info className="text-primary mt-1 w-4 h-4" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{advisory.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{advisory.description}</p>
                    </div>
                  </div>
                ))
              )}
              
              <div className="flex items-start space-x-3">
                <Route className="text-yellow-500 mt-1 w-4 h-4" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Alternate Routes</p>
                  <p className="text-sm text-gray-600 mt-1">Use Ring Road or Outer Ring Road for faster commute during peak hours.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="text-green-500 mt-1 w-4 h-4" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Emergency Contacts</p>
                  <p className="text-sm text-gray-600 mt-1">Police: 100 | Ambulance: 108 | Fire: 101</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Real-time Crowd Density Map */}
          <Card>
            <CardHeader>
              <CardTitle>Live Crowd Density</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Placeholder for actual map integration */}
              <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="text-gray-400 text-3xl mb-2 mx-auto" />
                  <p className="text-gray-500 text-sm">Interactive crowd density map</p>
                  <p className="text-gray-400 text-xs mt-1">Real-time data from CCTV & IoT sensors</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Low Density</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Medium Density</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>High Density</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
