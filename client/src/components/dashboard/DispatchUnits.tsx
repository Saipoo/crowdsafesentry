import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import { 
  Car, Users, Shield, Truck, Ambulance, 
  MapPin, Clock, Radio, CheckCircle, AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DispatchForm {
  eventId?: number;
  unitType: string;
  quantity: number;
  location: string;
  priority: string;
}

interface DispatchedUnit {
  id: number;
  unitType: string;
  quantity: number;
  location: string;
  priority: string;
  status: string;
  estimatedArrival: string;
  dispatchedAt: string;
}

export default function DispatchUnits() {
  const { toast } = useToast();
  const [dispatchedUnits, setDispatchedUnits] = useState<DispatchedUnit[]>([]);
  
  const form = useForm<DispatchForm>({
    defaultValues: {
      unitType: "patrol",
      quantity: 2,
      location: "",
      priority: "medium"
    },
  });

  const { data: events } = useQuery({
    queryKey: ["/api/events/approved"],
  });

  const dispatchMutation = useMutation({
    mutationFn: async (data: DispatchForm) => {
      const response = await apiRequest("POST", "/api/dispatch/units", data);
      return response.json();
    },
    onSuccess: (data) => {
      setDispatchedUnits(prev => [...prev, data.dispatch]);
      toast({
        title: "Units Dispatched",
        description: data.message,
        variant: "default",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Dispatch Failed",
        description: "Failed to dispatch units. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DispatchForm) => {
    dispatchMutation.mutate(data);
  };

  const unitTypes = [
    { value: "patrol", label: "Patrol Units", icon: Car, description: "Mobile patrol vehicles" },
    { value: "crowd_control", label: "Crowd Control", icon: Users, description: "Crowd management teams" },
    { value: "security", label: "Security Teams", icon: Shield, description: "Armed security personnel" },
    { value: "emergency", label: "Emergency Response", icon: Truck, description: "Emergency response teams" },
    { value: "medical", label: "Medical Teams", icon: Ambulance, description: "Paramedics and medical staff" }
  ];

  const getUnitIcon = (type: string) => {
    const unit = unitTypes.find(u => u.value === type);
    return unit ? unit.icon : Car;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "text-red-400 bg-red-900/30";
      case "high": return "text-orange-400 bg-orange-900/30";
      case "medium": return "text-yellow-400 bg-yellow-900/30";
      case "low": return "text-green-400 bg-green-900/30";
      default: return "text-gray-400 bg-gray-900/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Dispatch */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Radio className="mr-2 h-5 w-5" />
            Quick Dispatch
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {unitTypes.map((unit) => (
              <Button
                key={unit.value}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => {
                  form.setValue("unitType", unit.value);
                  form.setValue("quantity", 2);
                  form.setValue("priority", "high");
                }}
              >
                <unit.icon className="h-6 w-6" />
                <span className="text-xs text-center">{unit.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dispatch Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="mr-2 h-5 w-5" />
            Dispatch Units
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="unitType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {unitTypes.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Units</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="1"
                          max="20"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
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

                <FormField
                  control={form.control}
                  name="eventId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event (Optional)</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select event" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">No specific event</SelectItem>
                          {Array.isArray(events) && events.map((event: any) => (
                            <SelectItem key={event.id} value={event.id.toString()}>
                              {event.title}
                            </SelectItem>
                          ))}
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
                    <FormLabel>Deployment Location</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter specific location for unit deployment"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={dispatchMutation.isPending}
                className="w-full"
              >
                {dispatchMutation.isPending ? "Dispatching..." : "Dispatch Units"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Active Deployments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Active Deployments
            </span>
            <span className="text-sm text-gray-400">
              {dispatchedUnits.filter(u => u.status === 'dispatched').length} Active
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dispatchedUnits.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Radio className="h-12 w-12 mx-auto mb-4 text-gray-600" />
              <p>No units currently dispatched</p>
              <p className="text-sm">Use the form above to dispatch units</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dispatchedUnits.map((unit) => {
                const Icon = getUnitIcon(unit.unitType);
                return (
                  <div key={unit.id} className="border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5 text-blue-400" />
                        <div>
                          <h4 className="font-medium">
                            {unit.quantity}x {unitTypes.find(u => u.value === unit.unitType)?.label}
                          </h4>
                          <p className="text-sm text-gray-400">{unit.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(unit.priority)}`}>
                          {unit.priority.toUpperCase()}
                        </span>
                        <span className="flex items-center text-green-400 text-sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {unit.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-yellow-400" />
                        <span>ETA: {new Date(unit.estimatedArrival).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-red-400" />
                        <span>Location: {unit.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Radio className="h-4 w-4 text-green-400" />
                        <span>Status: Active</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-orange-400" />
                        <span>Priority: {unit.priority}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unit Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border border-gray-700 rounded">
              <div className="text-2xl font-bold text-blue-400">
                {dispatchedUnits.reduce((sum, unit) => sum + unit.quantity, 0)}
              </div>
              <div className="text-sm text-gray-400">Total Units</div>
            </div>
            
            <div className="text-center p-4 border border-gray-700 rounded">
              <div className="text-2xl font-bold text-green-400">
                {dispatchedUnits.filter(u => u.status === 'dispatched').length}
              </div>
              <div className="text-sm text-gray-400">Active</div>
            </div>
            
            <div className="text-center p-4 border border-gray-700 rounded">
              <div className="text-2xl font-bold text-yellow-400">
                {dispatchedUnits.filter(u => u.priority === 'high' || u.priority === 'critical').length}
              </div>
              <div className="text-sm text-gray-400">High Priority</div>
            </div>
            
            <div className="text-center p-4 border border-gray-700 rounded">
              <div className="text-2xl font-bold text-purple-400">
                {new Set(dispatchedUnits.map(u => u.location)).size}
              </div>
              <div className="text-sm text-gray-400">Locations</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}