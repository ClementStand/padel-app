'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, CheckCircle } from 'lucide-react';
import styles from './page.module.css';
// We now import 'getClubs' and the 'Club' type instead of the hardcoded 'CLUBS' list
import { createBooking, getClubs, Club } from '@/lib/store';

export default function BookPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [selectedClub, setSelectedClub] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');

    // NEW: State to store the clubs we fetch from the database
    const [clubs, setClubs] = useState<Club[]>([]);

    // NEW: Fetch clubs from Supabase when the page loads
    useEffect(() => {
        getClubs().then((fetchedClubs) => {
            setClubs(fetchedClubs);
        });
    }, []);

    // MODIFIED: This is now 'async' so it can wait for the database
    const handleBook = async () => {
        if (!selectedClub || !selectedDate || !selectedTime) return;

        try {
            // We use 'await' here. If the club is full (max 6), this will throw an error.
            await createBooking({
                clubId: selectedClub,
                date: selectedDate,
                time: selectedTime,
                userId: 'user_1', // We will replace this with the real logged-in user later
            });

            // Only move to step 3 if the line above didn't crash
            setStep(3);
        } catch (error) {
            // Show a simple alert if the booking failed (e.g., "Full: Max 6 courts")
            alert((error as Error).message);
        }
    };

    return (
        <div style={{ padding: '1rem', paddingTop: '2rem' }}>
            <h1 style={{ marginBottom: '1.5rem' }}>Book a Court</h1>

            {step === 1 && (
                <section className={styles.fadeIn}>
                    <h2 className={styles.subtitle}>
                        <MapPin size={20} /> Select Club
                    </h2>
                    <div className={styles.clubGrid}>
                        {/* We now map over the 'clubs' state, not the 'CLUBS' constant */}
                        {clubs.map(club => (
                            <button
                                key={club.id}
                                className={`${styles.clubCard} ${selectedClub === club.id ? styles.selected : ''}`}
                                onClick={() => setSelectedClub(club.id)}
                            >
                                <div className={styles.clubIcon}>🎾</div>
                                <div className={styles.clubName}>{club.name}</div>
                                <div className={styles.clubInfo}>{club.courts} courts</div>
                            </button>
                        ))}
                    </div>

                    {/* Loading state: If clubs haven't loaded yet, show a small text */}
                    {clubs.length === 0 && <p className={styles.note}>Loading clubs...</p>}

                    <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                        <button
                            className="btn btn-primary"
                            disabled={!selectedClub}
                            onClick={() => setStep(2)}
                        >
                            Next Step
                        </button>
                    </div>
                </section>
            )}

            {step === 2 && (
                <section className={styles.fadeIn}>
                    <h2 className={styles.subtitle}>
                        <Calendar size={20} /> Select Time
                    </h2>

                    <div className={styles.formGroup}>
                        <label>Date</label>
                        <input
                            type="date"
                            className="input"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Time Slot</label>
                        <select
                            className="input"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                        >
                            <option value="">Select a time...</option>
                            <option value="09:00">09:00 - 10:30</option>
                            <option value="10:30">10:30 - 12:00</option>
                            <option value="17:00">17:00 - 18:30</option>
                            <option value="18:30">18:30 - 20:00</option>
                            <option value="20:00">20:00 - 21:30</option>
                        </select>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                        <button className="btn btn-outline" onClick={() => setStep(1)}>Back</button>
                        <button
                            className="btn btn-primary"
                            disabled={!selectedDate || !selectedTime}
                            onClick={handleBook}
                        >
                            Confirm Request
                        </button>
                    </div>
                </section>
            )}

            {step === 3 && (
                <section className={`${styles.fadeIn} ${styles.success}`}>
                    <div className={styles.successIcon}>
                        <CheckCircle size={64} color="hsl(var(--success))" />
                    </div>
                    <h2>Request Sent!</h2>
                    <p>We have received your booking request for <strong>{clubs.find(c => c.id === selectedClub)?.name}</strong>.</p>
                    <div className={styles.statusBox}>
                        Status: <span className={styles.statusBadge}>Pending</span>
                    </div>
                    <p className={styles.note}>We will confirm availability shortly.</p>

                    <div style={{ marginTop: '2rem' }}>
                        <button className="btn btn-primary" onClick={() => router.push('/')}>
                            Back Home
                        </button>
                    </div>
                </section>
            )}
        </div>
    );
}