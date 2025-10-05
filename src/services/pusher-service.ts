import Pusher from 'pusher-js';

class PusherService {
  private pusher: Pusher | null = null;
  private channels: Map<string, Pusher.Channel> = new Map();
  private eventHandlers: Map<string, Set<(data: any) => void>> = new Map();

  initialize() {
    if (!this.pusher) {
      this.pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY || '9f828d0b9f92d02a4ca9', {
        cluster: import.meta.env.VITE_PUSHER_CLUSTER || 'ap2',
        forceTLS: true,
        authEndpoint: `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/broadcasting/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || ''}`,
            Accept: 'application/json',
          },
        },
      });
    }
    return this.pusher;
  }

  private bindAllEventsToChannel(channel: Pusher.Channel) {
    this.eventHandlers.forEach((callbacks, eventName) => {
      callbacks.forEach(cb => channel.bind(eventName, cb));
    });
  }

  subscribe(channelName: string) {
    if (!this.pusher) this.initialize();
    if (!this.pusher) return null;

    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!;
    }

    const channel = this.pusher.subscribe(channelName);
    this.channels.set(channelName, channel);
    // Bind any previously registered handlers to this new channel
    this.bindAllEventsToChannel(channel);
    return channel;
  }

  subscribeMany(channelNames: string[]) {
    return channelNames.map(name => this.subscribe(name));
  }

  unsubscribe(channelName: string) {
    if (this.pusher && this.channels.has(channelName)) {
      const channel = this.channels.get(channelName)!;
      // Unbind all handlers from this channel before unsubscribing
      this.eventHandlers.forEach((_, eventName) => channel.unbind(eventName));
      this.pusher.unsubscribe(channelName);
      this.channels.delete(channelName);
    }
  }

  unsubscribeAll() {
    Array.from(this.channels.keys()).forEach(name => this.unsubscribe(name));
  }

  disconnect() {
    this.unsubscribeAll();
    if (this.pusher) {
      this.pusher.disconnect();
      this.pusher = null;
    }
  }

  bind(eventName: string, callback: (data: any) => void) {
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, new Set());
    }
    this.eventHandlers.get(eventName)!.add(callback);
    // Bind to all existing channels
    this.channels.forEach(channel => channel.bind(eventName, callback));
  }

  unbind(eventName: string, callback?: (data: any) => void) {
    if (callback) {
      const set = this.eventHandlers.get(eventName);
      if (set) {
        set.delete(callback);
      }
      this.channels.forEach(channel => channel.unbind(eventName, callback as any));
    } else {
      this.eventHandlers.delete(eventName);
      this.channels.forEach(channel => channel.unbind(eventName));
    }
  }
}

export const pusherService = new PusherService();
