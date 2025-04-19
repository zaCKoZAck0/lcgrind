import { Target, Filter, Database, Book, List, Gift, Building, Timer } from "lucide-react";

const features = [
    {
        title: "Company-wise Questions",
        description: "Practice with real interview questions, tailored to your target employers.",
        icon: <Building className="w-6 h-6 text-secondary-foreground" />,
    },
    {
        title: "Timeline-based Prep",
        description: "30, 60, 90 days and All Time problems for top companies to structure your preparation.",
        icon: <Timer className="w-6 h-6 text-secondary-foreground" />,
    },
    {
        title: "Focus on Weaknesses",
        description: "Strengthen your weak areas before interviews with targeted practice.",
        icon: <Target className="w-6 h-6 text-secondary-foreground" />,
    },
    {
        title: "Local Progress Tracking",
        description: "Track your progress right in your browser—no login required, completely private.",
        icon: <Database className="w-6 h-6 text-secondary-foreground" />,
    },
    {
        title: "Advanced Filtering",
        description: "Powerful filter, sort, and search capabilities to find exactly what you need.",
        icon: <Filter className="w-6 h-6 text-secondary-foreground" />,
    },
    {
        title: "Company Guides",
        description: "Get focused preparation guides tailored to specific companies' interview patterns.",
        icon: <Book className="w-6 h-6 text-secondary-foreground" />,
    },
    {
        title: "Top DSA Sheets",
        description: "Access curated collections like Grind 75, Neetcode 150, and Striver SDE Sheet.",
        icon: <List className="w-6 h-6 text-secondary-foreground" />,
    },
    {
        title: "Free Forever",
        description: "All features completely free, no hidden costs or premium tiers.",
        icon: <Gift className="w-6 h-6 text-secondary-foreground" />,
    },
];

export function Features() {
    return <section className="py-16 px-4 sm:px-6 lg:px-8 bg-main border-y-2 border-border" id="features">
        <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl bg-secondary-background text-secondary-foreground font-bold text-center mb-12 border-2 border-border p-4 inline-block -rotate-1 shadow-shadow">
                {"We've got you covered :)"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                    <FeatureCard key={index} {...feature} />
                ))}
            </div>
        </div>
    </section>
}


interface FeatureCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
}

const FeatureCard = ({ title, description, icon }: FeatureCardProps) => {
    return (
        <div className="p-6 bg-secondary-background border-2 border-border rotate-1 transition-all duration-200 shadow-shadow hover:shadow-none hover:rotate-0">
            <div className="w-12 h-12 bg-main border-2 border-border rounded-none flex items-center justify-center mb-4">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-secondary-foreground mb-2">{title}</h3>
            <p className="text-secondary-foreground">{description}</p>
        </div>
    );
};