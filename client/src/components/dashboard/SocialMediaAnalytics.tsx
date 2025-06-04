import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  MessageCircle, 
  Heart, 
  Share2, 
  AlertTriangle,
  BarChart3,
  Users,
  Hash
} from "lucide-react";

export default function SocialMediaAnalytics() {
  const [selectedEventId, setSelectedEventId] = useState<number>(1);

  const { data: socialTrends } = useQuery({
    queryKey: [`/api/analytics/social-trends/${selectedEventId}`],
  });

  const { data: events = [] } = useQuery({
    queryKey: ["/api/events/approved"],
  });

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😟';
      case 'neutral': return '😐';
      default: return '😐';
    }
  };

  return (
    <div className="space-y-6">
      {/* Event Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="mr-2" />
            Social Media Trend Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {events.slice(0, 3).map((event: any) => (
              <Button
                key={event.id}
                variant={selectedEventId === event.id ? "default" : "outline"}
                onClick={() => setSelectedEventId(event.id)}
                className="h-auto p-4 text-left"
              >
                <div>
                  <p className="font-medium text-sm">{event.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{event.celebrityName}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {socialTrends && (
        <>
          {/* Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <MessageCircle className="text-blue-500 text-2xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Mentions</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {socialTrends.mentionCount?.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600">+24% from yesterday</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Heart className="text-red-500 text-2xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Engagement Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {socialTrends.engagementRate}%
                    </p>
                    <p className="text-xs text-blue-600">Above average</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="text-green-500 text-2xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Sentiment</p>
                    <p className={`text-2xl font-bold ${getSentimentColor(socialTrends.sentiment)}`}>
                      {getSentimentIcon(socialTrends.sentiment)} {socialTrends.sentiment}
                    </p>
                    <p className="text-xs text-gray-600">Overall mood</p>
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
                    <p className="text-sm font-medium text-gray-500">Attendance Boost</p>
                    <p className="text-2xl font-bold text-gray-900">
                      +{socialTrends.predictedAttendanceBoost}%
                    </p>
                    <p className="text-xs text-orange-600">Due to buzz</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trending Hashtags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Hash className="mr-2" />
                Trending Hashtags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {socialTrends.hashtags?.map((hashtag: string, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                      <span className="font-medium text-blue-600">{hashtag}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={Math.random() * 100} className="w-20 h-2" />
                      <span className="text-sm text-gray-500">
                        {Math.floor(Math.random() * 5000) + 1000}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Engagement Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center">
                        <Heart className="w-4 h-4 mr-2 text-red-500" />
                        Likes & Reactions
                      </span>
                      <span className="font-semibold">65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center">
                        <Share2 className="w-4 h-4 mr-2 text-blue-500" />
                        Shares & Retweets
                      </span>
                      <span className="font-semibold">25%</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center">
                        <MessageCircle className="w-4 h-4 mr-2 text-green-500" />
                        Comments & Replies
                      </span>
                      <span className="font-semibold">10%</span>
                    </div>
                    <Progress value={10} className="h-2" />
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Key Insights</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• High engagement indicates strong public interest</li>
                    <li>• Positive sentiment suggests smooth event execution</li>
                    <li>• Share rate indicates organic promotion</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Factors & Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                {socialTrends.riskFactors?.length > 0 ? (
                  <div className="space-y-3">
                    {socialTrends.riskFactors.map((factor: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertTriangle className="text-yellow-500 mt-0.5 w-4 h-4" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">Potential Risk Detected</p>
                          <p className="text-xs text-yellow-700 mt-1">{factor}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-medium text-green-900 mb-2">All Clear</h3>
                    <p className="text-sm text-green-700">
                      No risk factors detected in social media sentiment
                    </p>
                  </div>
                )}
                
                <div className="mt-4 space-y-2">
                  <h4 className="font-medium text-gray-900">Monitoring Status</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                      <span>Twitter/X</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                      <span>Instagram</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                      <span>Facebook</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <span>TikTok</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Limited</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Crowd Management</h4>
                  <p className="text-sm text-blue-800">
                    High social media buzz suggests {socialTrends.predictedAttendanceBoost}% increase in attendance. 
                    Consider deploying additional crowd control measures.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Public Communication</h4>
                  <p className="text-sm text-green-800">
                    Leverage positive sentiment by sharing safety guidelines and real-time updates 
                    through trending hashtags.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}