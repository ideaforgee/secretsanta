import APP_CONFIG from './config/appConfig';

export const connectWebSocket = (userId, onMessage) => {
    const ws = new WebSocket(`${APP_CONFIG.WS_BASE_URL}?userId=${userId}`);

    ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'register', userId }));
    };

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        onMessage(message);
    };

    ws.onerror = (error) => console.error('WebSocket error:', error);

    return ws;
};
