'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        setLoading(true);
        // 1. Create user in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: name } // This saves their name in metadata
            }
        });

        if (error) {
            alert("Error: " + error.message);
        } else {
            alert("Success! Please check your email to verify your account.");
            router.push('/login');
        }
        setLoading(false);
    };

    return (
        <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem' }}>
            <h1>Create Account</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
                <input 
                    className="input" 
                    placeholder="Full Name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                />
                <input 
                    className="input" 
                    placeholder="Email (e.g. name@esade.edu)" 
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
                    onClick={handleSignup} 
                    disabled={loading}
                >
                    {loading ? 'Creating...' : 'Sign Up'}
                </button>
                <p>Already have an account? <Link href="/login">Log In</Link></p>
            </div>
        </div>
    );
}