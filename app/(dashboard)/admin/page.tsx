'use client';

import Link from 'next/link';
import {
    Trophy,
    Bell,
    ArrowRight,
    CalendarPlus,
    Search,
    BarChart3,
    CheckCircle,
    Home,
    Calendar,
    Users,
    User,
    Activity
} from 'lucide-react';

// ... (imports)
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/store';
import { useEffect, useState } from 'react';

export default function AdminPage() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkAdmin() {
            const user = await getCurrentUser();
            // Simple check: In real app, check user.isAdmin from DB
            // For now, allow all (debug) OR restrict. 
            // User asked to restrict to "just me". I'll use the DB flag 'is_admin'.
            if (!user || !user.isAdmin) {
                router.push('/'); // Kick out
                return;
            }
            setIsAdmin(true);
            setLoading(false);
        }
        checkAdmin();
    }, [router]);

    if (loading) return <div className="p-10 text-center">Checking permissions...</div>;
    if (!isAdmin) return null;

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f7f8] dark:bg-[#101822] text-[#111418] dark:text-white font-sans">
            <h1 className="text-2xl font-bold p-5">Admin Dashboard</h1>
            <p className="px-5">Authorized access only.</p>
            {/* Removed Duplicate Content & Nav */}
        </div>
    );
}