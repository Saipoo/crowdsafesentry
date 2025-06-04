import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  AlertTriangle, 
  MapPin, 
  Users, 
  Clock, 
  Zap,
  Shield,
  Camera,
  Radio,
  Target,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";

interface LiveEventData {
  id: number;
  title: string;
  location: string;
  currentCrowd: number;
  maxCapacity: number;
  densityPercentage: number;
  alertLevel: 'normal' | 'warning' | 'critical';
  lastUpdate: string;
  expectedAttendance: number;
  riskScore: number;
}

export default function RealTimeMonitoring() {
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [alertsCount, setAlertsCount] = useState(0);

  const { data: liveEvents = [] } = useQuery({
    queryKey: ["/api/monitoring/live"],
    refetchInterval: 3000, // Refresh every 3 seconds
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAlertsCount(prev => prev + Math.floor(Math.random() * 2));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getCrowdTrend = (current: number, expected: number) => {
    const ratio = current / expected;
    if (ratio > 1.1) return { icon: TrendingUp, color: 'text-red-500', text: 'Above Expected' };
    if (ratio < 0.9) return { icon: TrendingDown, color: 'text-blue-500', text: 'Below Expected' };
    return { icon: Minus, color: 'text-green-500', text: 'As Expected' };
  };

  const generateHeatmapData = () => {
    return Array.from({ length: 12 }, (_, i) => ({
      zone: `Zone ${i + 1}`,
      density: Math.floor(Math.random() * 100),
      people: Math.floor(Math.random() * 500) + 100,
      riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
    }));
  };

  const heatmapData = generateHeatmapData();

  return (
    <div className="space-y-6">
      {/* Real-time Status Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Activity className="text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Live Events</p>
                <p className="text-2xl font-bold">{liveEvents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Monitored</p>
                <p className="text-2xl font-bold">
                  {liveEvents.reduce((sum: number, event: any) => sum + (event.currentCrowd || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="text-orange-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold">{alertsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Shield className="text-purple-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Safety Score</p>
                <p className="text-2xl font-bold text-green-600">8.7/10</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2" />
              Live Event Monitoring
              <Badge className="ml-2 bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                Real-time
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {liveEvents.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No live events currently active</p>
            ) : (
              <div className="space-y-4">
                {liveEvents.map((event: LiveEventData) => {
                  const trend = getCrowdTrend(event.currentCrowd, event.expectedAttendance);
                  const TrendIcon = trend.icon;
                  
                  return (
                    <div 
                      key={event.id} 
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedEvent === event.id ? 'border-blue-500 bg-blue-50' : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedEvent(selectedEvent === event.id ? null : event.id)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">{event.title}</h3>
                        <Badge className={getAlertColor(event.alertLevel)}>
                          {event.alertLevel}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Crowd Density</span>
                          <span className="font-semibold">{event.densityPercentage}%</span>
                        </div>
                        <Progress value={event.densityPercentage} className="h-2" />
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Current</p>
                            <div className="flex items-center space-x-1">
                              <p className="font-semibold">{event.currentCrowd?.toLocaleString()}</p>
                              <TrendIcon className={`w-3 h-3 ${trend.color}`} />
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-600">Capacity</p>
                            <p className="font-semibold">{event.maxCapacity?.toLocaleString()}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {event.location}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(event.lastUpdate).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      
                      {selectedEvent === event.id && (
                        <div className="mt-4 pt-4 border-t space-y-2">
                          <div className="grid grid-cols-3 gap-2">
                            <Button size="sm" variant="outline" className="text-xs">
                              <Camera className="w-3 h-3 mr-1" />
                              CCTV Feed
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs">
                              <Radio className="w-3 h-3 mr-1" />
                              Dispatch
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs">
                              <Target className="w-3 h-3 mr-1" />
                              Heatmap
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Crowd Density Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>Crowd Density Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {heatmapData.map((zone, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg text-center text-sm ${
                    zone.riskLevel === 'high' ? 'bg-red-100 border border-red-300' :
                    zone.riskLevel === 'medium' ? 'bg-yellow-100 border border-yellow-300' :
                    'bg-green-100 border border-green-300'
                  }`}
                >
                  <p className="font-medium text-gray-900">{zone.zone}</p>
                  <p className="text-xs text-gray-600">{zone.people} people</p>
                  <div className="mt-1">
                    <div className={`h-1 rounded-full ${
                      zone.riskLevel === 'high' ? 'bg-red-500' :
                      zone.riskLevel === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`} style={{ width: `${zone.density}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Low Density</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>Medium Density</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>High Density</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Response Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <Zap className="mr-2" />
            Emergency Response System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Active Officers</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                  <span className="text-sm">Sector 1</span>
                  <Badge className="bg-green-100 text-green-800">12 Officers</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <span className="text-sm">Sector 2</span>
                  <Badge className="bg-yellow-100 text-yellow-800">8 Officers</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded">
                  <span className="text-sm">Sector 3</span>
                  <Badge className="bg-red-100 text-red-800">15 Officers</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Emergency Services</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded">
                  <span className="text-sm">Ambulances</span>
                  <Badge className="bg-blue-100 text-blue-800">3 Available</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-purple-50 border border-purple-200 rounded">
                  <span className="text-sm">Fire Services</span>
                  <Badge className="bg-purple-100 text-purple-800">2 Standby</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-orange-50 border border-orange-200 rounded">
                  <span className="text-sm">Rapid Response</span>
                  <Badge className="bg-orange-100 text-orange-800">5 Teams</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Quick Actions</h4>
              <div className="space-y-2">
                <Button variant="destructive" size="sm" className="w-full">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Emergency Alert
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Radio className="w-4 h-4 mr-2" />
                  Dispatch Units
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Camera className="w-4 h-4 mr-2" />
                  View All Feeds
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}