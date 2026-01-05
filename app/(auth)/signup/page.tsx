'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/store';
import styles from '../login/page.module.css';

import heic2any from 'heic2any'; // Need to install: npm install heic2any

export default function SignupPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');

    // Form Data
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [dob, setDob] = useState('');
    const [nationality, setNationality] = useState('');
    const [handedness, setHandedness] = useState<string>('');
    const [courtSide, setCourtSide] = useState<string>('');
    const [avatar, setAvatar] = useState('');
    const [level, setLevel] = useState('beginner');

    const handleLevelSelect = (lvl: string) => {
        setLevel(lvl);
    };

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

                // heic2any can return a Blob or Blob[]
                const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
                fileToProcess = new File([blob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
            } catch (err) {
                console.error('HEIC conversion failed:', err);
                setError('Could not process HEIC image. Please try a JPEG or PNG.');
                return;
            }
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatar(reader.result as string);
        };
        reader.readAsDataURL(fileToProcess);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (step === 1) {
            if (!email || !password) {
                setError('Please fill in all fields');
                return;
            }
            setStep(2);
            return;
        }

        if (!dob || !nationality || !handedness || !courtSide || !avatar) {
            setError('Please complete all profile fields including the photo.');
            return;
        }

        try {
            // Determine ELO based on level
            let initialElo = 1200;
            if (level === 'intermediate') initialElo = 1400;
            if (level === 'advanced') initialElo = 1600;

            registerUser({
                email,
                password,
                name,
                phone,
                dob,
                country: nationality,
                handedness: handedness as any,
                courtSide: courtSide as any,
                avatar,
                initialElo
            });

            // Auto login or redirect to login? Let's redirect to login for clarity, or just login.
            // Doing auto-login might require updating loginUser to accept just the user object, but for now let's just push to login.
            router.push('/login');
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Create Account</h1>
                <p>Join the ESADE Padel Community</p>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>
                {error && <div className={styles.error}>{error}</div>}

                {step === 1 && (
                    <>
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
                            Next Step
                        </button>
                    </>
                )}

                {step === 2 && (
                    <>
                        {/* Personal Info */}
                        <div className={styles.group}>
                            <label>Full Name</label>
                            <input
                                type="text"
                                className="input"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                                placeholder="e.g. John Doe"
                            />
                        </div>
                        <div className={styles.group}>
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                className="input"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                required
                                placeholder="+34 ..."
                            />
                        </div>
                        <div className={styles.group}>
                            <label>Date of Birth (Age)</label>
                            <input
                                type="date"
                                className="input"
                                value={dob}
                                onChange={e => setDob(e.target.value)}
                                required
                            />
                        </div>
                        <div className={styles.group}>
                            <label>Nationality (Code)</label>
                            <input
                                type="text"
                                className="input"
                                value={nationality}
                                onChange={e => setNationality(e.target.value.toUpperCase().slice(0, 2))}
                                required
                                placeholder="ES, US, FR..."
                                maxLength={2}
                            />
                        </div>

                        {/* Preferences */}
                        <div className={styles.group}>
                            <label>Padel Preferences</label>

                            <div style={{ marginBottom: '0.5rem' }}>Handedness:</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '1rem' }}>
                                {['right', 'left'].map(h => (
                                    <button
                                        key={h}
                                        type="button"
                                        className={`btn ${handedness === h ? 'btn-primary' : 'btn-outline'}`}
                                        onClick={() => setHandedness(h)}
                                        style={{ fontSize: '0.8rem', padding: '0.5rem', textTransform: 'capitalize' }}
                                    >
                                        {h}
                                    </button>
                                ))}
                            </div>

                            <div style={{ marginBottom: '0.5rem' }}>Preferred Side:</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '1rem' }}>
                                {['left', 'right', 'both'].map(s => (
                                    <button
                                        key={s}
                                        type="button"
                                        className={`btn ${courtSide === s ? 'btn-primary' : 'btn-outline'}`}
                                        onClick={() => setCourtSide(s)}
                                        style={{ fontSize: '0.8rem', padding: '0.5rem', textTransform: 'capitalize' }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.group}>
                            <label>Profile Picture</label>
                            <input
                                type="file"
                                accept="image/*,.heic,.heif"
                                onChange={handleImageUpload}
                                className="input"
                                required
                            />
                            {avatar && (
                                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                                    <img src={avatar} alt="Preview" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid hsl(var(--primary))' }} />
                                </div>
                            )}
                        </div>

                        <div className={styles.group}>
                            <label>Skill Level</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                                {['beginner', 'intermediate', 'advanced'].map(lvl => (
                                    <button
                                        key={lvl}
                                        type="button"
                                        className={`btn ${level === lvl ? 'btn-primary' : 'btn-outline'}`}
                                        onClick={() => handleLevelSelect(lvl)}
                                        style={{ fontSize: '0.8rem', padding: '0.5rem', textTransform: 'capitalize' }}
                                    >
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button type="submit" className="btn btn-success" style={{ width: '100%', marginTop: '1rem', backgroundColor: 'hsl(var(--success))', border: 'none' }}>
                            Complete Profile
                        </button>
                        <button type="button" className="btn btn-outline" style={{ width: '100%', marginTop: '0.5rem', border: 'none' }} onClick={() => setStep(1)}>
                            Back
                        </button>
                    </>
                )}
            </form>

            <div className={styles.footer}>
                Already have an account? <Link href="/login">Log In</Link>
            </div>
        </div>
    );
}
