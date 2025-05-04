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
import { useState } from "react";
import { Button } from "../ui/button";
import { ClientTweetCard } from "./tweet-client";
import { TESTIMONIALS } from "~/lib/testimonials";

export const TestimonialsSection = () => {
    const [autoPlay, setAutoPlay] = useState(true);
    const [api, setApi] = useState<CarouselApi>();

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
                    opts={{
                      align: "center",
                      loop: true,
                      autoplay: autoPlay,
                      autoplayInterval: 5000,
                    }}
                    onMouseEnter={() => setAutoPlay(false)}
                    onMouseLeave={() => setAutoPlay(true)}
                >
                    <CarouselContent className="py-6 px-2">
                        {TESTIMONIALS.map((testimonial, index) => (
                            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                                <ClientTweetCard id={testimonial} />
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
