import React, { useEffect, useState } from 'react'
import { FiCornerUpLeft, FiEdit2, FiX } from "react-icons/fi";
import toast from "react-hot-toast";

import { IoSend } from "react-icons/io5";
import axios from "axios";
import {useDispatch,useSelector} from "react-redux";
import { upsertMessage } from '../redux/messageSlice';
import { BASE_URL } from '..';

const SendInput = ({replyTo, onClearReply, editingMessage, onCancelEdit, onFinishEdit}) => {
    const [message, setMessage] = useState("");
    const dispatch = useDispatch();
    const {selectedUser, authUser} = useSelector(store=>store.user);

    useEffect(() => {
        setMessage(editingMessage?.message || "");
    }, [editingMessage]);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        const content = message.trim();
        if (!content) return;

        try {
            const config = {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            };
            if (editingMessage) {
                const res = await axios.patch(
                    `${BASE_URL}/api/v1/message/${editingMessage._id}`,
                    { message: content },
                    config
                );
                dispatch(upsertMessage(res.data.message));
                onFinishEdit();
            } else {
                const res = await axios.post(
                    `${BASE_URL}/api/v1/message/send/${selectedUser?._id}`,
                    { message: content, replyTo: replyTo?._id },
                    config
                );
                dispatch(upsertMessage(res.data.newMessage));
                onClearReply();
            }
            setMessage("");
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to send message.");
        }
    }
    return (
        <form onSubmit={onSubmitHandler} className='px-4 my-3'>
            {(replyTo || editingMessage) && (
                <div className="composer-context">
                    <div className="composer-context-icon">
                        {editingMessage ? <FiEdit2 /> : <FiCornerUpLeft />}
                    </div>
                    <div className="composer-context-copy">
                        <span>{editingMessage ? "Editing message" : `Replying to ${replyTo?.senderId === authUser?._id ? "yourself" : selectedUser?.fullName}`}</span>
                        <p>{editingMessage?.message || replyTo?.message}</p>
                    </div>
                    <button
                        type="button"
                        aria-label={editingMessage ? "Cancel edit" : "Cancel reply"}
                        onClick={editingMessage ? onCancelEdit : onClearReply}
                    >
                        <FiX />
                    </button>
                </div>
            )}
            <div className='w-full relative'>
                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    type="text"
                    placeholder={editingMessage ? 'Edit your message...' : 'Send a message...'}
                    className='border text-sm rounded-lg block w-full p-3 border-zinc-500 bg-gray-600 text-white'
                />
                <button type="submit" className='send-message-button absolute flex inset-y-0 end-0 items-center pr-4' disabled={!message.trim()}>
                    {editingMessage ? "Save" : <IoSend />}
                </button>
            </div>
        </form>
    )
}

export default SendInput