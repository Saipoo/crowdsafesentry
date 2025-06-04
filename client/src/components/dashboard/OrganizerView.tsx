import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Calendar, MapPin, Users, Bot, Check, X, Clock } from "lucide-react";

const eventSchema = z.object({
  title: z.string().min(1, "Event title is required"),
  eventType: z.string().min(1, "Event type is required"),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  location: z.string().min(1, "Location is required"),
  expectedAttendance: z.number().min(1, "Expected attendance must be greater than 0"),
  celebrityName: z.string().min(1, "Celebrity/VIP name is required"),
  specialRequirements: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function OrganizerView() {
  const { toast } = useToast();
  const [aiPrediction, setAiPrediction] = useState<any>(null);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      eventType: "",
      date: "",
      startTime: "",
      endTime: "",
      location: "",
      expectedAttendance: 0,
      celebrityName: "",
      specialRequirements: "",
    },
  });

  const { data: myEvents = [] } = useQuery({
    queryKey: ["/api/events/my"],
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const response = await apiRequest("POST", "/api/events", data);
      return response.json();
    },
    onSuccess: (data) => {
      setAiPrediction(data);
      queryClient.invalidateQueries({ queryKey: ["/api/events/my"] });
      toast({
        title: "Event Submitted Successfully",
        description: "AI analysis complete. Pending police approval.",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit event request",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EventFormData) => {
    createEventMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <Check className="w-3 h-3" />;
      case 'rejected': return <X className="w-3 h-3" />;
      case 'pending': return <Clock className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Event Submission Form */}
      <Card>
        <CardHeader>
          <CardTitle>Submit New Event Request</CardTitle>
          <p className="text-sm text-gray-600">All events require police approval before proceeding</p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter event title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="eventType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select event type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="concert">Concert/Music</SelectItem>
                          <SelectItem value="movie">Movie Promotion</SelectItem>
                          <SelectItem value="political">Political Rally</SelectItem>
                          <SelectItem value="sports">Sports Event</SelectItem>
                          <SelectItem value="cultural">Cultural Program</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time *</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time *</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue/Location *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter complete venue address" {...field} />
                    </FormControl>
                    <p className="text-xs text-gray-500">AI will analyze venue capacity and accessibility</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="expectedAttendance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Attendance *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter expected number" 
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="celebrityName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Celebrity/VIP Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Name of main attraction" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="specialRequirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Requirements</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any special security needs, accessibility requirements, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {aiPrediction && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Bot className="text-primary text-lg mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-blue-800 font-medium">AI Analysis Results</h4>
                      <div className="text-blue-700 text-sm mt-2 space-y-1">
                        <p>• Predicted crowd size: <span className="font-medium">{aiPrediction.crowdPrediction?.min?.toLocaleString()} - {aiPrediction.crowdPrediction?.max?.toLocaleString()}</span> people</p>
                        <p>• Risk assessment: <span className={`font-medium ${aiPrediction.riskLevel === 'high' ? 'text-red-600' : aiPrediction.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>{aiPrediction.riskLevel} Risk</span></p>
                        <p>• Venue capacity: <span className="font-medium">{aiPrediction.venueCapacity?.toLocaleString()}</span> max capacity</p>
                        <p>• Risk score: <span className="font-medium">{aiPrediction.riskScore}/100</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-4">
                <Button 
                  type="submit" 
                  disabled={createEventMutation.isPending}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  {createEventMutation.isPending ? "Submitting..." : "Submit Event Request"}
                </Button>
                <Button type="button" variant="outline">
                  Save as Draft
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Event Status Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>My Event Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No event requests yet</p>
            ) : (
              myEvents.map((event: any) => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(event.status)}>
                        {getStatusIcon(event.status)}
                        <span className="ml-1 capitalize">{event.status}</span>
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                    <p><Calendar className="inline w-4 h-4 mr-2" />{new Date(event.date).toLocaleDateString()}</p>
                    <p><MapPin className="inline w-4 h-4 mr-2" />{event.location}</p>
                    <p><Users className="inline w-4 h-4 mr-2" />Expected: {event.expectedAttendance?.toLocaleString()}</p>
                  </div>
                  
                  {/* Status Timeline */}
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600">Submitted</span>
                    </div>
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${event.status !== 'pending' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
                      <span className={event.status !== 'pending' ? 'text-green-600' : 'text-yellow-600'}>AI Analysis</span>
                    </div>
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${event.status === 'approved' || event.status === 'rejected' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={event.status === 'approved' || event.status === 'rejected' ? 'text-green-600' : 'text-gray-400'}>Police Review</span>
                    </div>
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${event.status === 'approved' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={event.status === 'approved' ? 'text-green-600' : 'text-gray-400'}>Approved</span>
                    </div>
                  </div>

                  {event.rejectionReason && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800">
                        <strong>Rejection Reason:</strong> {event.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
