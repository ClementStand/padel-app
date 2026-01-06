'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, Player } from '@/lib/store';
import { Send, ArrowLeft, User as UserIcon } from 'lucide-react';
import styles from '../../page.module.css'; // Reusing dashboard styles for consistency

interface Message {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
    profiles?: { full_name: string, avatar_url: string };
}

export default function MatchChat({ params }: { params: { id: string } }) {
    const bookingId = params.id;
    const router = useRouter();
    const [user, setUser] = useState<Player | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const init = async () => {
            const currentUser = await getCurrentUser();
            if (!currentUser) {
                router.push('/login');
                return;
            }
            setUser(currentUser);

            // Fetch initial messages with profiles
            const { data, error } = await supabase
                .from('messages')
                .select(`
                    *,
                    profiles ( full_name, avatar_url )
                `)
                .eq('booking_id', bookingId)
                .order('created_at', { ascending: true });

            if (data) setMessages(data);
            setLoading(false);
            scrollToBottom();
        };

        init();

        // Realtime Subscription
        const channel = supabase
            .channel(`room:${bookingId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `booking_id=eq.${bookingId}` }, async (payload) => {
                // Fetch the new message's sender profile
                const { data: sender } = await supabase
                    .from('profiles')
                    .select('full_name, avatar_url')
                    .eq('id', payload.new.user_id)
                    .single();

                const msgWithProfile = { ...payload.new, profiles: sender } as Message;
                setMessages((prev) => [...prev, msgWithProfile]);
                scrollToBottom();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [bookingId, router]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || !user) return;

        const text = newMessage;
        setNewMessage(''); // Optimistic clear

        const { error } = await supabase
            .from('messages')
            .insert([{
                booking_id: bookingId,
                user_id: user.id,
                content: text
            }]);

        if (error) {
            console.error("Error sending message:", error);
            // Hint for RLS
            if (error.code === '42P01') alert("Error: The 'messages' table does not exist. Please run the SQL provided.");
            else if (error.code === '42501') alert("Error: Permission denied. Please check RLS policies.");
            else alert('Failed to send message: ' + error.message);

            setNewMessage(text); // Restore on error
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>Loading chat...</div>;

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>Loading chat...</div>;

    return (
        <div style={{
            height: '100%', // Use available height from dashboard layout
            maxHeight: 'calc(100vh - 20px)', // Fallback constraint
            display: 'flex', flexDirection: 'column',
            background: '#0f172a', color: 'white',
            borderRadius: '24px', overflow: 'hidden', // Add rounding to fit dashboard style
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}>
            {/* Header */}
            <div style={{
                padding: '16px', background: 'rgba(30, 41, 59, 0.95)', backdropFilter: 'blur(10px)',
                display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)',
                zIndex: 50, flexShrink: 0, paddingTop: 'calc(16px + env(safe-area-inset-top))'
            }}>
                <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'white', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <ArrowLeft size={24} />
                </button>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h1 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Match Chat</h1>
                    <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{messages.length} messages</span>
                </div>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '80px' }}>
                {messages.length === 0 && (
                    <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '20vh' }}>
                        <p>No messages yet.</p>
                        <p style={{ fontSize: '0.8rem' }}>Coordinate with your team here!</p>
                    </div>
                )}

                {messages.map((msg, i) => {
                    const isMe = msg.user_id === user?.id;
                    const showAvatar = !isMe && (i === 0 || messages[i - 1].user_id !== msg.user_id);

                    return (
                        <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%', display: 'flex', gap: '8px' }}>
                            {!isMe && (
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#334155', flexShrink: 0, overflow: 'hidden', visibility: showAvatar ? 'visible' : 'hidden' }}>
                                    {msg.profiles?.avatar_url ? (
                                        <img src={supabase.storage.from('avatars').getPublicUrl(msg.profiles.avatar_url).data.publicUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <UserIcon size={16} />
                                        </div>
                                    )}
                                </div>
                            )}
                            <div>
                                {!isMe && showAvatar && (
                                    <div style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '2px', marginLeft: '4px' }}>
                                        {msg.profiles?.full_name?.split(' ')[0] || 'Unknown'}
                                    </div>
                                )}
                                <div style={{
                                    background: isMe ? 'hsl(var(--primary))' : '#334155',
                                    padding: '8px 12px', borderRadius: '16px',
                                    borderBottomRightRadius: isMe ? '4px' : '16px',
                                    borderBottomLeftRadius: isMe ? '16px' : '4px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                    {msg.content}
                                </div>
                                <div style={{ fontSize: '0.6rem', opacity: 0.4, marginTop: '2px', textAlign: isMe ? 'right' : 'left', marginRight: isMe ? '4px' : 0, marginLeft: !isMe ? '4px' : 0 }}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} style={{
                background: '#1e293b', padding: '12px 16px',
                paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
                display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.1)',
                flexShrink: 0
            }}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    style={{
                        flex: 1, background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '24px', padding: '10px 16px', color: 'white', outline: 'none'
                    }}
                />
                <button type="submit" disabled={!newMessage.trim()} style={{
                    background: 'hsl(var(--primary))', border: 'none', width: '44px', height: '44px',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'black', opacity: newMessage.trim() ? 1 : 0.5
                }}>
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
}
