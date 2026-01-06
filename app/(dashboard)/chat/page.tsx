'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';

export default function ChatPage() {
    const router = useRouter();

    return (
        <div style={{ padding: '2rem' }}>
            <button onClick={() => router.back()} className="btn btn-outline" style={{ marginBottom: '1rem', borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>
                &larr; Back
            </button>
            <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.7 }}>
                <h1>Match Chat</h1>
                <p>Chat feature coming soon!</p>
                <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px', margin: '2rem auto' }}>
                    <a href="https://whatsapp.com" target="_blank" className="btn btn-primary" style={{ background: '#25D366' }}>
                        Open WhatsApp Group
                    </a>
                </div>
            </div>
        </div>
    );
}
