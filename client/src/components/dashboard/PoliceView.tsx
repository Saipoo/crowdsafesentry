import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  AlertTriangle, CheckCircle, XCircle, Clock, Users, MapPin, 
  Shield, Radio, Car, Camera, FileText, Bell 
} from "lucide-react";
import EmergencyAlert from "./EmergencyAlert";
import DispatchUnits from "./DispatchUnits";
import LiveFeeds from "./LiveFeeds";
import SafetyPlan from "./SafetyPlan";
import RealTimeMonitoring from "./RealTimeMonitoring";
import AnalyticsDashboard from "./AnalyticsDashboard";
import EmergencyMap from "./EmergencyMap";

export default function PoliceView() {
  const { toast } = useToast();
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  const { data: pendingEvents, isLoading: pendingLoading } = useQuery({
    queryKey: ["/api/events/pending"],
    refetchInterval: 30000,
  });

  const { data: approvedEvents, isLoading: approvedLoading } = useQuery({
    queryKey: ["/api/events/approved"],
    refetchInterval: 30000,
  });

  const approveMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const response = await apiRequest("PATCH", `/api/events/${eventId}/approve`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/approved"] });
      toast({
        title: "Event Approved",
        description: "Event has been successfully approved and organizer notified",
      });
    },
    onError: () => {
      toast({
        title: "Approval Failed",
        description: "Failed to approve event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ eventId, reason }: { eventId: number; reason: string }) => {
      const response = await apiRequest("PATCH", `/api/events/${eventId}/reject`, { reason });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events/pending"] });
      setRejectionReason("");
      toast({
        title: "Event Rejected",
        description: "Event has been rejected and organizer notified",
      });
    },
    onError: () => {
      toast({
        title: "Rejection Failed",
        description: "Failed to reject event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (eventId: number) => {
    approveMutation.mutate(eventId);
  };

  const handleReject = (eventId: number) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }
    rejectMutation.mutate({ eventId, reason: rejectionReason });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold flex items-center">
          <Shield className="mr-3 h-8 w-8 text-blue-500" />
          Police Command Center
        </h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Radio className="h-4 w-4 mr-2" />
            Emergency Alert
          </Button>
          <Button variant="outline" size="sm">
            <Car className="h-4 w-4 mr-2" />
            Dispatch Units
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="monitoring">Live Monitor</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
          <TabsTrigger value="dispatch">Dispatch</TabsTrigger>
          <TabsTrigger value="feeds">Live Feeds</TabsTrigger>
          <TabsTrigger value="safety">Safety Plan</TabsTrigger>
          <TabsTrigger value="map">Emergency Map</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              {Array.isArray(pendingEvents) && pendingEvents.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400">No pending events for approval</p>
                  </CardContent>
                </Card>
              ) : (
                Array.isArray(pendingEvents) && pendingEvents.map((event: any) => (
                  <Card key={event.id} className="border-yellow-500/30">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
                          {event.title}
                        </CardTitle>
                        <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                          PENDING APPROVAL
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Type:</span>
                          <p className="font-medium">{event.eventType}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Date:</span>
                          <p className="font-medium">{new Date(event.date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Time:</span>
                          <p className="font-medium">{event.startTime} - {event.endTime}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Expected Attendance:</span>
                          <p className="font-medium">{event.expectedAttendance?.toLocaleString()}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-400">Celebrity:</span>
                          <p className="font-medium">{event.celebrityName}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-400">Location:</span>
                          <p className="font-medium flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {event.location}
                          </p>
                        </div>
                      </div>

                      {event.aiAnalysis && (
                        <div className="border border-gray-700 rounded p-4 bg-gray-900/50">
                          <h4 className="font-medium mb-2 text-blue-400">AI Risk Assessment</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Risk Score:</span>
                              <p className="font-medium text-orange-400">{event.aiAnalysis.riskScore}/100</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Risk Level:</span>
                              <p className="font-medium capitalize">{event.aiAnalysis.riskLevel}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Predicted Crowd:</span>
                              <p className="font-medium">
                                {event.aiAnalysis.predictedCrowdMin?.toLocaleString()} - {event.aiAnalysis.predictedCrowdMax?.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {event.aiAnalysis.recommendations && event.aiAnalysis.recommendations.length > 0 && (
                            <div className="mt-3">
                              <span className="text-gray-400 text-sm">Recommendations:</span>
                              <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                                {event.aiAnalysis.recommendations.slice(0, 3).map((rec: string, idx: number) => (
                                  <li key={idx} className="text-gray-300">{rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4">
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleApprove(event.id)}
                            disabled={approveMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleReject(event.id)}
                            disabled={rejectMutation.isPending}
                            variant="destructive"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                        <div className="text-sm text-gray-400">
                          Submitted: {new Date(event.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">Rejection Reason (required for rejection):</label>
                        <Textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Provide detailed reason for rejection..."
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedLoading ? (
            <div className="grid gap-4">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              {Array.isArray(approvedEvents) && approvedEvents.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400">No approved events</p>
                  </CardContent>
                </Card>
              ) : (
                Array.isArray(approvedEvents) && approvedEvents.map((event: any) => (
                  <Card key={event.id} className="border-green-500/30">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                          {event.title}
                        </CardTitle>
                        <Badge className="bg-green-600 text-white">
                          APPROVED
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Type:</span>
                          <p className="font-medium">{event.eventType}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Date:</span>
                          <p className="font-medium">{new Date(event.date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Time:</span>
                          <p className="font-medium">{event.startTime} - {event.endTime}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Attendance:</span>
                          <p className="font-medium">{event.expectedAttendance?.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedEventId(event.id)}
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Monitor Live
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedEventId(event.id)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Safety Plan
                          </Button>
                        </div>
                        <div className="text-sm text-gray-400">
                          Approved: {event.approvedAt ? new Date(event.approvedAt).toLocaleString() : 'N/A'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="monitoring">
          <RealTimeMonitoring />
        </TabsContent>

        <TabsContent value="emergency">
          <EmergencyAlert />
        </TabsContent>

        <TabsContent value="dispatch">
          <DispatchUnits />
        </TabsContent>

        <TabsContent value="feeds">
          <LiveFeeds />
        </TabsContent>

        <TabsContent value="safety">
          {selectedEventId ? (
            <SafetyPlan eventId={selectedEventId} />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400">Select an approved event to view its safety plan</p>
                <p className="text-sm text-gray-500 mt-2">Use the "Safety Plan" button from the approved events tab</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="map">
          <EmergencyMap />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}