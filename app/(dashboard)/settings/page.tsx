'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LogOut, User, Bell, Moon } from 'lucide-react';
import styles from './page.module.css';

export default function SettingsPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false); // <--- The Fix
    const [loading, setLoading] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    // 1. Wait until the component runs in the browser
    useEffect(() => {
        setMounted(true);
        // Only access localStorage after we know we are in the browser
        const isDark = localStorage.getItem('theme') === 'dark';
        setDarkMode(isDark);
    }, []);

    const handleLogout = async () => {
        setLoading(true);
        await supabase.auth.signOut();
        localStorage.clear(); // Safe because this function only runs on click
        router.push('/login');
    };

    const toggleTheme = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
    };

    // 2. If we are on the server (not mounted yet), render NOTHING.
    // This prevents the "window not defined" crash completely.
    if (!mounted) {
        return null;
    }

    return (
        <div style={{ padding: '1rem' }}>
            <h1 className={styles.title}>Settings</h1>

            <div className={styles.section}>
                <h2>Preferences</h2>
                <div className={styles.card}>
                    <button className={styles.row} onClick={toggleTheme}>
                        <div className={styles.iconBox}><Moon size={20} /></div>
                        <div className={styles.info}>
                            <div className={styles.label}>Dark Mode</div>
                            <div className={styles.value}>{darkMode ? 'On' : 'Off'}</div>
                        </div>
                    </button>
                    <div className={styles.divider} />
                    <div className={styles.row}>
                        <div className={styles.iconBox}><Bell size={20} /></div>
                        <div className={styles.info}>
                            <div className={styles.label}>Notifications</div>
                            <div className={styles.value}>On</div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
                <button
                    className="btn btn-outline"
                    style={{ width: '100%', borderColor: 'red', color: 'red' }}
                    onClick={handleLogout}
                    disabled={loading}
                >
                    <LogOut size={18} /> {loading ? 'Logging out...' : 'Log Out'}
                </button>
            </div>
        </div>
    );
}