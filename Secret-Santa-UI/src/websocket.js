import APP_CONFIG from './config/appConfig';

export const connectWebSocket = (userId, onMessage, onwithDrawnNumbers, onmarkedNumbers, onclaim) => {
    const ws = new WebSocket(`${APP_CONFIG.WS_BASE_URL}?userId=${userId}`);

    ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'register', userId }));
    };

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        onMessage(message);
    };

    ws.onwithDrawnNumbers = (event) => {
        const withDrawnNumbers = JSON.parse(event.data);
        onwithDrawnNumbers(withDrawnNumbers);
    };

    ws.onmarkedNumbers = (event) => {
        const markedNumbers = JSON.parse(event.data);
        onmarkedNumbers(markedNumbers);
    };

    ws.onclaim = (event) => {
        const claim = JSON.parse(event.data);
        onclaim(claim);
    };

    ws.onerror = (error) => console.error('WebSocket error:', error);

    return ws;
};
