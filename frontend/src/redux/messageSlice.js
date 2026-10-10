import {createSlice} from "@reduxjs/toolkit";

const messageSlice = createSlice({
    name:"message",
    initialState:{
        messages:null,
    },
    reducers:{
        setMessages:(state,action)=>{
            state.messages = action.payload;
        },
        upsertMessage:(state, action)=>{
            const messages = state.messages || [];
            const index = messages.findIndex((message) => message._id === action.payload._id);
            if (index === -1) {
                messages.push(action.payload);
            } else {
                messages[index] = action.payload;
            }
            state.messages = messages.map((message) => {
                if (message._id === action.payload._id || !message.replyTo ||
                    typeof message.replyTo !== "object" ||
                    message.replyTo._id !== action.payload._id) {
                    return message;
                }
                return { ...message, replyTo: action.payload };
            });
        },
        removeMessage:(state, action)=>{
            state.messages = (state.messages || [])
                .filter((message) => message._id !== action.payload)
                .map((message) => {
                    const repliedToId = message.replyTo?._id || message.replyTo;
                    return repliedToId === action.payload
                        ? { ...message, replyTo: null }
                        : message;
                });
        }
    }
});
export const {setMessages, upsertMessage, removeMessage} = messageSlice.actions;
export default messageSlice.reducer;