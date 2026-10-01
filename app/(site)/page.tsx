import { Hero } from "@/components/home/Hero";
import { About } from "@/components/home/About";
import { Location } from "@/components/home/Location";
import { Partners } from "@/components/home/Partners";
import { NextSteps } from "@/components/home/NextSteps";

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Location />
      <Partners />
      <NextSteps />
    </>
  );
}
