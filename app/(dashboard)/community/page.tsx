'use client';

import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { getPlayers, Player } from '@/lib/store';
import ProfileModal from '@/components/ProfileModal';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

export default function CommunityPage() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

    useEffect(() => {
        getPlayers().then(all => {
            // Sort by ELO default
            const sorted = [...all].sort((a, b) => b.elo - a.elo);
            setPlayers(sorted);
        });
    }, []);

    const filteredPlayers = players.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getFlag = (code?: string) => {
        if (!code) return '🇪🇸'; // Default
        const map: Record<string, string> = { 'ES': '🇪🇸', 'FR': '🇫🇷', 'IT': '🇮🇹', 'PT': '🇵🇹', 'DE': '🇩🇪', 'UK': '🇬🇧', 'BE': '🇧🇪', 'NL': '🇳🇱', 'SE': '🇸🇪', 'US': '🇺🇸' };
        return map[code] || '🌍';
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Community 👥</h1>
                <p>Find matches and new practice partners.</p>
            </header>

            <div className={styles.searchContainer}>
                <div className={styles.inputWrapper}>
                    <Search size={20} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search players..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.list}>
                {filteredPlayers.map((player, index) => {
                    const avatarUrl = player.avatar?.startsWith('http')
                        ? player.avatar
                        : player.avatar
                            ? supabase.storage.from('avatars').getPublicUrl(player.avatar).data.publicUrl
                            : null;

                    return (
                        <div key={player.id} className={styles.card} onClick={() => setSelectedPlayer(player)}>
                            <div className={styles.rank}>#{index + 1}</div>
                            <div className={styles.avatar} style={{
                                background: avatarUrl ? `url(${avatarUrl}) center/cover` : undefined
                            }}>
                                {!avatarUrl && player.name.charAt(0)}
                            </div>
                            <div className={styles.info}>
                                <div className={styles.nameRow}>
                                    <span className={styles.name}>{player.name}</span>
                                    <span className={styles.flag}>{getFlag(player.country)}</span>
                                </div>
                                <div className={styles.meta}>
                                    <span>Matches: {player.matchesPlayed}</span>
                                </div>
                            </div>
                            <div className={styles.elo}>
                                <span>{Math.round(player.elo)}</span>
                                <span className={styles.eloLabel}>ELO</span>
                            </div>
                        </div>
                    )
                })}
            </div>

            {selectedPlayer && (
                <ProfileModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
            )}
        </div>
    );
}
