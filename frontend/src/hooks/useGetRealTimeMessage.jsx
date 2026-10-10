import { useEffect } from "react";
import {useSelector, useDispatch} from "react-redux";
import { removeMessage, upsertMessage } from "../redux/messageSlice";

const useGetRealTimeMessage = () => {
    const {socket} = useSelector(store=>store.socket);
    const {selectedUser} = useSelector(store=>store.user);
    const dispatch = useDispatch();
    useEffect(()=>{
        socket?.on("newMessage", (newMessage)=>{
            if (newMessage.senderId !== selectedUser?._id &&
                newMessage.receiverId !== selectedUser?._id) return;
            dispatch(upsertMessage(newMessage));
        });
        socket?.on("messageUpdated", (message)=>{
            if (message.senderId !== selectedUser?._id &&
                message.receiverId !== selectedUser?._id) return;
            dispatch(upsertMessage(message));
        });
        socket?.on("messageDeleted", ({_id, senderId, receiverId})=>{
            if (senderId !== selectedUser?._id && receiverId !== selectedUser?._id) return;
            dispatch(removeMessage(_id));
        });
        return () => {
            socket?.off("newMessage");
            socket?.off("messageUpdated");
            socket?.off("messageDeleted");
        };
    },[socket, dispatch, selectedUser?._id]);
};
export default useGetRealTimeMessage;