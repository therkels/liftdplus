"use client";

export function Testimonials() {
  // TODO: Replace with real testimonials from users
  // Structure is ready, just needs real quotes + names + locations
  const testimonials = [
    {
      quote: "[Testimonial coming soon - replace with real user quote]",
      author: "[User Name]",
      location: "[Location, State]",
    },
  ];

  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="border-t border-[#e7e7e4] mb-20"></div>

        <div className="text-center mb-16">
          <p className="text-[#4f5a58] text-sm mb-4">
            From people exploring cannabis for the first time
          </p>
        </div>

        <div className="space-y-12">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="pl-8 border-l-4 border-[#6b938c] border-opacity-40 py-4"
            >
              <p className="text-lg text-[#313a43] font-light leading-relaxed mb-4">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <p className="text-sm font-medium text-[#4f5a58]">
                — {testimonial.author}, {testimonial.location}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
