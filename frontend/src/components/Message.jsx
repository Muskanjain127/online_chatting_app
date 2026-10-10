import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { FiCornerUpLeft, FiEdit2, FiTrash2 } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
import UserAvatar from './UserAvatar';
import { removeMessage } from '../redux/messageSlice';
import { BASE_URL } from '..';

const EDIT_WINDOW_MS = 2 * 60 * 1000;

const Message = ({message, onReply, onEdit}) => {
    const scroll = useRef();
    const [, setClock] = useState(Date.now());
    const {authUser,selectedUser} = useSelector(store=>store.user);
    const dispatch = useDispatch();
    const createdAt = message?.createdAt ? new Date(message.createdAt) : null;
    const messageTime = createdAt && !Number.isNaN(createdAt.getTime())
        ? createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';
    const isOwnMessage = message?.senderId === authUser?._id;
    const canEdit = isOwnMessage && createdAt &&
        Date.now() >= createdAt.getTime() &&
        Date.now() - createdAt.getTime() <= EDIT_WINDOW_MS;
    const repliedMessage = message?.replyTo && typeof message.replyTo === "object"
        ? message.replyTo
        : null;

    useEffect(() => {
        if (!isOwnMessage || !createdAt) return undefined;
        const remaining = createdAt.getTime() + EDIT_WINDOW_MS - Date.now();
        if (remaining <= 0) return undefined;

        const timer = window.setTimeout(() => setClock(Date.now()), remaining + 1);
        return () => window.clearTimeout(timer);
    }, [isOwnMessage, createdAt?.getTime()]);

    const unsendMessage = async () => {
        if (!window.confirm("Unsend this message for everyone?")) return;
        try {
            await axios.delete(`${BASE_URL}/api/v1/message/${message._id}`, {
                withCredentials: true
            });
            dispatch(removeMessage(message._id));
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to unsend message.");
        }
    };

    useEffect(()=>{
        scroll.current?.scrollIntoView({behavior:"smooth"});
    },[message]);
    
    return (
        <div ref={scroll} className={`chat ${message?.senderId === authUser?._id ? 'chat-end' : 'chat-start'}`}>
            <div className="chat-image avatar">
                <div className="w-10 rounded-full">
                    <UserAvatar user={message?.senderId === authUser?._id ? authUser : selectedUser} />
                </div>
            </div>
            <div className="chat-header">
                {messageTime && (
                    <time className="text-xs opacity-50 text-white" dateTime={createdAt.toISOString()}>
                        {messageTime}
                    </time>
                )}
                {message?.editedAt && <span className="message-edited-label">edited</span>}
            </div>
            {message?.replyTo && (
                <div className={`reply-preview ${isOwnMessage ? 'reply-preview-own' : ''}`}>
                    <span className="reply-preview-author">
                        {repliedMessage?.senderId === authUser?._id
                            ? "You"
                            : repliedMessage?.senderId === selectedUser?._id
                                ? selectedUser?.fullName
                                : "Reply"}
                    </span>
                    <span className="reply-preview-text">
                        {repliedMessage?.message || "Original message unavailable"}
                    </span>
                </div>
            )}
            <div className={`chat-bubble ${message?.senderId !== authUser?._id ? 'bg-gray-200 text-black' : ''} `}>{message?.message}</div>
            <div className={`message-actions ${isOwnMessage ? 'message-actions-own' : ''}`}>
                <button type="button" onClick={() => onReply(message)} title="Reply" aria-label="Reply to message">
                    <FiCornerUpLeft />
                </button>
                {isOwnMessage && canEdit && (
                    <button type="button" onClick={() => onEdit(message)} title="Edit" aria-label="Edit message">
                        <FiEdit2 />
                    </button>
                )}
                {isOwnMessage && (
                    <button type="button" onClick={unsendMessage} title="Unsend" aria-label="Unsend message">
                        <FiTrash2 />
                    </button>
                )}
            </div>
        </div>
    )
}

export default Message