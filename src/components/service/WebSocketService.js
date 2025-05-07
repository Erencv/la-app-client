import axios from 'axios';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { apiEndpoint } from '../../constants/apiEndpoint';

class WebSocketService {
    constructor() {
        this.stompClient = null;
        this.subscriptions = new Map();
    }

    connectWebSocket(authToken) {
        // Disconnect existing connection if any
        if (this.stompClient) {
            this.disconnect();
        }

        // Create new connection
        const socket = new SockJS(`${apiEndpoint}/ws`);
        this.stompClient = Stomp.over(socket);
        
        // Configure connection with auth token
        this.stompClient.connect(
            { 'Authorization': `Bearer ${authToken}` },
            () => {
                console.log('WebSocket connected');
            },
            (error) => {
                console.error('WebSocket connection error:', error);
            }
        );
        
        return this.stompClient;
    }

    subscribe(topic, callback) {
        if (!this.stompClient || !this.stompClient.connected) {
            console.error('WebSocket not connected');
            return null;
        }

        // Subscribe to the topic
        const subscription = this.stompClient.subscribe(topic, (message) => {
            const parsedBody = JSON.parse(message.body);
            callback(parsedBody);
        });

        // Store subscription for later cleanup
        this.subscriptions.set(topic, subscription);
        return subscription;
    }

    unsubscribe(topic) {
        const subscription = this.subscriptions.get(topic);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(topic);
        }
    }

    disconnect() {
        if (this.stompClient) {
            // Unsubscribe from all topics
            this.subscriptions.forEach((subscription) => {
                subscription.unsubscribe();
            });
            this.subscriptions.clear();

            // Disconnect the client
            this.stompClient.disconnect();
            this.stompClient = null;
        }
    }
}

// Create a singleton instance
const webSocketService = new WebSocketService();
export default webSocketService;

// API request utility with authentication
export const authenticatedRequest = async (method, url, data = null) => {
    // Get auth token from localStorage (preferred) or cookie (fallback)
    let token = localStorage.getItem('authToken');
    
    if (!token) {
        // Fallback to cookie if localStorage is empty
        token = document.cookie
            .split('; ')
            .find(row => row.startsWith('jwt='))
            ?.split('=')[1];
    }

    if (!token) {
        throw new Error('Authentication token not found');
    }

    try {
        const config = {
            method,
            url: `${apiEndpoint}${url}`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            config.data = data;
        }

        return await axios(config);
    } catch (error) {
        // Handle token expiration automatically
        if (error.response && error.response.status === 401) {
            // Clear tokens
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            
            // Redirect to login
            window.location.replace(window.location.origin);
        }
        throw error;
    }
};