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

    // New Mandatory Fields
    const [country, setCountry] = useState('');
    const [course, setCourse] = useState('');
    const [year, setYear] = useState(''); // e.g. "Year 1", "MBA 2026"
    const [dob, setDob] = useState('');
    const [profileFile, setProfileFile] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        // Validation
        if (!email || !password || !name || !country || !course || !year || !dob || !profileFile) {
            alert("Please fill in ALL fields, including profile picture.");
            return;
        }

        setLoading(true);

        try {
            // 1. Create user in Supabase Auth
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        country,
                        course,
                        year,
                        dob
                        // We will handle avatar upload separately or via a trigger if needed, 
                        // but storing metadata here helps triggers.
                    }
                }
            });

            if (error) throw error;

            if (data.user) {
                // 2. Upload Profile Picture (if user is created)
                if (profileFile) {
                    const fileExt = profileFile.name.split('.').pop();
                    const fileName = `${data.user.id}/avatar.${fileExt}`;

                    const { error: uploadError } = await supabase.storage
                        .from('avatars') // Ensure this bucket exists
                        .upload(fileName, profileFile, { upsert: true });

                    if (uploadError) {
                        console.error('Error uploading avatar:', uploadError);
                        // Don't fail the whole signup, but warn
                        alert("Account created, but avatar upload failed. You can update it later.");
                    } else {
                        // Update profile with avatar URL if needed, 
                        // or rely on a consistent path convention / public URL construction.
                        // Ideally we update the separate 'profiles' table or user metadata.
                        // Let's try updating metadata for now as fallback.
                        await supabase.auth.updateUser({
                            data: { avatar_path: fileName }
                        });
                    }
                }
            }

            alert("Success! Please check your email to verify your account.");
            router.push('/login');

        } catch (error: any) {
            alert("Error: " + error.message);
        } finally {
            setLoading(false);
        }
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

                {/* New Mandatory Fields */}
                <input
                    className="input"
                    placeholder="Country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                />
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        className="input"
                        placeholder="Course (e.g. BBA)"
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        style={{ flex: 2 }}
                    />
                    <input
                        className="input"
                        placeholder="Year (e.g. 2)"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        style={{ flex: 1 }}
                    />
                </div>
                <div>
                    <label style={{ fontSize: '0.8rem', marginBottom: '4px', display: 'block' }}>Date of Birth</label>
                    <input
                        className="input"
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                    />
                </div>
                <div>
                    <label style={{ fontSize: '0.8rem', marginBottom: '4px', display: 'block' }}>Profile Picture *</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setProfileFile(e.target.files?.[0] || null)}
                        style={{ fontSize: '0.9rem' }}
                    />
                </div>

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