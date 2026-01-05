'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/store';
import styles from './page.module.css';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            loginUser(email, password);
            router.push('/');
        } catch (err) {
            setError('Invalid email or password');
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>ESADE Padel</h1>
                <p>Login to book courts and track your ELO.</p>
            </header>

            <form onSubmit={handleLogin} className={styles.form}>
                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.group}>
                    <label>Email</label>
                    <input
                        type="email"
                        className="input"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.group}>
                    <label>Password</label>
                    <input
                        type="password"
                        className="input"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Log In
                </button>
            </form>

            <div className={styles.footer}>
                Don't have an account? <Link href="/signup">Sign Up</Link>
            </div>
        </div>
    );
}
