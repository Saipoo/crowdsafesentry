import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { Bot, Send, User, AlertTriangle, Clock, MapPin } from "lucide-react";

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  message: string;
  timestamp: Date;
}

export default function AIChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      message: 'Hello! I\'m your CrowdSafe AI assistant. I can help you with event safety questions, crowd management guidelines, and platform features. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');

  const chatMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest("POST", "/api/chatbot", { query });
      return response.json();
    },
    onSuccess: (data) => {
      const botResponse: ChatMessage = {
        id: Date.now().toString() + '_bot',
        type: 'bot',
        message: data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    },
    onError: () => {
      const errorResponse: ChatMessage = {
        id: Date.now().toString() + '_error',
        type: 'bot',
        message: 'Sorry, I\'m experiencing technical difficulties. Please try again later or contact support.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString() + '_user',
      type: 'user',
      message: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(currentMessage);
    setCurrentMessage('');
  };

  const quickQuestions = [
    "How do I check if an event is safe to attend?",
    "What are the emergency contact numbers?",
    "How does crowd prediction work?",
    "What should I do in case of emergency?",
    "How to submit an event request?",
    "What are the safety guidelines for events?"
  ];

  const handleQuickQuestion = (question: string) => {
    setCurrentMessage(question);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="mr-2 text-primary" />
            AI Safety Assistant
            <Badge className="ml-2 bg-green-100 text-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
              Online
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Chat Messages */}
          <div className="h-80 overflow-y-auto space-y-4 mb-4 p-4 border rounded-lg bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                  msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.type === 'user' 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {msg.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-3 rounded-lg ${
                    msg.type === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-white border'
                  }`}>
                    <p className="text-sm">{msg.message}</p>
                    <p className={`text-xs mt-1 ${
                      msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3 rounded-lg bg-white border">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Questions */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Quick Questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickQuestion(question)}
                  className="text-xs"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Ask me about event safety, crowd management, or platform features..."
              disabled={chatMutation.isPending}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={chatMutation.isPending || !currentMessage.trim()}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-3 text-xs text-gray-500">
            <p>💡 I can help with safety guidelines, event information, emergency procedures, and more.</p>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="mr-2" />
            Emergency Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="destructive" className="h-auto p-4 flex flex-col items-center space-y-2">
              <AlertTriangle className="w-6 h-6" />
              <span className="font-medium">Panic Button</span>
              <span className="text-xs">Immediate Emergency</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 border-orange-200 text-orange-600 hover:bg-orange-50">
              <Clock className="w-6 h-6" />
              <span className="font-medium">Report Incident</span>
              <span className="text-xs">Non-Emergency Issue</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 border-blue-200 text-blue-600 hover:bg-blue-50">
              <MapPin className="w-6 h-6" />
              <span className="font-medium">Find Help</span>
              <span className="text-xs">Locate Services</span>
            </Button>
          </div>
          
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-800 mb-1">Emergency Contacts</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-red-600">100</p>
                <p className="text-xs text-red-700">Police</p>
              </div>
              <div>
                <p className="text-lg font-bold text-red-600">108</p>
                <p className="text-xs text-red-700">Ambulance</p>
              </div>
              <div>
                <p className="text-lg font-bold text-red-600">101</p>
                <p className="text-xs text-red-700">Fire</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}