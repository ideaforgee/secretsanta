import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPaperPlane } from 'react-icons/fa';
import { IoGameController } from 'react-icons/io5';
import CloseIcon from '@mui/icons-material/Close';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import { connectWebSocket } from '../websocket';
import * as Constant from '../constants/secretSantaConstants';
import * as messageService from '../services/messageService';
import Message from '../features/message';
import ErrorComponent from '../components/Error/ErrorComponent';
import secretSantaTheme from '../assets/secretSantaTheme.jpg';
import '../pages/SecretSantaChat.css';

const SecretSantaChat = () => {
    const userId = localStorage.getItem('userId');
    const gameId = localStorage.getItem('gameId');

    const [messagesSanta, setMessagesSanta] = useState([]);
    const [messagesNinja, setMessagesNinja] = useState([]);
    const [errorPopUp, setErrorPopUp] = useState({ message: '', show: false });
    const [secretSantaInputMessage, setSecretSantaInputMessage] = useState('');
    const [giftNinjaInputMessage, setGiftNinjaInputMessage] = useState('');
    const [ws, setWs] = useState(null);
    const [chatMode, setChatMode] = useState(null);
    const [secretSantaMessagesHidden, setSecretSantaMessagesHidden] = useState(true);
    const [giftNinjaMessagesHidden, setGiftNinjaMessagesHidden] = useState(true);

    const santaMessagesEndRef = useRef(null);
    const ninjaMessagesEndRef = useRef(null);
    const chatModeRef = useRef(chatMode);
    const navigate = useNavigate();

    const toggleBadgeVisibility = (setHidden, value) => setHidden(value);

    const handleMessagesFetchError = (error) => {
        const errorMessage = error || Constant.POPUP_ERROR_MESSAGE;
        setErrorPopUp({ message: errorMessage, show: true });
    };

    const markMessagesAsRead = async (chatBoxType) => {
        try {
            await messageService.markEmailAsNotSent(userId, gameId, chatBoxType);
        } catch (error) {
            handleMessagesFetchError(error);
        }
    };

    const fetchChatMessages = async () => {
        try {
            const { secretSantaMessages = [], giftNinjaMessages = [] } = await messageService.fetchMessages(userId, gameId);
            setMessagesSanta(secretSantaMessages);
            setMessagesNinja(giftNinjaMessages);
        } catch (error) {
            handleMessagesFetchError(error);
        }
    };

    const fetchUnReadMessages = async () => {
        try {
            const { secretSantaPendingMessages, giftNinjaPendingMessages } = await messageService.fetchPendingMessages(userId, gameId);
            toggleBadgeVisibility(setSecretSantaMessagesHidden, !secretSantaPendingMessages);
            toggleBadgeVisibility(setGiftNinjaMessagesHidden, !giftNinjaPendingMessages);
        } catch (error) {
            handleMessagesFetchError(error);
        }
    };

    const handleWebSocketMessage = (message) => {
        if (message.type !== Constant.NOTIFICATION_TYPE.MESSAGE) return;

        const reverseChatBoxType =
            message.chatBoxType === Constant.CHAT_BOX_TYPE.SECRET_SANTA ? Constant.CHAT_BOX_TYPE.GIFT_NINJA : Constant.CHAT_BOX_TYPE.SECRET_SANTA;

        const newMessage = { from: reverseChatBoxType, content: message.content };

        if (reverseChatBoxType === Constant.CHAT_BOX_TYPE.SECRET_SANTA) {
            if (chatModeRef?.current !== Constant.CHAT_BOX_TYPE.SECRET_SANTA) {
                toggleBadgeVisibility(setSecretSantaMessagesHidden, false);
            }
            setMessagesSanta((prev) => [...prev, newMessage]);
        } else if (reverseChatBoxType === Constant.CHAT_BOX_TYPE.GIFT_NINJA) {
            if (chatModeRef?.current !== Constant.CHAT_BOX_TYPE.GIFT_NINJA) {
                toggleBadgeVisibility(setGiftNinjaMessagesHidden, false);
            }
            setMessagesNinja((prev) => [...prev, newMessage]);
        }
    };

    const sendMessage = () => {
        if (!ws || !(secretSantaInputMessage || giftNinjaInputMessage)) return;

        const messageContent =
            chatMode === Constant.CHAT_BOX_TYPE.SECRET_SANTA ? secretSantaInputMessage : giftNinjaInputMessage;

        ws.send(JSON.stringify({ type: Constant.NOTIFICATION_TYPE.MESSAGE, userId, chatBoxType: chatMode, content: messageContent, gameId }));

        const newMessage = { from: 'Me', content: messageContent };

        if (chatMode === Constant.CHAT_BOX_TYPE.SECRET_SANTA) {
            setMessagesSanta((prev) => [...prev, newMessage]);
            setSecretSantaInputMessage('');
        } else if (chatMode === Constant.CHAT_BOX_TYPE.GIFT_NINJA) {
            setMessagesNinja((prev) => [...prev, newMessage]);
            setGiftNinjaInputMessage('');
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') sendMessage();
    };

    useEffect(() => {
        chatModeRef.current = chatMode;
    }, [chatMode]);

    useEffect(() => {
        fetchChatMessages();
        fetchUnReadMessages();

        let websocket;
        if (userId) {
            websocket = connectWebSocket(userId, handleWebSocketMessage);
            setWs(websocket);
        }

        return () => {
            if (websocket) {
                console.log('Closing WebSocket connection...');
                websocket.close();
            }
        };
    }, [userId]);

    useEffect(() => {
        const scrollRef = chatMode === Constant.CHAT_BOX_TYPE.SECRET_SANTA ? santaMessagesEndRef : ninjaMessagesEndRef;
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messagesSanta, messagesNinja, chatMode]);

    const renderChatWindow = (messages, inputValue, setInputValue, ref, header) => (
        <div className='chat-window'>
            <header className='chat-header'>{header}</header>
            <button className='close-chat-button' onClick={() => setChatMode(null)}><CloseIcon/></button>
            <div className='chat-messages' ref={ref}>
                {messages.map((msg, idx) => (
                    <Message key={idx} message={msg} />
                ))}
            </div>
            <footer className='chat-footer'>
                <input
                    type='text'
                    placeholder='Type your message...'
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className='message-input'
                />
                <button onClick={sendMessage} className='send-button'>
                    <FaPaperPlane />
                </button>
            </footer>
        </div>
    );

    return (
        <div style={Constant.BACKGROUND_STYLE} className='chat-container'>
            <div className='go-to-game-icon' onClick={() => navigate(Constant.ROUTE_PATH.GAME)}>
                <IoGameController />
            </div>
            <div className='chat-mode-buttons'>
                {[Constant.CHAT_BOX_TYPE.SECRET_SANTA, Constant.CHAT_BOX_TYPE.GIFT_NINJA].map((type, idx) => (
                    <Badge
                        key={idx}
                        badgeContent='🎁'
                        invisible={type === Constant.CHAT_BOX_TYPE.SECRET_SANTA ? secretSantaMessagesHidden : giftNinjaMessagesHidden}
                        sx={{
                            '& .MuiBadge-badge': {
                                fontSize: '1.3rem',
                            },
                        }}
                    >
                        <Button
                            className='custom-button'
                            variant='contained'
                            style={{ backgroundColor: 'var(--primary-color)', color: 'var(--primary-text-color)', width: '250px', border: '1px solid', fontWeight: '600' }}
                            onClick={() => {
                                toggleBadgeVisibility(type === Constant.CHAT_BOX_TYPE.SECRET_SANTA ? setSecretSantaMessagesHidden : setGiftNinjaMessagesHidden, true);
                                setChatMode(type);
                                markMessagesAsRead(type);
                            }}
                        >
                            {type === Constant.CHAT_BOX_TYPE.SECRET_SANTA ? Constant.TALK_TO_USER.SECRET_SANTA : Constant.TALK_TO_USER.GIFT_NINJA}
                        </Button>
                    </Badge>
                ))}
            </div>
            {chatMode === Constant.CHAT_BOX_TYPE.SECRET_SANTA && renderChatWindow(messagesSanta, secretSantaInputMessage, setSecretSantaInputMessage, santaMessagesEndRef, 'Secret Santa')}
            {chatMode === Constant.CHAT_BOX_TYPE.GIFT_NINJA && renderChatWindow(messagesNinja, giftNinjaInputMessage, setGiftNinjaInputMessage, ninjaMessagesEndRef, 'Gift Ninja')}
            <ErrorComponent message={errorPopUp.message} show={errorPopUp.show} onClose={() => setErrorPopUp({ message: '', show: false })} />
        </div>
    );
};

export default SecretSantaChat;
