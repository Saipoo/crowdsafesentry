import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import { MapPin, Users, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface CapacityCheckForm {
  location: string;
  expectedAttendance: number;
}

export default function VenueCapacityChecker() {
  const [result, setResult] = useState<any>(null);
  
  const form = useForm<CapacityCheckForm>({
    defaultValues: {
      location: "",
      expectedAttendance: 0,
    },
  });

  const capacityCheckMutation = useMutation({
    mutationFn: async (data: CapacityCheckForm) => {
      const response = await apiRequest("POST", "/api/venues/capacity-check", data);
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const onSubmit = (data: CapacityCheckForm) => {
    capacityCheckMutation.mutate(data);
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'overcrowded': return 'bg-red-100 text-red-800 border-red-200';
      case 'high_utilization': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'safe': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'overcrowded': return <AlertTriangle className="w-4 h-4" />;
      case 'high_utilization': return <Info className="w-4 h-4" />;
      case 'safe': return <CheckCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getRecommendationText = (recommendation: string) => {
    switch (recommendation) {
      case 'overcrowded': return 'Venue Overcrowded - Consider Alternative';
      case 'high_utilization': return 'High Capacity Usage - Monitor Closely';
      case 'safe': return 'Safe Capacity Level';
      case 'venue_verification_needed': return 'Venue Verification Required';
      default: return 'Assessment Complete';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2" />
            Venue Capacity and Suitability Checker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue Location</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter venue address or name (e.g., Brigade Road, MG Road Stadium)"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="expectedAttendance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Attendance</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="Enter expected number of attendees"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                disabled={capacityCheckMutation.isPending}
                className="w-full"
              >
                {capacityCheckMutation.isPending ? "Checking Capacity..." : "Check Venue Capacity"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Capacity Assessment Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Recommendation Badge */}
            <div className="flex items-center justify-center">
              <Badge className={`${getRecommendationColor(result.recommendation)} px-4 py-2 text-sm font-medium`}>
                {getRecommendationIcon(result.recommendation)}
                <span className="ml-2">{getRecommendationText(result.recommendation)}</span>
              </Badge>
            </div>

            {/* Venue Information */}
            {result.venue ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Venue Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{result.venue.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{result.venue.venueType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max Capacity:</span>
                      <span className="font-medium">{result.venue.maxCapacity.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Safe Capacity:</span>
                      <span className="font-medium">{result.venue.safeCapacity.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Capacity Analysis</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Utilization Rate</span>
                        <span className="font-medium">{Math.round(result.utilizationPercentage)}%</span>
                      </div>
                      <Progress 
                        value={result.utilizationPercentage} 
                        className="h-3"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-blue-600 font-medium">Expected</p>
                        <p className="text-lg font-bold text-blue-900">
                          {form.getValues('expectedAttendance').toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-green-600 font-medium">Available</p>
                        <p className="text-lg font-bold text-green-900">
                          {(result.venue.maxCapacity - form.getValues('expectedAttendance')).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <h3 className="font-medium text-yellow-800">Venue Not Found in Database</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Using estimated capacity of {result.estimatedCapacity?.toLocaleString()} people
                  </p>
                  <p className="text-xs text-yellow-600 mt-2">
                    For accurate assessment, this venue needs to be verified and added to our database
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Estimated Analysis</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Estimated Utilization:</span>
                    <span className="font-bold text-blue-900">{Math.round(result.utilizationPercentage)}%</span>
                  </div>
                  <Progress 
                    value={result.utilizationPercentage} 
                    className="h-2 mt-2"
                  />
                </div>
              </div>
            )}

            {/* Safety Recommendations */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Safety Recommendations</h3>
              <div className="space-y-2">
                {result.recommendation === 'overcrowded' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Consider splitting the event into multiple sessions</li>
                      <li>• Implement strict entry controls with advance registration</li>
                      <li>• Deploy additional crowd management personnel</li>
                      <li>• Prepare emergency evacuation plans</li>
                    </ul>
                  </div>
                )}
                
                {result.recommendation === 'high_utilization' && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Monitor crowd density throughout the event</li>
                      <li>• Implement controlled entry timing</li>
                      <li>• Prepare contingency plans for crowd overflow</li>
                      <li>• Ensure clear emergency exit signage</li>
                    </ul>
                  </div>
                )}
                
                {result.recommendation === 'safe' && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Venue capacity is within safe limits</li>
                      <li>• Standard crowd management protocols sufficient</li>
                      <li>• Regular monitoring recommended during peak hours</li>
                      <li>• Emergency services on standby as precaution</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button variant="outline" className="flex-1">
                <MapPin className="w-4 h-4 mr-2" />
                View Venue Details
              </Button>
              <Button variant="outline" className="flex-1">
                <Users className="w-4 h-4 mr-2" />
                Generate Entry Passes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}