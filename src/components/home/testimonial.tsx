"use client";
import { Quote } from "lucide-react";
import {
    Carousel,
    CarouselApi,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "~/components/ui/carousel";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";

// Extended testimonials array with Twitter metadata
const testimonials = [
    {
        name: "Alex Chen",
        handle: "@alexcodes",
        text: "CodePrep's company-specific questions helped me nail my Google interview. The curated problem sets were spot-on!",
        rating: 5,
        profileImage: "https://avatars.githubusercontent.com/u/1234567?v=4",
        tweetUrl: "https://twitter.com/alexcodes/status/1234567890"
    },
    {
        name: "Sarah Miller",
        handle: "@sarahdev",
        text: "The 90-day preparation timeline was exactly what I needed. It helped me structure my practice and focus on the right topics.",
        rating: 5,
        profileImage: "https://avatars.githubusercontent.com/u/2345678?v=4",
        tweetUrl: "https://twitter.com/sarahdev/status/2345678901"
    },
    {
        name: "Raj Patel",
        handle: "@rajcodes",
        text: "Having all DSA sheets in one place saved me countless hours. The progress tracking feature is incredibly useful.",
        rating: 5,
        profileImage: "https://avatars.githubusercontent.com/u/3456789?v=4",
        tweetUrl: "https://twitter.com/rajcodes/status/3456789012"
    },
    {
        name: "Emily Wang",
        handle: "@emilytech",
        text: "The company-specific guides are gold! They helped me understand exactly what Microsoft looks for in candidates.",
        rating: 5,
        profileImage: "https://avatars.githubusercontent.com/u/4567890?v=4",
        tweetUrl: "https://twitter.com/emilytech/status/4567890123"
    },
    {
        name: "James Wilson",
        handle: "@jameswdev",
        text: "From zero to Netflix in 90 days! The structured approach and quality of practice questions made all the difference.",
        rating: 5,
        profileImage: "https://avatars.githubusercontent.com/u/5678901?v=4",
        tweetUrl: "https://twitter.com/jameswdev/status/5678901234"
    }
];

export const TestimonialsSection = () => {
    const [autoPlay, setAutoPlay] = useState(true);
    const [api, setApi] = useState<CarouselApi>();

    useEffect(() => {
        if (!api) return;

        const interval = setInterval(() => {
            if (autoPlay) {
                if (!api.canScrollNext()) {
                    api.scrollTo(0);
                }
                api.scrollNext();
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [api, autoPlay]);

    return (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-main border-y-2 border-border" id="testimonials">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl font-bold text-center mb-12 text-secondary-foreground border-2 border-border bg-secondary-background p-4 inline-block -rotate-1 shadow-shadow">
                    <span className="flex items-center gap-2">
                        <Quote className="w-8 h-8" />
                        Success Stories
                    </span>
                </h2>
                <Carousel
                    setApi={setApi}
                    className="w-full max-w-5xl mx-auto h-fit"
                    onMouseEnter={() => setAutoPlay(false)}
                    onMouseLeave={() => setAutoPlay(true)}
                >
                    <CarouselContent className="py-6 px-2">
                        {testimonials.map((testimonial, index) => (
                            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                                <div className="p-6 bg-secondary-background border-2 border-border rotate-0 hover:rotate-1 transition-all duration-200 shadow-none hover:shadow-shadow">
                                    <p className="text-secondary-foreground mb-4">{testimonial.text}</p>
                                    <div className="border-t-2 border-border pt-4">
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={testimonial.profileImage}
                                                alt={testimonial.name}
                                                className="w-8 h-8 rounded-full border-2 border-black"
                                            />
                                            <div className="flex-1">
                                                <a
                                                    href={testimonial.tweetUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-foreground hover:underline hover:underline-offset-2 flex items-center gap-1 mt-1"
                                                >
                                                    {testimonial.handle}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="border-2 border-border hidden sm:inline-flex" />
                    <CarouselNext className="border-2 border-border hidden sm:flex" />
                </Carousel>
                <div className="flex justify-center mt-8">
                    <a href="https://x.com/zaCKoZAck0/status/1913558597688009006" target="_blank">
                        <Button className="cursor-pointer" variant="neutral">Add Your Own</Button>
                    </a>
                </div>
            </div>
        </section>
    );
};