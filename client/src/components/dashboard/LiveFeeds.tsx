import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Users, Maximize, Volume2, AlertTriangle, Eye, Settings } from "lucide-react";

interface LiveFeed {
  id: number;
  name: string;
  location: string;
  status: string;
  viewerCount: number;
  alertLevel: string;
  streamUrl: string;
}

export default function LiveFeeds() {
  const { data: feeds, isLoading } = useQuery({
    queryKey: ["/api/feeds/live"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const getAlertColor = (level: string) => {
    switch (level) {
      case "critical": return "bg-red-600 text-white";
      case "warning": return "bg-yellow-600 text-white";
      case "normal": return "bg-green-600 text-white";
      default: return "bg-gray-600 text-white";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "offline": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "maintenance": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-700 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                <div className="h-3 bg-gray-700 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Feeds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(feeds) && feeds.map((feed: LiveFeed) => (
          <Card key={feed.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Camera className="mr-2 h-4 w-4" />
                  {feed.name}
                </CardTitle>
                <Badge className={getStatusColor(feed.status)}>
                  {feed.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-400">{feed.location}</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Video Preview */}
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="h-12 w-12 mx-auto mb-2 text-gray-600" />
                    <p className="text-sm text-gray-400">Live Video Feed</p>
                    <p className="text-xs text-gray-500">{feed.streamUrl}</p>
                  </div>
                </div>
                
                {/* Alert Overlay */}
                {feed.alertLevel !== "normal" && (
                  <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs ${getAlertColor(feed.alertLevel)}`}>
                    <AlertTriangle className="h-3 w-3 inline mr-1" />
                    {feed.alertLevel.toUpperCase()}
                  </div>
                )}
                
                {/* Viewer Count */}
                <div className="absolute bottom-2 right-2 bg-black/50 px-2 py-1 rounded text-xs flex items-center">
                  <Eye className="h-3 w-3 mr-1" />
                  {feed.viewerCount}
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Maximize className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Volume2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-400">{feed.viewerCount} viewers</span>
                </div>
              </div>

              {/* Feed Details */}
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>Resolution:</span>
                  <span>1920x1080</span>
                </div>
                <div className="flex justify-between">
                  <span>Frame Rate:</span>
                  <span>30 FPS</span>
                </div>
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span>24h 15m</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feed Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Feed Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
              <Camera className="h-5 w-5 mb-1" />
              Add Camera
            </Button>
            
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
              <Eye className="h-5 w-5 mb-1" />
              View All
            </Button>
            
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
              <Settings className="h-5 w-5 mb-1" />
              Configure
            </Button>
            
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
              <AlertTriangle className="h-5 w-5 mb-1" />
              Alerts
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feed Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Feed Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border border-gray-700 rounded">
              <div className="text-2xl font-bold text-green-400">
                {Array.isArray(feeds) ? feeds.filter((f: LiveFeed) => f.status === 'active').length : 0}
              </div>
              <div className="text-sm text-gray-400">Active Feeds</div>
            </div>
            
            <div className="text-center p-4 border border-gray-700 rounded">
              <div className="text-2xl font-bold text-blue-400">
                {Array.isArray(feeds) ? feeds.reduce((sum: number, f: LiveFeed) => sum + f.viewerCount, 0) : 0}
              </div>
              <div className="text-sm text-gray-400">Total Viewers</div>
            </div>
            
            <div className="text-center p-4 border border-gray-700 rounded">
              <div className="text-2xl font-bold text-yellow-400">
                {Array.isArray(feeds) ? feeds.filter((f: LiveFeed) => f.alertLevel === 'warning').length : 0}
              </div>
              <div className="text-sm text-gray-400">Warnings</div>
            </div>
            
            <div className="text-center p-4 border border-gray-700 rounded">
              <div className="text-2xl font-bold text-red-400">
                {Array.isArray(feeds) ? feeds.filter((f: LiveFeed) => f.alertLevel === 'critical').length : 0}
              </div>
              <div className="text-sm text-gray-400">Critical Alerts</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}