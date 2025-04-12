export default function AllProblemsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col items-center w-full">
            {children}
        </div>
    );
}