import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

class WebSocketService {
    constructor() {
        this.client = null;
        this.subscribers = {};
        this.socketFactory = () => new SockJS('http://localhost:8080/ws');
    }

    connectWebSocket(jwtToken) {
       
        this.client = Stomp.over(this.socketFactory);

      
        this.client.reconnect_delay = 5000; 

        this.client.connect({ 'Authorization': jwtToken }, frame => {
            console.log('Connected:', frame);

      
            Object.keys(this.subscribers).forEach(topic => {
                console.log('I am Here 1')
                this.subscribers[topic].forEach(sub => {
                    console.log('I am Here 2')
                    sub.subscription = this.client.subscribe(topic, message => {
                        sub.callback(JSON.parse(message.body));
                    });
                });
            });
        });
    }

    subscribe(topic, callback) {
        if (!this.subscribers[topic]) {
            this.subscribers[topic] = [];
        }
        console.log('I am Here 3')
        if (this.client && this.client.connected) {
            console.log('I am Here 4')
            const subscription = this.client.subscribe(topic, message => {
                callback(JSON.parse(message.body));
            });

            this.subscribers[topic].push({ subscription, callback });
        }else {
            this.subscribers[topic].push({subscription: null, callback})
        }
        console.log('this.subscribers[topic]', this.subscribers[topic])
    }

    unsubscribe(topic, callback) {
        console.log('this.subscribers[topic]', this.subscribers[topic])
        if (this.subscribers[topic]) {
           
            const subscriptionIndex = this.subscribers[topic].findIndex(sub => sub.callback.name === callback.name);

            if (subscriptionIndex !== -1) {

                const subscriptionId = this.subscribers[topic][subscriptionIndex].subscription.id;


                this.client.unsubscribe(subscriptionId);

                this.subscribers[topic].splice(subscriptionIndex, 1);
            }
        }
    }
}

const webSocketService = new WebSocketService();
export default webSocketService;