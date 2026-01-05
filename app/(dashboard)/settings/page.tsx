'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LogOut, User, Bell, Moon } from 'lucide-react';
import dynamic from 'next/dynamic';
import styles from './page.module.css';

// 1. We define the logic inside a non-exported component
function SettingsContent() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        // Safe to use window/localStorage here
        const isDark = localStorage.getItem('theme') === 'dark';
        setDarkMode(isDark);
    }, []);

    const handleLogout = async () => {
        setLoading(true);
        await supabase.auth.signOut();
        localStorage.clear();
        router.push('/login');
    };

    const toggleTheme = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
    };

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

// 2. We export a "Safe" version that only loads in the browser
const SettingsPage = dynamic(() => Promise.resolve(SettingsContent), {
    ssr: false, // This forces the server to skip this component entirely
    loading: () => <div style={{ padding: '2rem' }}>Loading settings...</div>
});

export default SettingsPage;