import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
        room_ID: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        messages : {
            type : Array,
            default: []
        }

    },
    { timestamps: true}
);

export const Chat = mongoose.model("chat", chatSchema);