'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/store';
import OnboardingModal from './OnboardingModal';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }

            // Check if user needs onboarding (Elo 0)
            const user = await getCurrentUser();
            if (user && user.elo === 0) {
                setShowOnboarding(true);
            }

            setLoading(false);
        };

        checkUser();
    }, [router]);

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
    }

    return (
        <>
            {children}
            <OnboardingModal
                isOpen={showOnboarding}
                onComplete={() => setShowOnboarding(false)}
            />
        </>
    );
}