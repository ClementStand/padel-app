'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, CheckCircle } from 'lucide-react';
import styles from './page.module.css';
// We now import 'getClubs' and the 'Club' type instead of the hardcoded 'CLUBS' list
import { createBooking, getClubs, getSlotAvailability, Club, getCurrentUser } from '@/lib/store';

export default function BookPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [selectedClub, setSelectedClub] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    // NEW: Computed slots based on club/day
    const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

    const [selectedTime, setSelectedTime] = useState<string>('');
    const [availability, setAvailability] = useState<Record<string, number>>({});

    // Slots definition
    const TIME_SLOTS = [
        "09:00", "10:30", "12:00", "13:30", "15:00",
        "16:30", "18:00", "19:30", "21:00", "22:30"
    ];

    // NEW: State to store the clubs we fetch from the database
    const [clubs, setClubs] = useState<Club[]>([]);

    // NEW: Fetch clubs from Supabase when the page loads
    useEffect(() => {
        getClubs().then((fetchedClubs) => {
            setClubs(fetchedClubs);
        });
    }, []);

    // NEW: Update available slots when Club or Date changes
    useEffect(() => {
        if (!selectedClub || !selectedDate) {
            setAvailableTimeSlots([]);
            return;
        }

        const dateObj = new Date(selectedDate);
        const day = dateObj.getDay(); // 0=Sun, 1=Mon, ...

        const slots = getSlotsForClub(selectedClub, day);
        setAvailableTimeSlots(slots);
        setSelectedTime(''); // Reset time selection

    }, [selectedClub, selectedDate, clubs]);

    // Helper to get slots
    const getSlotsForClub = (clubId: string, day: number) => {
        const club = clubs.find(c => c.id === clubId);
        if (!club) return [];
        const name = club.name.toLowerCase();

        if (name.includes('tibidabo')) {
            if (day === 2 || day === 3 || day === 5) return ["11:00", "15:00"];
        } else if (name.includes('santcu')) {
            if (day === 3 || day === 4 || day === 5) return ["11:00", "15:00"];
        } else {
            return ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00", "19:30", "21:00"];
        }
        return [];
    };

    useEffect(() => {
        if (selectedDate && selectedClub) {
            getSlotAvailability(selectedDate, selectedClub).then(counts => {
                setAvailability(counts);
            });
        }
    }, [selectedDate, selectedClub]);

    // MODIFIED: This is now 'async' so it can wait for the database
    const handleBook = async () => {
        if (!selectedClub || !selectedDate || !selectedTime) return;

        try {
            const currentUser = await getCurrentUser();
            if (!currentUser) throw new Error("Please log in again.");

            // We use 'await' here. If the club is full (max 6), this will throw an error.
            await createBooking({
                clubId: selectedClub,
                date: selectedDate,
                time: selectedTime,
                userId: currentUser.id, // Fixed: Using real UUID
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
                        {/* 10-Day Selector: horizontal scroll of chips */}
                        <div style={{ display: 'flex', overflowX: 'auto', gap: '8px', paddingBottom: '8px' }}>
                            {Array.from({ length: 10 }).map((_, i) => {
                                const d = new Date();
                                d.setDate(d.getDate() + i);
                                const val = d.toISOString().split('T')[0];
                                const isSelected = selectedDate === val;

                                // Format: "Mon 18"
                                const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                                const dayNum = d.getDate();
                                const dayIndex = d.getDay();

                                // Check if this day has slots for selected club
                                if (selectedClub) {
                                    const slots = getSlotsForClub(selectedClub, dayIndex);
                                    if (slots.length === 0) return null; // Don't render invalid days
                                }

                                return (
                                    <button
                                        key={val}
                                        onClick={() => {
                                            setSelectedDate(val);
                                            setSelectedTime('');
                                        }}
                                        className="btn"
                                        style={{
                                            minWidth: '70px',
                                            flexDirection: 'column',
                                            padding: '8px',
                                            background: isSelected ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.05)',
                                            border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                            color: isSelected ? 'black' : 'white',
                                            gap: '2px'
                                        }}
                                    >
                                        <div style={{ fontSize: '0.7rem', opacity: 0.8, textTransform: 'uppercase' }}>{dayName}</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{dayNum}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Select Time Slot</label>
                        {availableTimeSlots.length === 0 && selectedDate && (
                            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.9rem', color: 'hsl(var(--destructive))' }}>
                                No slots available on this day for the selected club.
                            </div>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                            {availableTimeSlots.map(slot => {
                                const bookedCount = availability[slot] || 0;
                                const isFull = bookedCount >= 6; // Max 6 courts

                                return (
                                    <button
                                        key={slot}
                                        className={`btn ${selectedTime === slot ? 'btn-primary' : 'btn-outline'}`}
                                        style={{
                                            opacity: isFull ? 0.5 : 1,
                                            cursor: isFull ? 'not-allowed' : 'pointer',
                                            position: 'relative'
                                        }}
                                        disabled={isFull}
                                        onClick={() => !isFull && setSelectedTime(slot)}
                                    >
                                        {slot}
                                        {isFull && <div style={{ fontSize: '0.6rem', color: 'hsl(var(--destructive))', fontWeight: 'bold' }}>FULL</div>}
                                        {!isFull && bookedCount > 0 && <div style={{ fontSize: '0.6rem', opacity: 0.7 }}>{6 - bookedCount} left</div>}
                                    </button>
                                );
                            })}
                        </div>
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