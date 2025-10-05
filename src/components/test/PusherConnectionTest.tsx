import React, { useState, useEffect } from 'react';
import Pusher from 'pusher-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TokenManager } from '@/services/apis';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Radio, Send, Activity, Wifi, WifiOff } from 'lucide-react';

interface ConnectionStatus {
  connected: boolean;
  state: string;
  socketId: string | null;
}

interface TestEvent {
  timestamp: string;
  channel: string;
  event: string;
  data: any;
  type: 'sent' | 'received';
}

export const PusherConnectionTest: React.FC = () => {
  const [pusher, setPusher] = useState<Pusher | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    state: 'disconnected',
    socketId: null
  });
  const [testChannel, setTestChannel] = useState('test-channel');
  const [testEvent, setTestEvent] = useState('test-event');
  const [testData, setTestData] = useState('{"message": "Hello from test!"}');
  const [events, setEvents] = useState<TestEvent[]>([]);
  const [subscribedChannels, setSubscribedChannels] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialize Pusher connection
  useEffect(() => {
    try {
      const pusherKey = import.meta.env.VITE_PUSHER_KEY || '9f828d0b9f92d02a4ca9';
      const pusherCluster = import.meta.env.VITE_PUSHER_CLUSTER || 'ap2';

      console.log('🔄 Initializing Pusher with:', { key: pusherKey, cluster: pusherCluster });

      const pusherInstance = new Pusher(pusherKey, {
        cluster: pusherCluster,
        forceTLS: true,
        enabledTransports: ['ws', 'wss'],
        disabledTransports: [],
        authEndpoint: `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/broadcasting/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${TokenManager.getToken() || ''}`,
            Accept: 'application/json',
          },
        },
      });

      // Connection state events
      pusherInstance.connection.bind('state_change', (states: any) => {
        console.log('🔄 Connection state changed:', states);
        setConnectionStatus({
          connected: states.current === 'connected',
          state: states.current,
          socketId: pusherInstance.connection.socket_id
        });
      });

      pusherInstance.connection.bind('connected', () => {
        console.log('✅ Pusher connected!');
        setError(null);
        addEvent('system', 'connected', { socketId: pusherInstance.connection.socket_id }, 'received');
      });

      pusherInstance.connection.bind('disconnected', () => {
        console.log('❌ Pusher disconnected');
        addEvent('system', 'disconnected', {}, 'received');
      });

      pusherInstance.connection.bind('error', (err: any) => {
        console.error('❌ Pusher connection error:', err);
        setError(`Connection error: ${err.error?.message || err.message || 'Unknown error'}`);
        addEvent('system', 'error', { error: err }, 'received');
      });

      setPusher(pusherInstance);

      return () => {
        pusherInstance.disconnect();
      };
    } catch (err: any) {
      console.error('❌ Failed to initialize Pusher:', err);
      setError(`Failed to initialize: ${err.message}`);
    }
  }, []);

  const addEvent = (channel: string, event: string, data: any, type: 'sent' | 'received') => {
    const newEvent: TestEvent = {
      timestamp: new Date().toLocaleTimeString(),
      channel,
      event,
      data,
      type
    };
    setEvents(prev => [newEvent, ...prev].slice(0, 50)); // Keep last 50 events
  };

  const subscribeToChannel = () => {
    if (!pusher || !testChannel.trim()) return;

    try {
      const channel = pusher.subscribe(testChannel);

      channel.bind('pusher:subscription_succeeded', (members?: any) => {
        console.log(`✅ Successfully subscribed to: ${testChannel}`);
        setSubscribedChannels(prev => [...new Set([...prev, testChannel])]);
        addEvent(testChannel, 'subscription_succeeded', members ? { members } : {}, 'received');
      });

      channel.bind('pusher:subscription_error', (err: any) => {
        console.error(`❌ Subscription error for ${testChannel}:`, err);
        setError(`Subscription error: ${err.error || 'Unknown error'}`);
        addEvent(testChannel, 'subscription_error', { error: err }, 'received');
      });

      // Bind to all events on this channel
      channel.bind_global((eventName: string, data: any) => {
        if (!eventName.startsWith('pusher:')) {
          console.log(`📨 Received event on ${testChannel}:`, { event: eventName, data });
          addEvent(testChannel, eventName, data, 'received');
        }
      });

      addEvent(testChannel, 'subscribe_attempt', {}, 'sent');
    } catch (err: any) {
      setError(`Subscribe error: ${err.message}`);
    }
  };

  const unsubscribeFromChannel = (channelName: string) => {
    if (!pusher) return;

    try {
      pusher.unsubscribe(channelName);
      setSubscribedChannels(prev => prev.filter(ch => ch !== channelName));
      addEvent(channelName, 'unsubscribed', {}, 'sent');
      console.log(`🔄 Unsubscribed from: ${channelName}`);
    } catch (err: any) {
      setError(`Unsubscribe error: ${err.message}`);
    }
  };

  const simulateEvent = () => {
    try {
      const data = JSON.parse(testData);
      // Note: This is just for logging - real events come from the server
      addEvent(testChannel, testEvent, data, 'sent');
      console.log('📤 Simulated event (Note: Real events must come from server):', {
        channel: testChannel,
        event: testEvent,
        data
      });
    } catch (err) {
      setError('Invalid JSON in test data');
    }
  };

  const testPublicChannel = () => {
    if (!pusher) return;
    
    const publicTestChannel = 'test-public-channel';
    setTestChannel(publicTestChannel);
    
    const channel = pusher.subscribe(publicTestChannel);
    
    channel.bind('pusher:subscription_succeeded', () => {
      addEvent(publicTestChannel, 'subscription_succeeded', { message: 'Public channel test successful!' }, 'received');
    });
  };

  const getStatusColor = (state: string) => {
    switch (state) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'disconnected': return 'bg-red-500';
      case 'failed': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (connected: boolean) => {
    return connected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Pusher Connection Test</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(connectionStatus.connected)}
            Connection Status
          </CardTitle>
          <CardDescription>Current Pusher connection state and details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Badge 
              variant={connectionStatus.connected ? "default" : "destructive"}
              className={`${getStatusColor(connectionStatus.state)} text-white`}
            >
              {connectionStatus.state.toUpperCase()}
            </Badge>
            {connectionStatus.socketId && (
              <span className="text-sm text-muted-foreground">
                Socket ID: {connectionStatus.socketId}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Pusher Key:</span>
              <br />
              <span className="text-muted-foreground">
                {import.meta.env.VITE_PUSHER_KEY || '9f828d0b9f92d02a4ca9'}
              </span>
            </div>
            <div>
              <span className="font-medium">Cluster:</span>
              <br />
              <span className="text-muted-foreground">
                {import.meta.env.VITE_PUSHER_CLUSTER || 'ap2'}
              </span>
            </div>
          </div>

          <Button 
            onClick={testPublicChannel} 
            disabled={!connectionStatus.connected}
            className="w-full"
          >
            <Radio className="h-4 w-4 mr-2" />
            Test Public Channel Connection
          </Button>
        </CardContent>
      </Card>

      {/* Channel Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Channel Subscription Test</CardTitle>
          <CardDescription>Subscribe to channels and test event listening</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="channel">Channel Name</Label>
              <Input
                id="channel"
                value={testChannel}
                onChange={(e) => setTestChannel(e.target.value)}
                placeholder="test-channel"
                disabled={!connectionStatus.connected}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={subscribeToChannel}
                disabled={!connectionStatus.connected || !testChannel.trim()}
              >
                Subscribe
              </Button>
            </div>
          </div>

          {subscribedChannels.length > 0 && (
            <div>
              <Label>Subscribed Channels:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {subscribedChannels.map(channel => (
                  <Badge 
                    key={channel} 
                    variant="secondary" 
                    className="cursor-pointer"
                    onClick={() => unsubscribeFromChannel(channel)}
                  >
                    {channel} ✕
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Simulation */}
      <Card>
        <CardHeader>
          <CardTitle>Event Simulation</CardTitle>
          <CardDescription>Simulate events for testing (Note: Real events must come from your backend)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="event">Event Name</Label>
              <Input
                id="event"
                value={testEvent}
                onChange={(e) => setTestEvent(e.target.value)}
                placeholder="test-event"
              />
            </div>
            <div>
              <Label htmlFor="data">Event Data (JSON)</Label>
              <Textarea
                id="data"
                value={testData}
                onChange={(e) => setTestData(e.target.value)}
                placeholder='{"message": "Hello!"}'
                rows={3}
              />
            </div>
          </div>
          <Button 
            onClick={simulateEvent}
            disabled={!testEvent.trim()}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            Simulate Event (Log Only)
          </Button>
        </CardContent>
      </Card>

      {/* Event Log */}
      <Card>
        <CardHeader>
          <CardTitle>Event Log</CardTitle>
          <CardDescription>Real-time log of all Pusher events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {events.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No events yet...</p>
            ) : (
              events.map((event, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded border-l-4 ${
                    event.type === 'received' 
                      ? 'border-l-green-500 bg-green-50 dark:bg-green-950' 
                      : 'border-l-blue-500 bg-blue-50 dark:bg-blue-950'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {event.type === 'received' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Send className="h-4 w-4 text-blue-600" />
                      )}
                      <span className="font-medium">{event.channel}</span>
                      <Badge variant="outline" className="text-xs">
                        {event.event}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{event.timestamp}</span>
                  </div>
                  <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
                    {JSON.stringify(event.data, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
