'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Handle Email Confirmation / Password Reset Links
    useEffect(() => {
        const handleAuthCallback = async () => {
            // Check for PKCE 'code'
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');

            if (code) {
                setLoading(true);
                const { error } = await supabase.auth.exchangeCodeForSession(code);
                if (!error) {
                    alert("Email verified! Logging you in...");
                    router.push('/');
                    router.refresh();
                } else {
                    alert("Verification check failed: " + error.message);
                    setLoading(false);
                }
            }

            // Check for Implicit 'access_token' (Hash Fragment)
            // Note: supabase.auth implementation with detectSessionInUrl: true usually handles this,
            // but we can add a listener to be sure.
            supabase.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN' && session) {
                    // If we just landed and got signed in, redirect.
                    // But we don't want to redirect if user is just typing.
                    // Only redirects if we are "loading" or if URL has hash?
                    if (window.location.hash && window.location.hash.includes('access_token')) {
                        router.push('/');
                        router.refresh();
                    }
                }
            });
        };

        handleAuthCallback();
    }, [router]);

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