'use client';

import { X, User, Trophy, Calendar } from 'lucide-react';
import { useEffect } from 'react';
import { Player } from '@/lib/store';
import styles from './ProfileModal.module.css';

interface ProfileModalProps {
    player: Player;
    onClose: () => void;
}

export default function ProfileModal({ player, onClose }: ProfileModalProps) {

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const getFlag = (code?: string) => {
        if (!code) return '🇪🇸'; // Default to Spain for mocked data if missing
        const map: Record<string, string> = { 'ES': '🇪🇸', 'FR': '🇫🇷', 'IT': '🇮🇹', 'PT': '🇵🇹', 'DE': '🇩🇪', 'UK': '🇬🇧', 'BE': '🇧🇪', 'NL': '🇳🇱', 'SE': '🇸🇪' };
        return map[code] || '🌍';
    }

    const winRate = player.matchesPlayed > 0 ? Math.round(((player.wins || 0) / player.matchesPlayed) * 100) : 0;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <X size={24} />
                </button>

                <header className={styles.header}>
                    <div className={styles.avatar}>
                        <User size={32} color="white" />
                    </div>
                    <div className={styles.flag}>
                        {getFlag(player.country)}
                    </div>
                    <h2 className={styles.name}>{player.name}</h2>
                    <p className={styles.details}>
                        {player.course || 'ESADE Player'}
                        {player.year ? ` • Year ${player.year}` : ''}
                    </p>
                </header>

                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <div className={styles.statLabel}>ELO</div>
                        <div className={styles.statValue}>{Math.round(player.elo)}</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statLabel}>Win Rate</div>
                        <div className={styles.statValue} style={{ color: winRate >= 50 ? 'hsl(var(--success))' : 'hsl(var(--warning))' }}>
                            {winRate}%
                        </div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statLabel}>Matches</div>
                        <div className={styles.statValue}>{player.matchesPlayed}</div>
                    </div>
                </div>

            </div>
        </div>
    );
}
