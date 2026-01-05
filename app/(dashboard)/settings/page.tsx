'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { getCurrentUser, updatePlayer, deleteUser, Player } from '@/lib/store';
import { seedDatabase } from '@/lib/seed'; // IMPORTED
import heic2any from 'heic2any'; // Need to install types if failing, but can use @ts-ignore if desperate
import styles from './page.module.css';

const COUNTRIES = [
    { code: 'ES', name: 'Spain', flag: '🇪🇸' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹' },
    { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
    { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
    { code: 'Other', name: 'Other', flag: '🌍' },
];

export default function SettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState<Player | null>(null);
    const [msg, setMsg] = useState('');

    // Form State
    const [newPassword, setNewPassword] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        dob: '',
        country: '',
        course: '',
        year: '',
        handedness: '',
        courtSide: '',
        avatar: ''
    });

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
            setFormData({
                name: currentUser.name || '',
                phone: currentUser.phone || '',
                dob: currentUser.dob || '',
                country: currentUser.country || 'ES',
                course: currentUser.course || '',
                year: currentUser.year || '',
                handedness: currentUser.handedness || '',
                courtSide: currentUser.courtSide || '',
                avatar: currentUser.avatar || ''
            });
        } else {
            router.push('/login');
        }
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ... (rest of imports)

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        let fileToProcess = file;

        // Check for HEIC
        if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') {
            try {
                const convertedBlob = await heic2any({
                    blob: file,
                    toType: 'image/jpeg',
                    quality: 0.8
                });
                const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
                fileToProcess = new File([blob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
            } catch (err) {
                console.error('HEIC conversion failed:', err);
                setMsg('Error: Could not convert HEIC image.');
                setTimeout(() => setMsg(''), 3000);
                return;
            }
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, avatar: reader.result as string }));
        };
        reader.readAsDataURL(fileToProcess);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const updatedUser: Player = {
            ...user,
            ...formData,
            handedness: formData.handedness as any,
            courtSide: formData.courtSide as any,
            password: newPassword ? newPassword : user.password
        };

        updatePlayer(updatedUser);
        // Update session too
        localStorage.setItem('esade_padel_current_user', JSON.stringify(updatedUser)); // manual update for session

        setMsg('Profile updated successfully!');
        setTimeout(() => setMsg(''), 3000);
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
            if (user) {
                deleteUser(user.id);
                router.push('/login');
            }
        }
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div style={{ padding: '1rem', paddingTop: '2rem' }}>
            <header className={styles.header}>
                <button onClick={() => router.back()} className={styles.backBtn}>
                    <ArrowLeft size={24} />
                </button>
                <h1>Settings</h1>
            </header>

            {msg && <div className={styles.success}>{msg}</div>}

            {/* SEED DATABASE BUTTON (Visible for Demo/Admin) */}
            <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px dashed hsl(var(--primary))', borderRadius: '12px', background: 'hsl(var(--primary)/0.05)' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'hsl(var(--primary))' }}>🛠️ Demo Tools</h3>
                <p style={{ fontSize: '0.85rem', marginBottom: '1rem', opacity: 0.8 }}>Populate your empty database with fake clubs, players, matches and bookings to test the app.</p>
                <button
                    type="button"
                    className="btn btn-outline"
                    style={{ width: '100%' }}
                    onClick={async () => {
                        if (confirm("This will insert fake data. Continue?")) {
                            setMsg("Seeding database... please wait.");
                            const res = await seedDatabase();
                            if (res.success) {
                                setMsg("Database populated! 🚀 Go to Dashboard to see data.");
                            } else {
                                setMsg("Error: " + res.error);
                            }
                        }
                    }}
                >
                    Populate Demo Data
                </button>
            </div>

            <form onSubmit={handleSave} className={styles.form}>
                <div className={styles.group}>
                    <label>Full Name</label>
                    <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="input"
                        required
                    />
                </div>

                <div className={styles.group}>
                    <label>Phone Number</label>
                    <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="input"
                        required
                    />
                </div>

                <div className={styles.row}>
                    <div className={styles.group}>
                        <label>Date of Birth</label>
                        <input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            className="input"
                            required
                        />
                    </div>
                    <div className={styles.group}>
                        <label>Country</label>
                        <select
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className="input"
                        >
                            {COUNTRIES.map(c => (
                                <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className={styles.group}>
                    <label>Profile Picture</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: 'hsl(var(--secondary))',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '1.5rem',
                            fontWeight: 'bold'
                        }}>
                            {formData.avatar ? (
                                <img src={formData.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                formData.name.charAt(0)
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*,.heic,.heif"
                            onChange={handleImageUpload}
                            className="input"
                            style={{ flex: 1 }}
                        />
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.group}>
                        <label>Course</label>
                        <input
                            name="course"
                            value={formData.course}
                            onChange={handleChange}
                            className="input"
                            placeholder="e.g. BBA"
                        />
                    </div>
                    <div className={styles.group}>
                        <label>Year</label>
                        <select
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            className="input"
                        >
                            <option value="">Select...</option>
                            <option value="1">Year 1</option>
                            <option value="2">Year 2</option>
                            <option value="3">Year 3</option>
                            <option value="4">Year 4</option>
                            <option value="Alumni">Alumni</option>
                        </select>
                    </div>
                </div>

                {/* Preferences */}
                <div className={styles.group} style={{ marginTop: '1rem' }}>
                    <label>Padel Preferences</label>
                    <div className={styles.row}>
                        <div className={styles.group}>
                            <label style={{ fontSize: '0.8rem', color: 'hsl(var(--foreground)/0.7)' }}>Handedness</label>
                            <select
                                name="handedness"
                                value={formData.handedness || ''}
                                onChange={handleChange}
                                className="input"
                            >
                                <option value="">Select...</option>
                                <option value="right">Right</option>
                                <option value="left">Left</option>
                            </select>
                        </div>
                        <div className={styles.group}>
                            <label style={{ fontSize: '0.8rem', color: 'hsl(var(--foreground)/0.7)' }}>Preferred Side</label>
                            <select
                                name="courtSide"
                                value={formData.courtSide || ''}
                                onChange={handleChange}
                                className="input"
                            >
                                <option value="">Select...</option>
                                <option value="left">Left</option>
                                <option value="right">Right</option>
                                <option value="both">Both</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div style={{ marginTop: '2rem', borderTop: '1px solid hsl(var(--border))', paddingTop: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Security</h3>
                    <div className={styles.group}>
                        <label>New Password (Optional)</label>
                        <input
                            type="password"
                            name="newPassword"
                            placeholder="Leave empty to keep current"
                            className="input"
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                    <Save size={18} style={{ marginRight: '8px' }} /> Save Changes
                </button>
            </form>

            <div style={{ marginTop: '3rem', borderTop: '1px solid hsl(var(--border))', paddingTop: '2rem' }}>
                <h3 style={{ color: 'hsl(var(--destructive))', marginBottom: '1rem' }}>Danger Zone</h3>
                <button
                    type="button"
                    className="btn btn-outline"
                    style={{ width: '100%', borderColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive))' }}
                    onClick={handleDelete}
                >
                    <Trash2 size={18} style={{ marginRight: '8px' }} /> Delete Account
                </button>
            </div>
        </div>
    );
}
