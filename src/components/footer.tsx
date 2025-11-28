"use client";

import Image from "next/image";
import Link from "next/link";
import { LOGO_DEV_TOKEN } from "~/config/constants";
import { onClickAdUrl } from "~/lib/utils";

export const Footer = () => {
    return (
        <footer className="p-2 bg-background">
            <div className="bg-main shadow-shadow border-2 border-border text-base text-main-foreground">
                <div className="container mx-auto py-12 px-3 sm:px-5 lg:px-7">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-7">
                        <div className="col-span-1 md:col-span-2">
                            <Link href="/" className="mb-2">
                                <Image
                                    src="/images/logo.svg"
                                    alt="LC Grind Logo"
                                    width={100}
                                    height={100}
                                />
                            </Link>
                            <h2 className="text-2xl font-bold text-main-foreground mb-1">
                                LC Grind
                            </h2>
                            <p className="text-main-foreground max-w-md">
                                Focused Interview Preparation.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold tracking-wide uppercase mb-4">Resources</h3>
                            <ul className="space-y-3">
                                <li><Link onClick={onClickAdUrl} className="hover:underline hover:underline-offset-2" href="/all-problems">Problems</Link></li>
                                <li><Link onClick={onClickAdUrl} className="hover:underline hover:underline-offset-2" href="/companies">Companies</Link></li>
                                <li><Link onClick={onClickAdUrl} className="hover:underline hover:underline-offset-2" href="/sheets">DSA Sheets</Link></li>
                                <li><Link onClick={onClickAdUrl} className="hover:underline hover:underline-offset-2" href="/all-problems?order=all-problems&sort=question-id&companies=Meta&companies=Apple&companies=Amazon&companies=Netflix&companies=Google&companies=Microsoft">MAANG Interview Problems</Link></li>
                            </ul>
                        </div>

                        <div className="flex-shrink-0">
                            <a className="flex items-center gap-1 text-lg border-2 border-border shadow-shadow px-1 rounded-md bg-secondary-background text-foreground" href="https://logo.dev"><Image src={`https://img.logo.dev/logo.dev?token=${LOGO_DEV_TOKEN}`} className="rounded-md" alt="Logo" width={30} height={30} /> Logos provided by Logo.dev</a>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t-2 border-border">
                        <p className="text-center">
                            © {new Date().getFullYear()} LC Grind. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};
