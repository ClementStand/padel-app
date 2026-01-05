import BottomNav from "@/components/BottomNav";
import AuthGuard from "@/components/AuthGuard";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            <div style={{ paddingBottom: '80px' }}>
                {children}
            </div>
            <BottomNav />
        </AuthGuard>
    );
}
