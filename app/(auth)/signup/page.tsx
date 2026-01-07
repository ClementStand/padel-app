'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Eye, EyeOff, Check, XCircle } from 'lucide-react';
import { COUNTRIES, getFlagEmoji } from '@/common/countries';

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        if (!email || !password || !confirmPassword || !name || !country || !course || !year || !dob || !profileFile) {
            alert("Please fill in ALL fields, including profile picture.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
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
                        dob,
                        avatar_path: null // Will be updated after upload
                    }
                }
            });

            // Predict path for metadata (Trigger needs this!)
            let finalAvatarPath = '';
            if (data.user && profileFile) {
                const fileExt = profileFile.name.split('.').pop();
                finalAvatarPath = `${data.user.id}/avatar.${fileExt}`;

                // Immediate metadata update to ensure Trigger gets the right path
                await supabase.auth.updateUser({
                    data: { avatar_path: finalAvatarPath }
                });
            }

            if (error) throw error;

            if (data.user) {
                // 2. Upload Profile Picture
                // Note: This might fail if Email Confirmation is ON (no session yet).
                // If it fails, the Trigger will still create the profile with the metadata data, 
                // but the avatar_url might be empty or valid-but-not-uploaded.
                if (profileFile) {
                    const fileExt = profileFile.name.split('.').pop();
                    const fileName = `${data.user.id}/avatar.${fileExt}`;

                    // Attempt upload
                    const { error: uploadError } = await supabase.storage
                        .from('avatars')
                        .upload(fileName, profileFile, { upsert: true });

                    if (uploadError) {
                        console.warn('Avatar upload deferred (likely email verification pending):', uploadError);
                        // We do NOT block flow. The user can upload later.
                    } else {
                        // If successful, update the user metadata so the Trigger (or future logic) knows about it
                        await supabase.auth.updateUser({
                            data: { avatar_path: fileName }
                        });
                    }
                }

                // 3. NO EXPLICIT INSERT needed here anymore.
                // The 'on_auth_user_created' Postgres Trigger will handle creating the profile row
                // using the metadata we passed in signUp(). This avoids RLS issues.
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
                {/* Country Dropdown */}
                <select
                    className="input"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    style={{ appearance: 'none', background: 'hsl(var(--input))', color: 'white' }}
                >
                    <option value="" disabled>Select Country</option>
                    {COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>
                            {getFlagEmoji(c.code)} {c.name}
                        </option>
                    ))}
                </select>
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

                {/* Password Field */}
                <div style={{ position: 'relative' }}>
                    <input
                        className="input"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ paddingRight: '46px' }}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)',
                            background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
                            padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                        aria-label="Toggle password visibility"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>

                {/* Confirm Password Field */}
                <div style={{ position: 'relative' }}>
                    <input
                        className="input"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={{ paddingRight: '46px', borderColor: confirmPassword && password === confirmPassword ? 'hsl(var(--success))' : undefined }}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{
                            position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)',
                            background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
                            padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                        aria-label="Toggle confirm password visibility"
                    >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>

                {/* Match Feedback */}
                {password && confirmPassword && (
                    <div style={{
                        fontSize: '0.8rem',
                        color: password === confirmPassword ? 'hsl(var(--success))' : 'hsl(var(--destructive))',
                        display: 'flex', alignItems: 'center', gap: '6px', marginTop: '-0.5rem'
                    }}>
                        {password === confirmPassword ? (
                            <><Check size={14} /> Passwords match</>
                        ) : (
                            <><XCircle size={14} /> Passwords do not match</>
                        )}
                    </div>
                )}
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