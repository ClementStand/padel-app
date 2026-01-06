'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Direct auth usage
import { getCurrentUser, updatePlayer, Player, deleteUser } from '@/lib/store';
import Card from '@/components/Card';
import { Save, Lock, Mail, Globe, User, Trash2, ArrowLeft, LogOut } from 'lucide-react';

export default function SettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState<Player | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [fullName, setFullName] = useState('');
    const [country, setCountry] = useState('');
    const [dob, setDob] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const u = await getCurrentUser();
        if (!u) {
            router.push('/login');
            return;
        }
        setUser(u);
        setFullName(u.name || '');
        setCountry(u.country || '');
        setDob(u.dob || '');

        // Fetch real email
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser?.email) setEmail(authUser.email);

        setLoading(false);
    }

    const handleUpdateProfile = async () => {
        if (!user) return;
        setSaving(true);
        try {
            // Update Profile Table
            const { error } = await supabase.from('profiles').update({
                full_name: fullName,
                country: country,
                dob: dob
            }).eq('id', user.id);

            if (error) throw error;
            alert("Profile details updated!");
        } catch (e: any) {
            alert("Error updating profile: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateEmail = async () => {
        if (!email) return;
        setSaving(true);
        try {
            const { error } = await supabase.auth.updateUser({ email });
            if (error) throw error;
            alert("Confirmation email sent to new address! Please verify to complete the change.");
        } catch (e: any) {
            alert("Error updating email: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!password || password !== confirmPassword) {
            alert("Passwords do not match or are empty");
            return;
        }
        setSaving(true);
        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            alert("Password updated successfully!");
            setPassword('');
            setConfirmPassword('');
        } catch (e: any) {
            alert("Error updating password: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!user) return;
        const confirmText = prompt("Type 'DELETE' to permanently delete your account. This cannot be undone.");
        if (confirmText !== 'DELETE') return;

        setSaving(true);
        try {
            await deleteUser(user.id); // Deletes profile
            /* In a real scenario, you'd use admin auth to delete the user account or an RPC function.
               Client-side delete of auth.users is not allowed typically.
               We will sign them out and show a message. */
            await supabase.auth.signOut();
            alert("Account profile deleted. Please contact support to scrub authentication data if needed.");
            router.push('/login');
        } catch (e: any) {
            alert("Error deleting account: " + e.message);
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', paddingTop: '40vh' }}>Loading Settings...</div>;

    return (
        <div style={{ padding: '1rem', paddingTop: '2rem', paddingBottom: '90px', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
                <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Account Settings</h1>
            </div>

            <div style={{ display: 'grid', gap: '2rem' }}>
                {/* 1. Public Profile */}
                <section>
                    <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={18} /> Public Profile
                    </h2>
                    <Card>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', opacity: 0.8 }}>Full Name</label>
                            <input
                                className="input"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                placeholder="Your Name"
                                style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', opacity: 0.8 }}>Country</label>
                            <select
                                value={country}
                                onChange={e => setCountry(e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                            >
                                <option value="">Select Country</option>
                                <option value="ES">🇪🇸 Spain</option>
                                <option value="FR">🇫🇷 France</option>
                                <option value="IT">🇮🇹 Italy</option>
                                <option value="PT">🇵🇹 Portugal</option>
                                <option value="DE">🇩🇪 Germany</option>
                                <option value="UK">🇬🇧 United Kingdom</option>
                                <option value="BE">🇧🇪 Belgium</option>
                                <option value="NL">🇳🇱 Netherlands</option>
                                <option value="SE">🇸🇪 Sweden</option>
                                <option value="OTHER">🌍 Other</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', opacity: 0.8 }}>Date of Birth</label>
                            <input
                                type="date"
                                value={dob}
                                onChange={e => setDob(e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', colorScheme: 'dark' }}
                            />
                        </div>
                        <button className="btn btn-primary" onClick={handleUpdateProfile} disabled={saving}>
                            <Save size={18} style={{ marginRight: '8px' }} /> Save Profile
                        </button>
                    </Card>
                </section>

                {/* 2. Security */}
                <section>
                    <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Lock size={18} /> Security
                    </h2>
                    <Card style={{ marginBottom: '1rem' }}>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', opacity: 0.8 }}>Update Email</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    className="input"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="new@email.com"
                                    style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                />
                                <button className="btn" onClick={handleUpdateEmail} disabled={saving} style={{ background: 'rgba(255,255,255,0.1)', width: 'auto' }}>
                                    Update
                                </button>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', opacity: 0.8 }}>Change Password</label>
                            <input
                                type="password"
                                className="input"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="New Password"
                                style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', marginBottom: '8px' }}
                            />
                            <input
                                type="password"
                                className="input"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="Confirm Password"
                                style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                            />
                        </div>
                        <button className="btn" onClick={handleUpdatePassword} disabled={saving} style={{ background: 'hsl(var(--primary))', color: 'black' }}>
                            Update Password
                        </button>
                    </Card>
                </section>

                {/* 3. Danger Zone */}
                <section>
                    <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'hsl(var(--destructive))' }}>Danger Zone</h2>
                    <Card style={{ border: '1px solid hsl(var(--destructive))', background: 'rgba(239, 68, 68, 0.05)' }}>
                        <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '1rem' }}>
                            Permanently delete your account and profile data. This action cannot be undone.
                        </p>
                        <button className="btn" onClick={handleDeleteAccount} disabled={saving} style={{ background: 'hsl(var(--destructive))', color: 'white', width: '100%' }}>
                            <Trash2 size={18} style={{ marginRight: '8px' }} /> Delete Account
                        </button>
                    </Card>
                </section>
            </div>
        </div>
    );
}