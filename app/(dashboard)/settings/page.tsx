'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Direct auth usage
import { getCurrentUser, updatePlayer, Player, deleteUser } from '@/lib/store';
import Card from '@/components/Card';
import { Save, Lock, Mail, Globe, User, Trash2, ArrowLeft, LogOut, Camera, GraduationCap } from 'lucide-react';
import { COUNTRIES, getFlagEmoji } from '@/common/countries';

export default function SettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState<Player | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [fullName, setFullName] = useState('');
    const [country, setCountry] = useState('');
    const [dob, setDob] = useState('');
    const [course, setCourse] = useState('');
    const [year, setYear] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
        setCourse(u.course || '');
        setYear(u.year || '');

        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser?.email) setEmail(authUser.email);

        if (u.avatar) {
            const url = u.avatar.startsWith('http')
                ? u.avatar
                : supabase.storage.from('avatars').getPublicUrl(u.avatar).data.publicUrl;
            setAvatarUrl(url);
        }

        setLoading(false);
    }

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploadingAvatar(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${user?.id || 'unknown'}-${Math.random()}.${fileExt}`;
            const filePath = `${user?.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: filePath }) // Note calls it 'avatar_url' in DB triggers usually but code uses 'avatar'
            // Wait, let's check store.ts updatePlayer.
            // The store uses 'avatar' which maps to DB 'avatar_url'? 
            // Let's stick to updatePlayer from store if possible, or use the direct profile update as done in handleUpdateProfile.
            // handleUpdateProfile uses direct supabase.from('profiles').update which expects DB column names.
            // Checking previous code: updatePlayer({id, avatar: fileName})

            // Let's use the updatePlayer from store to be safe if it handles mapping, 
            // BUT this file uses direct supabase calls in handleUpdateProfile.
            // Let's use the direct call to match local style or better yet, use updatePlayer to be consistent with store.
            // Actually, handleUpdateProfile uses 'country' and 'dob' which matches DB?
            // Let's check store.ts. 
            // In store.ts: getPlayers maps p.avatar_url to avatar. 
            // updatePlayer takes Partial<Player> and maps it back.
            // Let's use updatePlayer to be safe and consistent.

            await updatePlayer({ id: user!.id, avatar: filePath });

            setAvatarUrl(publicUrl);
            alert('Avatar updated!');
        } catch (error: any) {
            alert('Error uploading avatar: ' + error.message);
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleUpdateProfile = async () => {
        if (!user) return;
        setSaving(true);
        try {
            // Update Profile Table
            const { error } = await supabase.from('profiles').update({
                full_name: fullName,
                country: country,
                dob: dob,
                course: course,
                year: year
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

                        {/* Profile Picture Section */}
                        <div className="form-group" style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ position: 'relative', width: '100px', height: '100px', marginBottom: '1rem' }}>
                                <div style={{
                                    width: '100%', height: '100%', borderRadius: '50%',
                                    background: avatarUrl ? `url(${avatarUrl}) center/cover` : '#334155',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '2.5rem', fontWeight: 700,
                                    overflow: 'hidden'
                                }}>
                                    {!avatarUrl && (fullName?.charAt(0) || 'P')}
                                </div>
                                <label htmlFor="avatar-upload" style={{
                                    position: 'absolute', bottom: 0, right: 0,
                                    background: 'hsl(var(--primary))', color: 'black',
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                                }}>
                                    {uploadingAvatar ? <span className="animate-spin">⌛</span> : <Camera size={18} />}
                                </label>
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    style={{ display: 'none' }}
                                    disabled={uploadingAvatar}
                                />
                            </div>
                            <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>Tap the camera icon to change your photo</p>
                        </div>

                        {/* Full Name removed from here (duplicate) */}
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', opacity: 0.8 }}>Country</label>
                            <select
                                value={country}
                                onChange={e => setCountry(e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                            >
                                <option value="">Select Country</option>
                                {COUNTRIES.map(c => (
                                    <option key={c.code} value={c.code}>
                                        {c.code === 'UK' ? '🇬🇧' : getFlagEmoji(c.code)} {c.name}
                                    </option>
                                ))}
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
                    </Card>
                </section>

                {/* 2. University */}
                <section>
                    <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <GraduationCap size={18} /> University
                    </h2>
                    <Card>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div className="form-group" style={{ flex: 2 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', opacity: 0.8 }}>Course</label>
                                <input
                                    className="input"
                                    value={course}
                                    onChange={e => setCourse(e.target.value.toUpperCase())}
                                    placeholder="e.g. BBA"
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                />
                                <p style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '4px' }}>Must be all caps (e.g. BBA, MSC)</p>
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', opacity: 0.8 }}>Year</label>
                                <input
                                    className="input"
                                    value={year}
                                    onChange={e => setYear(e.target.value)}
                                    placeholder="e.g. 2026"
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                />
                                <p style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '4px' }}>Graduation Year</p>
                            </div>
                        </div>
                        <button className="btn btn-primary" onClick={handleUpdateProfile} disabled={saving} style={{ marginTop: '1rem' }}>
                            <Save size={18} style={{ marginRight: '8px' }} /> Save Profile
                        </button>
                    </Card>
                </section>

                {/* 3. Security (renumbered to match flow visually, though code structure allows flexibility) */}
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