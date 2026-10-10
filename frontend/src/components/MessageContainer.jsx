import React, { useEffect, useState } from 'react'
import { FiArrowLeft } from 'react-icons/fi';
import SendInput from './SendInput'
import Messages from './Messages';
import { useSelector, useDispatch } from "react-redux";
import { setSelectedUser } from '../redux/userSlice';
import UserAvatar from './UserAvatar';

const MessageContainer = () => {
    const { selectedUser, authUser, onlineUsers } = useSelector(store => store.user);
    const dispatch = useDispatch();
    const [replyTo, setReplyTo] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);

    const isOnline = onlineUsers?.includes(selectedUser?._id);

    useEffect(() => {
        setReplyTo(null);
        setEditingMessage(null);
    }, [selectedUser?._id]);
   
    return (
        <>
            {
                selectedUser !== null ? (
                    <div className='chat-conversation flex flex-col'>
                        <div className='flex gap-2 items-center bg-zinc-800 text-white px-4 py-2 mb-2'>
                            <button
                                type="button"
                                className="mobile-back-button"
                                onClick={() => dispatch(setSelectedUser(null))}
                                aria-label="Back to conversations"
                            >
                                <FiArrowLeft aria-hidden="true" />
                            </button>
                            <div className={`avatar ${isOnline ? 'online' : ''}`}>
                                <div className='w-12 rounded-full'>
                                    <UserAvatar user={selectedUser} />
                                </div>
                            </div>
                            <div className='flex flex-col flex-1'>
                                <div className='flex justify-between gap-2'>
                                    <p>{selectedUser?.fullName}</p>
                                </div>
                            </div>
                        </div>
                        <Messages
                            onReply={(message) => {
                                setEditingMessage(null);
                                setReplyTo(message);
                            }}
                            onEdit={(message) => {
                                setReplyTo(null);
                                setEditingMessage(message);
                            }}
                        />
                        <SendInput
                            replyTo={replyTo}
                            onClearReply={() => setReplyTo(null)}
                            editingMessage={editingMessage}
                            onCancelEdit={() => setEditingMessage(null)}
                            onFinishEdit={() => setEditingMessage(null)}
                        />
                    </div>
                ) : (
                    <div className='chat-conversation flex flex-col justify-center items-center'>
                        <h1 className='text-3xl text-white font-bold'>Hi,{authUser?.fullName} </h1>
                        <h1 className='text-2xl text-white'>Let's start conversation</h1>

                    </div>
                )
            }
        </>

    )
}

export default MessageContainer