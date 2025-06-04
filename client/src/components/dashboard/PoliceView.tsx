import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AlertTriangle, CheckCircle, XCircle, Clock, Users, MapPin, Calendar, Bot, Activity } from "lucide-react";

export default function PoliceView() {
  const { toast } = useToast();
  const [processingEventId, setProcessingEventId] = useState<number | null>(null);

  const { data: pendingEvents = [] } = useQuery({
    queryKey: ["/api/events/pending"],
  });

  const { data: approvedEvents = [] } = useQuery({
    queryKey: ["/api/events/approved"],
  });

  const approveEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const response = await apiRequest("PATCH", `/api/events/${eventId}/approve`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/approved"] });
      toast({
        title: "Event Approved",
        description: "The event has been approved and organizer has been notified.",
      });
      setProcessingEventId(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to approve event",
        variant: "destructive",
      });
      setProcessingEventId(null);
    },
  });

  const rejectEventMutation = useMutation({
    mutationFn: async ({ eventId, reason }: { eventId: number; reason: string }) => {
      const response = await apiRequest("PATCH", `/api/events/${eventId}/reject`, { reason });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events/pending"] });
      toast({
        title: "Event Rejected",
        description: "The event has been rejected and organizer has been notified.",
      });
      setProcessingEventId(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to reject event",
        variant: "destructive",
      });
      setProcessingEventId(null);
    },
  });

  const handleApproval = (eventId: number) => {
    if (confirm('Approve this event? This will notify the organizer and make the event public.')) {
      setProcessingEventId(eventId);
      approveEventMutation.mutate(eventId);
    }
  };

  const handleRejection = (eventId: number) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      setProcessingEventId(eventId);
      rejectEventMutation.mutate({ eventId, reason });
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return <AlertTriangle className="w-3 h-3" />;
      case 'medium': return <AlertTriangle className="w-3 h-3" />;
      case 'low': return <CheckCircle className="w-3 h-3" />;
      default: return <AlertTriangle className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Police Dashboard Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Police Command Center</h2>
              <p className="text-gray-600 mt-1">Event monitoring and approval dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{pendingEvents.length}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{approvedEvents.length}</p>
                <p className="text-xs text-gray-500">Approved Today</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {approvedEvents.filter((event: any) => event.status === 'approved').length}
                </p>
                <p className="text-xs text-gray-500">Live Events</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Approvals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pending Event Approvals</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">Sort by Risk</Button>
            <span className="text-gray-300">|</span>
            <Button variant="ghost" size="sm">Filter</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingEvents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No pending event approvals</p>
          ) : (
            pendingEvents.map((event: any) => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-900">{event.title}</h3>
                      {event.aiAnalysis && (
                        <Badge className={getRiskColor(event.aiAnalysis.riskLevel)}>
                          {getRiskIcon(event.aiAnalysis.riskLevel)}
                          <span className="ml-1 capitalize">{event.aiAnalysis.riskLevel} Risk</span>
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(event.createdAt).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <p><Calendar className="inline w-4 h-4 mr-2" />{new Date(event.date).toLocaleDateString()}</p>
                      <p><MapPin className="inline w-4 h-4 mr-2" />{event.location}</p>
                      <p>Organizer: <span className="font-medium">{event.celebrityName}</span></p>
                    </div>
                  </div>
                </div>
                
                {/* AI Analysis Summary */}
                {event.aiAnalysis && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Bot className="text-primary mr-2" />
                      AI Risk Analysis
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Expected Crowd: <span className="font-medium text-gray-900">{event.aiAnalysis.predictedCrowdMin?.toLocaleString()} - {event.aiAnalysis.predictedCrowdMax?.toLocaleString()}</span></p>
                        <p className="text-gray-600">Venue Capacity: <span className="font-medium text-gray-900">{event.aiAnalysis.venueCapacity?.toLocaleString()}</span></p>
                        <p className="text-gray-600">Risk Score: <span className={`font-medium ${event.aiAnalysis.riskScore >= 80 ? 'text-red-600' : event.aiAnalysis.riskScore >= 50 ? 'text-yellow-600' : 'text-green-600'}`}>{event.aiAnalysis.riskScore}/100</span></p>
                      </div>
                      <div>
                        <p className="text-gray-600">Traffic Impact: <span className={`font-medium ${event.aiAnalysis.trafficImpact === 'high' ? 'text-red-600' : event.aiAnalysis.trafficImpact === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>{event.aiAnalysis.trafficImpact}</span></p>
                        <p className="text-gray-600">Weather: <span className="font-medium text-green-600">{event.aiAnalysis.weatherConditions}</span></p>
                        <p className="text-gray-600">Expected Attendance: <span className="font-medium text-gray-900">{event.expectedAttendance?.toLocaleString()}</span></p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Recommended Actions */}
                {event.aiAnalysis?.recommendations && event.aiAnalysis.recommendations.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <h4 className="font-medium text-yellow-800 mb-2">AI Recommendations</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {event.aiAnalysis.recommendations.map((rec: string, index: number) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      className="bg-green-500 text-white hover:bg-green-600"
                      onClick={() => handleApproval(event.id)}
                      disabled={processingEventId === event.id}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {processingEventId === event.id ? "Processing..." : "Approve"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRejection(event.id)}
                      disabled={processingEventId === event.id}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                    <Button size="sm" variant="outline">
                      Request More Info
                    </Button>
                  </div>
                  <Button variant="link" size="sm" className="text-primary">
                    View Full Report →
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Real-time Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Live Events Monitoring */}
        <Card>
          <CardHeader>
            <CardTitle>Live Events Monitoring</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {approvedEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No live events currently</p>
            ) : (
              approvedEvents.slice(0, 3).map((event: any) => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600">Live</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    <p><MapPin className="inline w-4 h-4 mr-2" />{event.location}</p>
                  </div>
                  
                  {/* Crowd Density Indicator */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Crowd Density</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Current: {(event.expectedAttendance * 0.78).toLocaleString()}</span>
                    <Button variant="link" size="sm" className="text-primary p-0">View Details</Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Emergency Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Emergency Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Crowd Surge Detected</p>
                  <p className="text-xs text-red-600 mt-1">Brigade Road - Gate 3 | 2 min ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Activity className="text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Capacity Warning</p>
                  <p className="text-xs text-yellow-600 mt-1">Stadium reaching 85% capacity | 5 min ago</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <Button variant="link" size="sm" className="text-primary">
                View All Alerts →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
