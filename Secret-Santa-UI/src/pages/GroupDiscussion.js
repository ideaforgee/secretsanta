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
import '../pages/GroupDiscussion.css';

const GroupDiscussion = () => {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const groupId = localStorage.getItem('groupId');

    const [messagesPublic, setMessagesPublic] = useState([]);
    const [messagesAnonymous, setMessagesAnonymous] = useState([]);
    const [errorPopUp, setErrorPopUp] = useState({ message: '', show: false });
    const [publicChatInputMessage, setPublicChatInputMessage] = useState('');
    const [anonymousChatInputMessage, setAnonymousChatInputMessage] = useState('');
    const [ws, setWs] = useState(null);
    const [chatMode, setChatMode] = useState(null);
    const [publicChatMessagesHidden, setPublicChatMessagesHidden] = useState(true);
    const [anonymousChatMessagesHidden, setAnonymousChatMessagesHidden] = useState(true);
    const [retryCount, setRetryCount] = useState(0);

    const publicMessagesEndRef = useRef(null);
    const anonymousMessagesEndRef = useRef(null);
    const chatModeRef = useRef(chatMode);
    const navigate = useNavigate();

    const MAX_RETRIES = 10;
    const RETRY_INTERVAL = 5000;

    const toggleBadgeVisibility = (setHidden, value) => setHidden(value);

    const handleMessagesFetchError = (error) => {
        const errorMessage = error || Constant.POPUP_ERROR_MESSAGE;
        setErrorPopUp({ message: errorMessage, show: true });
    };

    const markMessagesAsRead = async (chatBoxType) => {
        try {
            await messageService.markEmailAsNotSent(userId, groupId, chatBoxType);
        } catch (error) {
            handleMessagesFetchError(error);
        }
    };

    const fetchChatMessages = async () => {
        try {
            const { publicChatMessages = [], anonymousChatMessages = [] } = await messageService.fetchGroupDiscussionMessages(userId, groupId);
            setMessagesPublic(publicChatMessages);
            setMessagesAnonymous(anonymousChatMessages);
        } catch (error) {
            handleMessagesFetchError(error);
        }
    };

    const fetchUnReadMessages = async () => {
        try {
            const { publicChatPendingMessages, anonymousChatPendingMessages } = await messageService.fetchGroupDiscussionPendingMessages(userId, groupId);
            toggleBadgeVisibility(setPublicChatMessagesHidden, !publicChatPendingMessages);
            toggleBadgeVisibility(setAnonymousChatMessagesHidden, !anonymousChatPendingMessages);
        } catch (error) {
            handleMessagesFetchError(error);
        }
    };

    const handleWebSocketMessage = (message) => {
        if (message.type !== Constant.NOTIFICATION_TYPE.GROUP_DISCUSSION_MESSAGE) return;

        const newMessage = { from: message.senderName, content: message.content };

        if (message.chatBoxType === 'publicChat') {
            if (chatModeRef?.current !== Constant.CHAT_BOX_TYPE.PUBLIC_CHAT) {
                toggleBadgeVisibility(setPublicChatMessagesHidden, false);
            }
            setMessagesPublic((prev) => [...prev, newMessage]);
        } else if (message.chatBoxType === 'anonymousChat') {
            if (chatModeRef?.current !== Constant.CHAT_BOX_TYPE.ANONYMOUS_CHAT) {
                toggleBadgeVisibility(setAnonymousChatMessagesHidden, false);
            }
            setMessagesAnonymous((prev) => [...prev, newMessage]);
        }
    };

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
                setErrorPopUp({ message: 'Connection lost. Please refresh the page.', show: true });
            }
        };

        websocket.onopen = () => {
            console.log('WebSocket connection established.');
            setRetryCount(0);
        };

        setWs(websocket);
    };

    const sendMessage = () => {
        if (!ws || !(publicChatInputMessage || anonymousChatInputMessage)) return;

        const messageContent =
            chatMode === Constant.CHAT_BOX_TYPE.PUBLIC_CHAT ? publicChatInputMessage : anonymousChatInputMessage;

        ws.send(JSON.stringify({
            type: Constant.NOTIFICATION_TYPE.GROUP_DISCUSSION_MESSAGE,
            userId,
            chatBoxType: chatMode,
            content: messageContent,
            senderName: userName,
            groupId: groupId }));

        const newMessage = { from: chatMode === Constant.CHAT_BOX_TYPE.PUBLIC_CHAT ? 'Me' : 'Anonymous', content: messageContent };

        if (chatMode === Constant.CHAT_BOX_TYPE.PUBLIC_CHAT) {
            setMessagesPublic((prev) => [...prev, newMessage]);
            setPublicChatInputMessage('');
        } else if (chatMode === Constant.CHAT_BOX_TYPE.ANONYMOUS_CHAT) {
            setMessagesAnonymous((prev) => [...prev, newMessage]);
            setAnonymousChatInputMessage('');
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

        if (userId) {
            initializeWebSocket();
        }

        return () => {
            if (ws) {
                console.log('Closing WebSocket connection...');
                ws.close();
            }
        };
    }, [userId]);

    useEffect(() => {
        const scrollRef = chatMode === Constant.CHAT_BOX_TYPE.SECRET_SANTA ? publicMessagesEndRef : anonymousMessagesEndRef;
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messagesPublic, messagesAnonymous, chatMode]);

    const renderChatWindow = (messages, inputValue, setInputValue, ref, header) => (
        <div className='chat-window'>
            <header className='chat-header'>{header}</header>
            <button className='close-chat-button' onClick={() => setChatMode(null)}><CloseIcon /></button>
            <div className='chat-messages' ref={ref}>
                {messages.map((msg, idx) => (
                    header === 'Public Chat' ?
                        <div className={`message ${msg.from === "Me" ? "sent" : "received"}`}>
                            <div className="message-content">
                                {msg.from !== "Me" ? <span className="message-from">{msg.from}</span> : null}
                                <span className="message-text">{msg.content}</span>
                            </div>
                        </div>
                        : <Message key={idx} message={msg} />
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
                <button
                    onClick={sendMessage}
                    className={`send-button ${inputValue.trim() ? 'send-button-enable' : ''}`}
                >
                    <FaPaperPlane />
                </button>
            </footer>
        </div>
    );

    return (
        <div style={Constant.BACKGROUND_STYLE} className='chat-container'>
            <div className='go-to-game-icon' onClick={() => navigate(Constant.ROUTE_PATH.GAME_ASSIST)}>
                <IoGameController />
            </div>
            <div className='chat-mode-buttons'>
                {[Constant.CHAT_BOX_TYPE.PUBLIC_CHAT, Constant.CHAT_BOX_TYPE.ANONYMOUS_CHAT].map((type, idx) => (
                    <Badge
                        key={idx}
                        badgeContent='🎁'
                        invisible={type === Constant.CHAT_BOX_TYPE.PUBLIC_CHAT ? publicChatMessagesHidden : anonymousChatMessagesHidden}
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
                                toggleBadgeVisibility(type === Constant.CHAT_BOX_TYPE.PUBLIC_CHAT ? setPublicChatMessagesHidden : setAnonymousChatMessagesHidden, true);
                                setChatMode(type);
                                markMessagesAsRead(type);
                            }}
                        >
                            {type === Constant.CHAT_BOX_TYPE.PUBLIC_CHAT ? Constant.TALK_TO_USER.PUBLIC_CHAT : Constant.TALK_TO_USER.ANONYMOUS_CHAT}
                        </Button>
                    </Badge>
                ))}
            </div>
            {chatMode === Constant.CHAT_BOX_TYPE.PUBLIC_CHAT && renderChatWindow(messagesPublic, publicChatInputMessage, setPublicChatInputMessage, publicMessagesEndRef, 'Public Chat')}
            {chatMode === Constant.CHAT_BOX_TYPE.ANONYMOUS_CHAT && renderChatWindow(messagesAnonymous, anonymousChatInputMessage, setAnonymousChatInputMessage, anonymousMessagesEndRef, 'Anonymous Chat')}
            <ErrorComponent message={errorPopUp.message} show={errorPopUp.show} onClose={() => setErrorPopUp({ message: '', show: false })} />
        </div>
    );
};

export default GroupDiscussion;
