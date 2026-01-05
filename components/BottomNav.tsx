'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CalendarPlus, Trophy, User, Users } from 'lucide-react';
import styles from './BottomNav.module.css';

export default function BottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className={styles.nav}>
            <Link href="/" className={`${styles.link} ${isActive('/') ? styles.active : ''}`}>
                <Home size={24} />
                <span>Home</span>
            </Link>
            <Link href="/book" className={`${styles.link} ${isActive('/book') ? styles.active : ''}`}>
                <CalendarPlus size={24} />
                <span>Book</span>
            </Link>
            <Link href="/matches" className={`${styles.link} ${isActive('/matches') ? styles.active : ''}`}>
                <Trophy size={24} />
                <span>Matches</span>
            </Link>
            <Link href="/community" className={`${styles.link} ${isActive('/community') ? styles.active : ''}`}>
                <Users size={24} />
                <span>Community</span>
            </Link>
            <Link href="/profile" className={`${styles.link} ${isActive('/profile') ? styles.active : ''}`}>
                <User size={24} />
                <span>Profile</span>
            </Link>
        </nav>
    );
}
