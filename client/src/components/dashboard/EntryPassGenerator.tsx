import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import { QrCode, Download, Shield, Users, Clock, MapPin } from "lucide-react";

interface PassGenerationForm {
  eventId: number;
  numberOfPasses: number;
}

interface EntryPass {
  passId: string;
  qrCode: string;
  eventId: number;
  isValid: boolean;
  createdAt: string;
}

export default function EntryPassGenerator() {
  const [generatedPasses, setGeneratedPasses] = useState<EntryPass[]>([]);
  
  const form = useForm<PassGenerationForm>({
    defaultValues: {
      eventId: 1,
      numberOfPasses: 100,
    },
  });

  const generatePassesMutation = useMutation({
    mutationFn: async (data: PassGenerationForm) => {
      const response = await apiRequest("POST", `/api/events/${data.eventId}/entry-passes`, {
        numberOfPasses: data.numberOfPasses
      });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedPasses(data.passes);
    },
  });

  const onSubmit = (data: PassGenerationForm) => {
    generatePassesMutation.mutate(data);
  };

  const downloadPasses = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Pass ID,QR Code URL,Event ID,Valid,Created At\n" +
      generatedPasses.map(pass => 
        `${pass.passId},${pass.qrCode},${pass.eventId},${pass.isValid},${pass.createdAt}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `entry_passes_event_${form.getValues('eventId')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <QrCode className="mr-2" />
            Capacity-Based Entry Pass Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="eventId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event ID</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="Enter event ID"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="numberOfPasses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Entry Passes</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="Enter number of passes to generate"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                disabled={generatePassesMutation.isPending}
                className="w-full"
              >
                {generatePassesMutation.isPending ? "Generating Passes..." : "Generate Entry Passes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {generatedPasses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Entry Passes</span>
              <Button onClick={downloadPasses} size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-center">
                  <p className="text-green-600 font-medium">Total Generated</p>
                  <p className="text-2xl font-bold text-green-900">{generatedPasses.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-green-600 font-medium">Event ID</p>
                  <p className="text-2xl font-bold text-green-900">{form.getValues('eventId')}</p>
                </div>
                <div className="text-center">
                  <p className="text-green-600 font-medium">Status</p>
                  <Badge className="bg-green-100 text-green-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </div>

              {/* Pass Preview */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Pass Preview (First 5 passes)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {generatedPasses.slice(0, 6).map((pass, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="text-center space-y-3">
                        <div className="w-24 h-24 mx-auto bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
                          <img 
                            src={pass.qrCode} 
                            alt={`QR Code for ${pass.passId}`}
                            className="w-20 h-20"
                          />
                        </div>
                        
                        <div>
                          <p className="font-mono text-xs text-gray-600">{pass.passId}</p>
                          <Badge className="mt-1 bg-blue-100 text-blue-800">
                            <Clock className="w-3 h-3 mr-1" />
                            Valid
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          <p>Event #{pass.eventId}</p>
                          <p>{new Date(pass.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {generatedPasses.length > 6 && (
                  <p className="text-center text-sm text-gray-500">
                    ... and {generatedPasses.length - 6} more passes
                  </p>
                )}
              </div>

              {/* Instructions */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Usage Instructions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">For Event Organizers</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Distribute passes to attendees via email or mobile app</li>
                      <li>• Each pass contains a unique QR code for entry</li>
                      <li>• Passes are linked to the specific event and venue</li>
                      <li>• Monitor usage through the real-time dashboard</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2">For Security Personnel</h4>
                    <ul className="text-sm text-purple-800 space-y-1">
                      <li>• Scan QR codes at entry points using mobile app</li>
                      <li>• System validates pass in real-time</li>
                      <li>• Track crowd density automatically</li>
                      <li>• Alert if capacity limits are approached</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Geofencing Information */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Geofencing & Access Control
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-800">
                  <div>
                    <p className="font-medium mb-1">Entry Control Features:</p>
                    <ul className="space-y-1">
                      <li>• GPS-based venue boundary verification</li>
                      <li>• Time-based entry windows</li>
                      <li>• Capacity-based entry limiting</li>
                      <li>• Emergency evacuation tracking</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Real-time Monitoring:</p>
                    <ul className="space-y-1">
                      <li>• Live crowd density mapping</li>
                      <li>• Entry/exit flow analytics</li>
                      <li>• Automatic alerts for overcrowding</li>
                      <li>• Integration with emergency services</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}