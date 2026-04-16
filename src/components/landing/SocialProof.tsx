const stats = [
  { value: "10K+", label: "Videos Created" },
  { value: "5K+", label: "Happy Creators" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "50+", label: "Countries" },
];

const testimonials = [
  {
    quote: "ClipFrom turned my blog posts into viral TikToks. I gained 10K followers in a month!",
    name: "Sarah K.",
    role: "Content Creator",
  },
  {
    quote: "The AI captions are incredibly accurate. It saves me hours of editing every week.",
    name: "James L.",
    role: "Marketing Manager",
  },
  {
    quote: "Finally, a tool that makes repurposing content effortless. Absolute game changer.",
    name: "Mia R.",
    role: "Entrepreneur",
  },
];

export default function SocialProof() {
  return (
    <section className="relative px-4 py-20">
      <div className="max-w-6xl mx-auto">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 text-center"
            >
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Loved by creators everywhere
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 transition-all duration-300 hover:border-emerald-500/40"
            >
              {/* Quote icon */}
              <svg
                className="w-8 h-8 text-emerald-500/30 mb-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11h4v10H0z" />
              </svg>
              <p className="text-gray-300 text-sm leading-relaxed mb-5">
                "{t.quote}"
              </p>
              <div>
                <div className="text-white font-semibold text-sm">{t.name}</div>
                <div className="text-gray-500 text-xs">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
