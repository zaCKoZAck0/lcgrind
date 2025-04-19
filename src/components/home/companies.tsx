import { Building2 } from "lucide-react";

const companies = [
    { name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", link: "/companies/google" },
    { name: "Meta", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg", link: "/companies/meta" },
    { name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", link: "/companies/amazon" },
    { name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg", link: "/companies/microsoft" },
    { name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg", link: "/companies/apple" },
    { name: "Netflix", logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg", link: "/companies/netflix" }
];

export const CompaniesSection = () => {
    return (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary-background" id="companies">
            <div className="max-w-7xl mx-auto">
                <h2 className="sm:text-4xl text-2xl font-bold text-center mb-12 text-main-foreground border-2 border-border bg-main p-4 inline-block rotate-1 shadow-shadow">
                    <span className="flex items-center gap-2">
                        <Building2 className="w-8 h-8 flex-shrink-0" />
                        Prepare for Top Companies
                    </span>
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                    {companies.map((company) => (
                        <a
                            key={company.name}
                            href={company.link}
                            className="p-6 bg-white border-2 border-border hover:rotate-2 transition-all duration-200 shadow-none hover:shadow-shadow"
                        >
                            <img
                                src={company.logo}
                                alt={`${company.name} logo`}
                                className="w-full h-12 object-contain"
                            />
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
};
