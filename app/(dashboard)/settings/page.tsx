'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LogOut, User, Bell, Moon } from 'lucide-react';
import styles from './page.module.css';

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    // Default to false to avoid server/client mismatch
    const [darkMode, setDarkMode] = useState(false);

    // FIX: We strictly access localStorage ONLY inside useEffect
    useEffect(() => {
        // This check ensures code only runs in the browser
        if (typeof window !== 'undefined') {
            const isDark = localStorage.getItem('theme') === 'dark';
            setDarkMode(isDark);
        }
    }, []);

    const handleLogout = async () => {
        setLoading(true);
        await supabase.auth.signOut();
        
        // Safe check before clearing
        if (typeof window !== 'undefined') {
            localStorage.clear();
        }
        
        router.push('/login');
    };

    const toggleTheme = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        if (typeof window !== 'undefined') {
            localStorage.setItem('theme', newMode ? 'dark' : 'light');
        }
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