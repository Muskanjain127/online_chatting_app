import messageReducer, {
    removeMessage,
    setMessages,
    upsertMessage
} from "./messageSlice";

test("upsertMessage updates an existing message instead of duplicating it", () => {
    const original = { _id: "message-1", message: "before" };
    const state = messageReducer(undefined, setMessages([original]));

    const updatedState = messageReducer(
        state,
        upsertMessage({ ...original, message: "after" })
    );

    expect(updatedState.messages).toEqual([
        { _id: "message-1", message: "after" }
    ]);
});

test("removing a message also clears reply previews to that message", () => {
    const state = messageReducer(undefined, setMessages([
        { _id: "message-1", message: "original" },
        {
            _id: "message-2",
            message: "reply",
            replyTo: { _id: "message-1", message: "original" }
        }
    ]));

    const updatedState = messageReducer(state, removeMessage("message-1"));

    expect(updatedState.messages).toEqual([
        { _id: "message-2", message: "reply", replyTo: null }
    ]);
});
