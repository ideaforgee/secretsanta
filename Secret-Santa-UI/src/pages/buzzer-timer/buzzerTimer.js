import React, { useState, useEffect } from 'react';
import { USER_KEY, GROUP_ID_KEY } from '../../constants/appConstant';
import BuzzerComponent from '../../components/Buzzer/BuzzerComponent';
import BuzzerResultComponent from '../../components/Buzzer/BuzzerResultComponent';
import Navbar from '../../components/navbar/Navbar';
import { connectWebSocket } from '../../websocket';
import * as Constant from '../../constants/secretSantaConstants';
import { getGroupBuzzerTimerDetail } from '../../services/groupService'
import './BuzzerTImer.css';

const BuzzerTImer = () => {
    const [userList, setUserList] = useState([]);
    const [ws, setWs] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const [isBuzzerActive, setIsBuzzerActive] = useState(true);

    const userId = localStorage.getItem(USER_KEY);
    const groupId = localStorage.getItem(GROUP_ID_KEY);
    const MAX_RETRIES = 10;
    const RETRY_INTERVAL = 5000;
    const [hostId, setHostId] = useState(userId)

    useEffect(() => {
        const fetchData = async () => {
            const response = await getGroupBuzzerTimerDetail(userId, groupId);
            setIsBuzzerActive(response?.isBuzzerActive);
            setUserList(response?.userList);
            setHostId(response?.hostId);
            if (userId) {
                initializeWebSocket();
            }

            return () => {
                if (ws) {
                    console.log('Closing WebSocket connection...');
                    ws.close();
                }
            };
        };
        fetchData();
    }, [userId]);

    const initializeWebSocket = () => {
        const websocket = connectWebSocket(userId, handleWebSocketMessage);

        websocket.onclose = () => {
            console.log('WebSocket connection closed. Retrying...');
            if (retryCount < MAX_RETRIES) {
                setTimeout(() => {
                    setRetryCount((prev) => prev + 1);
                    initializeWebSocket();
                }, RETRY_INTERVAL);
            } else {
                console.error('Max WebSocket reconnection attempts reached.');
            }
        };

        websocket.onopen = () => {
            console.log('WebSocket connection established.');
            setRetryCount(0);
        };

        setWs(websocket);
    };

    const handleWebSocketMessage = (messageData) => {
        if (messageData.type === 'reactiveBuzzer') {
            setUserList([]);
            setIsBuzzerActive(true);
        }
        if (messageData.type === 'pressBuzzer') {
            setUserList(messageData.usersWhoPressedBuzzer);
        }
    };

    const handleBuzzerPress = (userName) => {
        setIsBuzzerActive(false);
        if (navigator.vibrate) {
            navigator.vibrate(1000);
        } else {
            alert('Vibration API is not supported on this device.');
        }
        const newUser = {
            name: userName,
            time: new Date().toLocaleString(),
            groupId: groupId
        };

        setUserList((prevList) => [...prevList, newUser]);
        ws.send(JSON.stringify({ type: Constant.NOTIFICATION_TYPE.PRESS_BUZZER, newUser: newUser, groupId: groupId }));
    };

    const handleReActiveBuzzer = () => {
        setUserList([]);
        setIsBuzzerActive(true);
        ws.send(JSON.stringify({ type: Constant.NOTIFICATION_TYPE.REACTIVE_BUZZER, groupId: groupId }));
    };

    return (
        <div style={Constant.FUN_ZONE_STYLE}className="buzzer-time-container">
            <div><Navbar title={'BUZZER TIME'} /></div>

            <div className="components-container">
                {/* Buzzer Component */}
                <BuzzerComponent isBuzzerActive={isBuzzerActive || !userList?.length}
                    onBuzzerPress={handleBuzzerPress} />

                {/* Buzzer List Component */}
                <BuzzerResultComponent userList={userList} />

                {hostId == userId && (
                    <button
                        className="re-active-buzzer-btn"
                        onClick={handleReActiveBuzzer}
                    >
                        Re-Active Buzzer
                    </button>
                )}
            </div>
        </div>
    );
};

export default BuzzerTImer;
