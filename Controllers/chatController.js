import { Chat } from "../Models/chatModel.js";

export const handleChatMessage = async(req, res) => {
    try {
        const {room_ID,  newMsg } = req.body;
        if(!room_ID) {
            return res.status(400).json({message: "Chat Details not received"})
        } 
        const result = await Chat.findOneAndUpdate({room_ID: room_ID},
             { $push : {messages: newMsg } }, {new : true})
        //console.log(result)
        if(result)
        res.status(200).json({message: "chat saved"})
        else 
        res.status(400).json({message: "chat not saved"})
    } catch (error) {
        res.status(500).send({message: "Internal server error", error: error})
    }
}


export const handleCreateRoom = async(req, res) => {
    try {
        const {room_ID} = req.body;

        if(!room_ID) {
            return res.status(400).json({message: "Chat Details not received"})
        }
        else {
            const getChat = await Chat.findOne({room_ID: room_ID})
            //console.log("getting chat", getChat)
            if(getChat) {
                return res.status(200).json({ chat: getChat})
            }
            else {
                const addRoom = new Chat({room_ID: room_ID, messages:[]})
                //console.log(addRoom)
                if(addRoom._id) {
                    await addRoom.save()
                    return res.status(200).json({ chat: addRoom})
                }
            }
        }

    } catch (error) {
        res.status(500).send({message: "Internal server error", error: error})
    }
}