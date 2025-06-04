import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, MapPin, Phone, Users, Clock, Route, 
  AlertTriangle, Heart, Car, Download, Eye
} from "lucide-react";

interface SafetyPlanProps {
  eventId: number;
}

interface EvacuationRoute {
  id: number;
  name: string;
  capacity: number;
  estimatedTime: string;
  status: string;
}

interface EmergencyContact {
  role: string;
  name: string;
  phone: string;
}

interface MedicalStation {
  id: number;
  location: string;
  capacity: number;
  staff: number;
}

interface SafetyPlan {
  eventId: number;
  eventTitle: string;
  evacuationRoutes: EvacuationRoute[];
  emergencyContacts: EmergencyContact[];
  medicalStations: MedicalStation[];
  securityDeployment: {
    totalOfficers: number;
    plainClothes: number;
    uniformed: number;
    specialForces: number;
  };
}

export default function SafetyPlan({ eventId }: SafetyPlanProps) {
  const { data: safetyPlan, isLoading } = useQuery({
    queryKey: [`/api/safety/plan/${eventId}`],
    enabled: !!eventId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-700 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!safetyPlan) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Shield className="h-12 w-12 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">No safety plan available for this event</p>
          <Button className="mt-4">Generate Safety Plan</Button>
        </CardContent>
      </Card>
    );
  }

  const plan = safetyPlan as SafetyPlan;

  return (
    <div className="space-y-6">
      {/* Safety Plan Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Safety Plan: {plan.eventTitle}
            </CardTitle>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 border border-gray-700 rounded">
              <div className="text-xl font-bold text-blue-400">{plan.evacuationRoutes.length}</div>
              <div className="text-sm text-gray-400">Evacuation Routes</div>
            </div>
            <div className="text-center p-3 border border-gray-700 rounded">
              <div className="text-xl font-bold text-green-400">{plan.medicalStations.length}</div>
              <div className="text-sm text-gray-400">Medical Stations</div>
            </div>
            <div className="text-center p-3 border border-gray-700 rounded">
              <div className="text-xl font-bold text-purple-400">{plan.securityDeployment.totalOfficers}</div>
              <div className="text-sm text-gray-400">Security Officers</div>
            </div>
            <div className="text-center p-3 border border-gray-700 rounded">
              <div className="text-xl font-bold text-yellow-400">{plan.emergencyContacts.length}</div>
              <div className="text-sm text-gray-400">Emergency Contacts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evacuation Routes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Route className="mr-2 h-5 w-5" />
            Evacuation Routes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.evacuationRoutes.map((route) => (
              <div key={route.id} className="border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-blue-400">{route.name}</h4>
                  <Badge className={route.status === 'clear' ? 'bg-green-600' : 'bg-red-600'}>
                    {route.status}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-gray-400">
                      <Users className="h-4 w-4 mr-2" />
                      Capacity:
                    </span>
                    <span>{route.capacity.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-gray-400">
                      <Clock className="h-4 w-4 mr-2" />
                      Est. Time:
                    </span>
                    <span>{route.estimatedTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
            {plan.emergencyContacts.map((contact, index) => (
              <div key={index} className="border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-purple-400">{contact.role}</h4>
                  <Button size="sm" variant="outline">
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-1 text-sm">
                  <p className="text-gray-300">{contact.name}</p>
                  <p className="text-gray-400">{contact.phone}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Medical Stations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="mr-2 h-5 w-5" />
            Medical Stations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plan.medicalStations.map((station) => (
              <div key={station.id} className="border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-red-400">Station #{station.id}</h4>
                  <Badge className="bg-green-600">Active</Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{station.location}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Capacity:</span>
                    <span>{station.capacity}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Staff:</span>
                    <span>{station.staff}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Deployment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Security Deployment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border border-gray-700 rounded">
              <div className="text-2xl font-bold text-blue-400">
                {plan.securityDeployment.totalOfficers}
              </div>
              <div className="text-sm text-gray-400">Total Officers</div>
            </div>
            
            <div className="text-center p-4 border border-gray-700 rounded">
              <div className="text-2xl font-bold text-green-400">
                {plan.securityDeployment.uniformed}
              </div>
              <div className="text-sm text-gray-400">Uniformed</div>
            </div>
            
            <div className="text-center p-4 border border-gray-700 rounded">
              <div className="text-2xl font-bold text-yellow-400">
                {plan.securityDeployment.plainClothes}
              </div>
              <div className="text-sm text-gray-400">Plain Clothes</div>
            </div>
            
            <div className="text-center p-4 border border-gray-700 rounded">
              <div className="text-2xl font-bold text-red-400">
                {plan.securityDeployment.specialForces}
              </div>
              <div className="text-sm text-gray-400">Special Forces</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Safety Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Safety Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              "All evacuation routes verified and clear",
              "Medical stations fully staffed and equipped",
              "Emergency contacts confirmed and available",
              "Security personnel deployed to positions",
              "Communication systems tested and operational",
              "Crowd barriers and signage installed",
              "Emergency vehicles positioned strategically"
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}