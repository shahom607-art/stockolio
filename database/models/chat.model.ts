import { Schema, model, models, type Document, type Model } from 'mongoose';

export interface ChatItem extends Document {
    userId: string;
    role: "user" | "assistant";
    content: string;
    createdAt: Date;
}

const ChatSchema = new Schema<ChatItem>(
    {
        userId: { type: String, required: true, index: true },
        role: { type: String, required: true, enum: ["user", "assistant"] },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now, index: true },
    },
    { timestamps: false }
);

export const Chat: Model<ChatItem> =
    (models?.Chat as Model<ChatItem>) || model<ChatItem>('Chat', ChatSchema);
