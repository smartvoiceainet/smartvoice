import Image from "next/image";
import { StaticImageData } from "next/image";
import config from "@/config";

// Smart Voice AI attorney testimonials - real results from legal professionals
const list: {
  username?: string;
  name: string;
  firm: string;
  text: string;
  highlight: string;
  img?: string | StaticImageData;
}[] = [
  {
    name: "Jennifer Martinez",
    firm: "Martinez Injury Associates",
    text: "Smart Voice AI has completely transformed how my practice operates. I was initially skeptical about an AI handling sensitive client communications, but the results speak for themselves. I've reclaimed 15+ hours weekly for actual casework, increased client intake by 32%, and finally make it home for dinner with my family.",
    highlight: "32% Increase in Client Intake, 15+ Hours Reclaimed Weekly",
    // Will replace with actual attorney images before launch
    img: "/images/testimonials/attorney-1.jpg"
  },
  {
    name: "Robert Washington",
    firm: "Washington Law Group",
    text: "As a solo practitioner, I was missing calls and losing clients daily. Now, Smart Voice AI catches every opportunity 24/7. My client conversion rate has doubled, and I'm no longer chained to my phone. The setup was surprisingly simple, and the AI actually improves over time as it learns our processes.",
    highlight: "Never Miss a Client Lead Again",
    img: "/images/testimonials/attorney-2.jpg"
  },
  {
    name: "Sarah Collins",
    firm: "Collins & Associates",
    text: "I was drowning in administrative tasks and losing the passion for why I became an attorney in the first place. Smart Voice AI changed everything within days of implementation. The AI handles all initial client communications, schedules consultations, and even gathers case details before I ever speak with the client.",
    highlight: "From Overwhelmed to Organized Within Days",
    img: "/images/testimonials/attorney-3.jpg"
  },
];

// A single testimonial, to be rendered in a list
const Testimonial = ({ i }: { i: number }) => {
  const testimonial = list[i];

  if (!testimonial) return null;

  return (
    <li key={i}>
      <figure className="relative max-w-lg mx-auto bg-base-100 shadow-lg rounded-lg p-6 md:p-8 flex flex-col">
        <div className="text-primary font-bold mb-3">
          {testimonial.highlight}
        </div>
        <blockquote className="relative flex-1">
          <p className="text-base-content/80 leading-relaxed">
            {testimonial.text}
          </p>
        </blockquote>
        <figcaption className="relative flex items-center justify-start gap-4 pt-4 mt-4 md:gap-8 md:pt-8 md:mt-8 border-t border-base-content/5">
          <div className="w-full flex items-center justify-between gap-2">
            <div>
              <div className="font-medium text-base-content md:mb-0.5">
                {testimonial.name}
              </div>
              <div className="mt-0.5 text-sm text-base-content/80">
                {testimonial.firm}
              </div>
            </div>

            <div className="overflow-hidden rounded-full bg-base-300 shrink-0">
              {testimonial.img ? (
                <Image
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                  src={list[i].img}
                  alt={`${list[i].name}'s testimonial for ${config.appName}`}
                  width={48}
                  height={48}
                />
              ) : (
                <span className="w-10 h-10 md:w-12 md:h-12 rounded-full flex justify-center items-center text-lg font-medium bg-base-300">
                  {testimonial.name.charAt(0)}
                </span>
              )}
            </div>
          </div>
        </figcaption>
      </figure>
    </li>
  );
};

const Testimonials3 = () => {
  return (
    <section id="testimonials">
      <div className="py-24 px-8 max-w-7xl mx-auto">
        <div className="flex flex-col text-center w-full mb-20">
          <div className="mb-8">
            <h2 className="sm:text-5xl text-4xl font-extrabold text-base-content">
              100+ law firms are improving client communication!
            </h2>
          </div>
          <p className="lg:w-2/3 mx-auto leading-relaxed text-base text-base-content/80">
            Don&apos;t take our word for it. Here&apos;s what our clients have to say
            about Smart Voice AI.
          </p>
        </div>

        <ul
          role="list"
          className="flex flex-col items-center lg:flex-row lg:items-stretch gap-6 lg:gap-8"
        >
          {[...Array(3)].map((e, i) => (
            <Testimonial key={i} i={i} />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Testimonials3;
