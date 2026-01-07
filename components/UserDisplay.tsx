'use client';

import React, { useState } from 'react';
import { getFlagEmoji } from '@/common/countries';
import { supabase } from '@/lib/supabase';

interface UserDisplayProps {
    userId: string;
    name: string;
    countryCode?: string;
    elo?: number;
    avatar?: string;
    currentUser?: any;
    style?: React.CSSProperties;
    className?: string;
}

export default function UserDisplay({ userId, name, countryCode, elo, avatar, style, className }: UserDisplayProps) {
    const [showCard, setShowCard] = useState(false);

    // Resolve avatar URL if it's a relative path
    const avatarUrl = avatar?.startsWith('http')
        ? avatar
        : avatar
            ? supabase.storage.from('avatars').getPublicUrl(avatar).data.publicUrl
            : null;

    // If click, show card
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent parent clicks (like picking a match)
        setShowCard(true);
    };

    return (
        <>
            <span
                className={`user-display ${className || ''}`}
                onClick={handleClick}
                style={{
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 500,
                    ...style
                }}
            >
                {/* Avatar */}
                <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: avatarUrl ? `url(${avatarUrl}) center/cover` : '#334155',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '0.8rem', fontWeight: 700,
                    overflow: 'hidden'
                }}>
                    {!avatarUrl && (name.charAt(0) || 'P')}
                </div>

                {/* Flag */}
                {countryCode && <span role="img" aria-label="flag" style={{ fontSize: '1.2em' }}>{getFlagEmoji(countryCode)}</span>}

                {/* Name */}
                <span style={{ borderBottom: '1px dotted rgba(255,255,255,0.3)' }}>{name}</span>
            </span>

            {/* Modal */}
            {showCard && (
                <PlayerCardModal
                    isOpen={showCard}
                    onClose={() => setShowCard(false)}
                    userId={userId}
                />
            )}
        </>
    );
}
