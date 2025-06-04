import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import { AlertTriangle, Phone, Users, MapPin, Clock, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmergencyAlertForm {
  eventId?: number;
  alertType: string;
  severity: string;
  message: string;
  location: string;
}

export default function EmergencyAlert() {
  const { toast } = useToast();
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  
  const form = useForm<EmergencyAlertForm>({
    defaultValues: {
      alertType: "crowd_control",
      severity: "medium",
      message: "",
      location: ""
    },
  });

  const emergencyMutation = useMutation({
    mutationFn: async (data: EmergencyAlertForm) => {
      const response = await apiRequest("POST", "/api/emergency/alert", data);
      return response.json();
    },
    onSuccess: (data) => {
      setIsEmergencyActive(true);
      toast({
        title: "Emergency Alert Sent",
        description: data.message,
        variant: "default",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Alert Failed",
        description: "Failed to send emergency alert. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EmergencyAlertForm) => {
    emergencyMutation.mutate(data);
  };

  const quickAlerts = [
    { type: "panic", label: "Crowd Panic", severity: "critical", icon: AlertTriangle },
    { type: "medical", label: "Medical Emergency", severity: "high", icon: Phone },
    { type: "evacuation", label: "Evacuation", severity: "critical", icon: Users },
    { type: "security", label: "Security Threat", severity: "high", icon: Shield }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Emergency Buttons */}
      <Card className="border-red-500/20 bg-red-950/20">
        <CardHeader>
          <CardTitle className="flex items-center text-red-400">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Emergency Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickAlerts.map((alert) => (
              <Button
                key={alert.type}
                variant="destructive"
                size="lg"
                className="h-24 flex flex-col items-center justify-center space-y-2 bg-red-600 hover:bg-red-700"
                onClick={() => {
                  form.setValue("alertType", alert.type);
                  form.setValue("severity", alert.severity);
                  form.setValue("message", `${alert.label} reported - immediate response required`);
                }}
              >
                <alert.icon className="h-6 w-6" />
                <span className="text-sm font-medium">{alert.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Alert Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Phone className="mr-2 h-5 w-5" />
            Send Emergency Alert
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="alertType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alert Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select alert type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="crowd_control">Crowd Control</SelectItem>
                          <SelectItem value="medical">Medical Emergency</SelectItem>
                          <SelectItem value="fire">Fire Emergency</SelectItem>
                          <SelectItem value="security">Security Threat</SelectItem>
                          <SelectItem value="evacuation">Evacuation</SelectItem>
                          <SelectItem value="weather">Weather Alert</SelectItem>
                          <SelectItem value="panic">Crowd Panic</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Severity Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select severity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Specify exact location of emergency"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Message</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the emergency situation in detail..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                size="lg"
                disabled={emergencyMutation.isPending}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {emergencyMutation.isPending ? "Sending Alert..." : "Send Emergency Alert"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Active Emergency Status */}
      {isEmergencyActive && (
        <Card className="border-red-500 bg-red-950/30">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 animate-pulse" />
              Emergency Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-red-300">Status:</span>
                <span className="text-red-400 font-bold">ACTIVE EMERGENCY</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm">Response Time: 2-5 min</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span className="text-sm">Units Dispatched: 8</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-green-400" />
                  <span className="text-sm">Coverage: Full Area</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEmergencyActive(false)}
                >
                  Mark Resolved
                </Button>
                <Button variant="destructive" size="sm">
                  Escalate
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Phone className="mr-2 h-5 w-5" />
            Emergency Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-700 rounded-lg">
              <h4 className="font-medium text-blue-400 mb-2">Police Control Room</h4>
              <p className="text-sm text-gray-300">+91-80-2294-2444</p>
              <p className="text-sm text-gray-400">24/7 Emergency Response</p>
            </div>
            
            <div className="p-4 border border-gray-700 rounded-lg">
              <h4 className="font-medium text-red-400 mb-2">Fire Department</h4>
              <p className="text-sm text-gray-300">+91-80-2286-0000</p>
              <p className="text-sm text-gray-400">Fire & Rescue Services</p>
            </div>
            
            <div className="p-4 border border-gray-700 rounded-lg">
              <h4 className="font-medium text-green-400 mb-2">Medical Emergency</h4>
              <p className="text-sm text-gray-300">+91-80-2659-9999</p>
              <p className="text-sm text-gray-400">Ambulance Services</p>
            </div>
            
            <div className="p-4 border border-gray-700 rounded-lg">
              <h4 className="font-medium text-purple-400 mb-2">Event Command</h4>
              <p className="text-sm text-gray-300">+91-98765-43210</p>
              <p className="text-sm text-gray-400">Event Control Center</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}