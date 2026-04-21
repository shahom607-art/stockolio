'use client';

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, Bot, UserIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getChatHistory } from "@/lib/actions/chat.actions";

type Message = {
    role: "user" | "assistant";
    content: string;
};

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [historyLoaded, setHistoryLoaded] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (isOpen && !historyLoaded) {
            const loadHistory = async () => {
                try {
                    const history = await getChatHistory();
                    if (history.length > 0) {
                        setMessages(history);
                    }
                } catch (err) {
                    console.error("Failed to load chat history:", err);
                }
                setHistoryLoaded(true);
            };
            loadHistory();
        }
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, historyLoaded]);

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;

        const userMessage: Message = { role: "user", content: trimmed };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: trimmed }),
            });

            const data = await res.json();
            const reply = data.reply || data.error || "Something went wrong.";

            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: reply },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Failed to get a response. Please try again." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleClear = () => {
        setMessages([]);
    };

    return (
        <>
            <button
                id="chat-toggle-button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 text-gray-900 shadow-lg hover:from-yellow-500 hover:to-yellow-400 transition-all duration-300 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95"
            >
                {isOpen ? (
                    <X className="h-6 w-6" />
                ) : (
                    <MessageCircle className="h-6 w-6" />
                )}
            </button>

            {isOpen && (
                <div
                    id="chat-widget-panel"
                    className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)] flex flex-col rounded-xl border border-gray-600 bg-gray-800 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300"
                >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-600 rounded-t-xl bg-gray-700/50">
                        <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center">
                                <Bot className="h-4.5 w-4.5 text-gray-900" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-100">Stockolio AI</h3>
                                <p className="text-xs text-gray-500">Finance Assistant</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={handleClear}
                            className="text-gray-500 hover:text-red-400 hover:bg-transparent cursor-pointer"
                            title="Clear chat"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide-default">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center px-4">
                                <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center mb-3">
                                    <MessageCircle className="h-6 w-6 text-yellow-500" />
                                </div>
                                <p className="text-sm font-medium text-gray-400 mb-1">
                                    Welcome to Stockolio AI
                                </p>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Ask me anything about stocks, investing, markets, or economics.
                                </p>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                {msg.role === "assistant" && (
                                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shrink-0 mt-0.5">
                                        <Bot className="h-3.5 w-3.5 text-gray-900" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[75%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                                        msg.role === "user"
                                            ? "bg-yellow-500/15 text-gray-200 rounded-br-sm"
                                            : "bg-gray-700 text-gray-300 rounded-bl-sm"
                                    }`}
                                >
                                    {msg.content}
                                </div>
                                {msg.role === "user" && (
                                    <div className="h-7 w-7 rounded-full bg-gray-600 flex items-center justify-center shrink-0 mt-0.5">
                                        <UserIcon className="h-3.5 w-3.5 text-gray-300" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-2.5 justify-start">
                                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shrink-0">
                                    <Bot className="h-3.5 w-3.5 text-gray-900" />
                                </div>
                                <div className="bg-gray-700 px-4 py-3 rounded-xl rounded-bl-sm">
                                    <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 border-t border-gray-600">
                        <div className="flex items-center gap-2">
                            <input
                                ref={inputRef}
                                id="chat-input"
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about stocks, markets..."
                                disabled={isLoading}
                                maxLength={500}
                                className="flex-1 h-10 px-3 text-sm text-gray-200 placeholder:text-gray-500 bg-gray-700 border border-gray-600 rounded-lg outline-none focus:border-yellow-500 transition-colors disabled:opacity-50"
                            />
                            <button
                                id="chat-send-button"
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                className="h-10 w-10 flex items-center justify-center rounded-lg bg-yellow-500 hover:bg-yellow-400 text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatWidget;
