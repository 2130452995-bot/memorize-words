import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Chat } from '@google/genai';
import { XMarkIcon } from './Icons';

interface ChatWidgetProps {
    chatSession: Chat | null;
    onClose: () => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ chatSession, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: 'Hey! Got any questions about this word?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !chatSession) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const result = await chatSession.sendMessage({ message: userMsg });
            const responseText = result.text || "Sorry, I couldn't quite get that.";
            setMessages(prev => [...prev, { role: 'model', text: responseText }]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'model', text: "Oops, something went wrong with the connection." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-0 left-0 w-full h-[60vh] md:h-[500px] md:w-[400px] md:bottom-4 md:left-auto md:right-4 bg-white rounded-t-3xl md:rounded-3xl shadow-2xl z-40 flex flex-col overflow-hidden animate-flip-in border border-gray-100">
            <div className="bg-primary p-4 flex justify-between items-center text-white">
                <h3 className="font-bold text-lg">LingoChat AI</h3>
                <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1"><XMarkIcon /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                            m.role === 'user' 
                            ? 'bg-primary text-white rounded-br-none' 
                            : 'bg-white text-gray-700 shadow-sm border border-gray-100 rounded-bl-none'
                        }`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                         <div className="bg-gray-200 rounded-full px-4 py-2 flex space-x-1">
                             <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                             <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                             <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                         </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 bg-white border-t flex gap-2">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-1 bg-gray-100 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button 
                    type="submit" 
                    disabled={loading || !input.trim()}
                    className="bg-primary text-white p-2 rounded-xl font-bold disabled:opacity-50"
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatWidget;
