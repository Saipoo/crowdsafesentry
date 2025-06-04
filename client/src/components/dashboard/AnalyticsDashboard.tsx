import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  AlertTriangle, 
  Shield, 
  MapPin,
  Clock,
  BarChart3,
  Activity,
  Zap
} from "lucide-react";

export default function AnalyticsDashboard() {
  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics/dashboard"],
  });

  const { data: liveData } = useQuery({
    queryKey: ["/api/monitoring/live"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  if (!analytics) {
    return <div className="flex items-center justify-center p-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="text-blue-500 text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalEvents}</p>
                <p className="text-xs text-green-600">+12% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Shield className="text-green-500 text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approved Events</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.approvedEvents}</p>
                <p className="text-xs text-gray-600">
                  {Math.round((analytics.approvedEvents / analytics.totalEvents) * 100)}% approval rate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="text-purple-500 text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Attendance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.totalAttendance?.toLocaleString()}
                </p>
                <p className="text-xs text-blue-600">Predicted safely managed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="text-orange-500 text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Risk Score</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.avgRiskScore}/100</p>
                <p className="text-xs text-yellow-600">Medium risk level</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Assessment Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-green-600 font-medium">Low Risk Events</span>
                <span>{Math.round(analytics.riskDistribution?.low || 0)}</span>
              </div>
              <Progress value={40} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-yellow-600 font-medium">Medium Risk Events</span>
                <span>{Math.round(analytics.riskDistribution?.medium || 0)}</span>
              </div>
              <Progress value={40} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-red-600 font-medium">High Risk Events</span>
                <span>{Math.round(analytics.riskDistribution?.high || 0)}</span>
              </div>
              <Progress value={20} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Event Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2" />
            Live Event Monitoring
            <Badge className="ml-2 bg-green-100 text-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
              Live
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!liveData || liveData.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No live events currently active</p>
          ) : (
            <div className="space-y-4">
              {liveData.map((event: any) => (
                <div key={event.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                    <Badge className={`
                      ${event.alertLevel === 'critical' ? 'bg-red-100 text-red-800' :
                        event.alertLevel === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'}
                    `}>
                      {event.alertLevel}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Current Crowd</p>
                      <p className="font-semibold text-lg">{event.currentCrowd?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Density</p>
                      <div className="flex items-center space-x-2">
                        <Progress value={event.densityPercentage} className="flex-1 h-2" />
                        <span className="font-semibold">{event.densityPercentage}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600">Last Update</p>
                      <p className="font-semibold text-sm">
                        {new Date(event.lastUpdate).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center text-xs text-gray-500">
                    <MapPin className="w-3 h-3 mr-1" />
                    {event.location}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 text-orange-500" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="text-red-500 mt-0.5 w-4 h-4" />
                <div>
                  <p className="text-sm font-medium text-red-800">Crowd Surge Alert</p>
                  <p className="text-xs text-red-600 mt-1">MG Road Event - Gate 2 | 5 min ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Clock className="text-yellow-500 mt-0.5 w-4 h-4" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Capacity Warning</p>
                  <p className="text-xs text-yellow-600 mt-1">Stadium reaching 80% capacity | 12 min ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <BarChart3 className="text-blue-500 mt-0.5 w-4 h-4" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Traffic Alert</p>
                  <p className="text-xs text-blue-600 mt-1">Heavy congestion on Brigade Road | 18 min ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="mr-2 text-green-500" />
              AI Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Prediction Accuracy</span>
                  <span className="font-semibold">87%</span>
                </div>
                <Progress value={87} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Risk Assessment Accuracy</span>
                  <span className="font-semibold">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Response Time</span>
                  <span className="font-semibold">2.3 min avg</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-600">
                  AI models continuously learning from {analytics.totalEvents} events
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}