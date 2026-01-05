'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            alert("Login failed: " + error.message);
            setLoading(false);
        } else {
            router.push('/'); // Go to dashboard on success
            router.refresh();
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem' }}>
            <h1>Welcome Back</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
                <input 
                    className="input" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                />
                <input 
                    className="input" 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                />
                <button 
                    className="btn btn-primary" 
                    onClick={handleLogin}
                    disabled={loading}
                >
                    {loading ? 'Logging in...' : 'Log In'}
                </button>
                <p>New player? <Link href="/signup">Create Account</Link></p>
            </div>
        </div>
    );
}