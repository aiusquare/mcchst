import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../pictures/logo.png";
import adminImg from "../../pictures/admin_img.png";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const programs = [
  {
    title: "Community Health",
    duration: "3 Years",
    desc: "Train to become community health extension workers who provide primary healthcare services.",
    icon: "🏥",
  },
  {
    title: "Health Information Management",
    duration: "3 Years",
    desc: "Learn health records management, statistics, and information systems in healthcare.",
    icon: "📊",
  },
  {
    title: "Environmental Health",
    duration: "3 Years",
    desc: "Study environmental factors affecting health and develop solutions for healthier communities.",
    icon: "🌍",
  },
  {
    title: "Pharmacy Technology",
    duration: "3 Years",
    desc: "Master pharmaceutical sciences and medication dispensing under supervision.",
    icon: "💊",
  },
  {
    title: "Medical Laboratory",
    duration: "3 Years",
    desc: "Develop expertise in laboratory diagnostics and medical testing procedures.",
    icon: "🔬",
  },
  {
    title: "Dental Therapy",
    duration: "3 Years",
    desc: "Develop practical skills for oral health services and care.",
    icon: "🦷",
  },
];

const coreValues = [
  { icon: "🎓", title: "Moral discipline and academic excellence" },
  { icon: "⭐", title: "Competence and quality" },
  { icon: "🤝", title: "Integrity and honesty" },
  { icon: "💙", title: "Loyalty and sincerity" },
  { icon: "📋", title: "Accountability and transparency" },
  { icon: "💡", title: "Initiative and creativity" },
];

const applicationSteps = [
  {
    step: "1",
    title: "Create Account",
    desc: "Register on our online portal",
    icon: "👤",
  },
  {
    step: "2",
    title: "Fill Application",
    desc: "Complete the application form",
    icon: "📝",
  },
  {
    step: "3",
    title: "Upload Documents",
    desc: "Submit required documents",
    icon: "📤",
  },
  {
    step: "4",
    title: "Pay Fees",
    desc: "Complete application fee payment",
    icon: "💳",
  },
  {
    step: "5",
    title: "Track Status",
    desc: "Monitor your admission status",
    icon: "📊",
  },
];

const announcements = [
  {
    title: "Registration Deadline Extended",
    desc: "Course registration deadline extended to February 28, 2025.",
  },
  {
    title: "Library Hours Update",
    desc: "The library will now be open from 8AM to 8PM on weekdays.",
  },
  {
    title: "Exam Timetable Released",
    desc: "First semester examination timetable is now available on the portal.",
  },
];

const newsEvents = [
  {
    category: "Admissions",
    date: "January 15, 2025",
    title: "2024/2025 Admission Exercise Now Open",
    excerpt:
      "Applications are now being accepted for the upcoming academic session. Prospective students are encouraged to apply early.",
    featured: true,
  },
  {
    category: "Achievement",
    date: "January 10, 2025",
    title: "Annual Inter-College Health Quiz Competition",
    excerpt:
      "Our students emerged winners at the zonal health quiz competition held in Katsina State.",
  },
  {
    category: "Campus",
    date: "January 5, 2025",
    title: "New Laboratory Equipment Commissioned",
    excerpt:
      "State-of-the-art laboratory equipment has been installed to enhance practical training for students.",
  },
  {
    category: "Staff",
    date: "December 28, 2024",
    title: "Staff Development Workshop Concluded",
    excerpt:
      "A week-long capacity building workshop for academic staff was successfully conducted.",
  },
];

export default function HomeModern() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNav = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const handleExternal = (url) => {
    setMenuOpen(false);
    window.location.href = url;
  };

  return (
    <div className="bg-white text-gray-900">
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-brand-700 text-emerald-100 text-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-2">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-2">
              📞 +234 800 000 0000
            </span>
            <span className="flex items-center gap-2">
              ✉️ info@mcchstfuntua.edu.ng
            </span>
          </div>
          <div className="italic">"My College My Pride"</div>
        </div>
      </div>

      <nav className="border-b border-amber-100 bg-white shadow-sm">
        <div className="mx-auto grid max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-6 px-6 py-4 md:grid-cols-[auto_1fr_auto]">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-800 shadow-soft">
              <img
                src={logo}
                alt="MCCHST Funtua"
                className="h-7 w-7 object-contain"
              />
            </div>
            <div>
              <div className="text-lg font-extrabold text-brand-800">
                MCCHST Funtua
              </div>
              <div className="text-xs text-gray-500">
                Health Science & Technology
              </div>
            </div>
          </div>

          <button
            className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 text-brand-800 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span className="flex flex-col gap-1">
              <span className="block h-0.5 w-5 bg-brand-800" />
              <span className="block h-0.5 w-5 bg-brand-800" />
              <span className="block h-0.5 w-5 bg-brand-800" />
            </span>
          </button>

          <div className="hidden items-center justify-center gap-6 text-sm font-semibold md:flex">
            <button
              onClick={() => handleNav("/")}
              className="hover:text-brand-800"
            >
              Home
            </button>
            <button
              onClick={() => handleNav("/about")}
              className="hover:text-brand-800"
            >
              About
            </button>
            <button
              onClick={() => handleExternal("https://mcchst-hostels.web.app/login")}
              className="hover:text-brand-800"
            >
              Hostels
            </button>
            {/* <button
              onClick={() => handleNav("/apply/start")}
              className="hover:text-brand-800"
            >
              Admissions
            </button>
            <button
              onClick={() => handleNav("/academics")}
              className="hover:text-brand-800"
            >
              Academics
            </button> */}
            <button
              onClick={() => handleExternal("https://library.mcchstfuntua.edu.ng/")}
              className="hover:text-brand-800"
            >
              E-Library
            </button>
            <button
              onClick={() => handleNav("/news")}
              className="hover:text-brand-800"
            >
              News
            </button>
            <button
              onClick={() => handleNav("/gallery")}
              className="hover:text-brand-800"
            >
              Gallery
            </button>
            <button
              onClick={() => handleNav("/contact")}
              className="hover:text-brand-800"
            >
              Contact
            </button>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNav("/login")}
            >
              Login
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleNav("/apply")}
            >
              Apply Now
            </Button>
          </div>
        </div>

        {menuOpen ? (
          <div className="border-t border-amber-100 bg-white px-6 py-4 md:hidden">
            <div className="grid gap-3 text-sm font-semibold">
              <button onClick={() => handleNav("/")}>Home</button>
              <button onClick={() => handleNav("/about")}>About</button>
              <button
                onClick={() =>
                  handleExternal("https://mcchst-hostels.web.app/login")
                }
              >
                Hostels
              </button>
              <button onClick={() => handleNav("/apply/start")}>
                Admissions
              </button>
              <button onClick={() => handleNav("/academics")}>Academics</button>
              <button
                onClick={() =>
                  handleExternal("https://library.mcchstfuntua.edu.ng/")
                }
              >
                E-Library
              </button>
              <button onClick={() => handleNav("/news")}>News</button>
              <button onClick={() => handleNav("/gallery")}>Gallery</button>
              <button onClick={() => handleNav("/contact")}>Contact</button>
              <div className="flex flex-col gap-2 pt-2">
                <Button variant="ghost" onClick={() => handleNav("/login")}>
                  Login
                </Button>
                <Button variant="primary" onClick={() => handleNav("/apply")}>
                  Apply Now
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </nav>

      <section
        className="relative bg-cover bg-center"
        style={{ backgroundImage: `url(${adminImg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900/95 via-brand-900/80 to-brand-900/70" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.08)_25%,transparent_25%),linear-gradient(-45deg,rgba(255,255,255,0.08)_25%,transparent_25%),linear-gradient(45deg,transparent_75%,rgba(255,255,255,0.08)_75%),linear-gradient(-45deg,transparent_75%,rgba(255,255,255,0.08)_75%)] bg-[length:60px_60px] opacity-20" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 text-white">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-gold-500/20 px-4 py-1 text-sm font-bold text-gold-300">
              🏅 Discipline and Academic Excellence
            </span>
            <h1 className="mt-6 font-serif text-4xl font-extrabold leading-tight sm:text-5xl">
              Muslim Community College of
              <span className="text-gold-300"> Health Science </span>&
              Technology Funtua
            </h1>
            <p className="mt-4 text-lg text-emerald-50">
              Human Capital Development for Community Service
            </p>
            <p className="mt-1 text-base italic text-gold-300">
              "My College My Pride"
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                variant="accent"
                size="lg"
                onClick={() => handleNav("/apply")}
              >
                Apply for Admission
              </Button>
              <Button
                variant="light"
                size="lg"
                onClick={() => handleNav("/login")}
              >
                Login
              </Button>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Programs", value: "5+", icon: "🎓" },
                { label: "Students", value: "2000+", icon: "👥" },
                { label: "Years", value: "30+", icon: "🏅" },
                { label: "Accredited", value: "100%", icon: "✅" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/20 bg-white/10 px-4 py-5 text-center backdrop-blur"
                >
                  <div className="text-xl text-gold-300">{stat.icon}</div>
                  <div className="mt-2 text-2xl font-extrabold">
                    {stat.value}
                  </div>
                  <div className="text-sm text-emerald-50/90">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold">
              Accredited Health Science Programs
            </h2>
            <p className="mt-2 text-gray-600">
              Our programs are designed to produce competent healthcare
              professionals ready to serve communities across Nigeria and
              beyond.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => (
              <Card key={program.title} className="border-amber-100 shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div className="text-3xl">{program.icon}</div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    {program.duration}
                  </span>
                </CardHeader>
                <CardContent>
                  <CardTitle>{program.title}</CardTitle>
                  <p className="mt-2 text-sm text-gray-600">{program.desc}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-4 border border-amber-100"
                  >
                    Learn More →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Admission Process</h2>
            <p className="mt-2 text-gray-600">
              Simple steps to begin your journey.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            {applicationSteps.map((step) => (
              <Card key={step.step} className="bg-gray-50 text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl">{step.icon}</div>
                  <div className="mt-2 text-xs font-semibold text-brand-700">
                    Step {step.step}
                  </div>
                  <div className="mt-2 font-semibold">{step.title}</div>
                  <p className="mt-1 text-xs text-gray-600">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => handleNav("/apply")}
            >
              Start Your Application
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-[#fbf7f2] py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold">News & Events</h2>
              <p className="mt-2 text-gray-600">
                Latest updates, achievements, and campus activities
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNav("/news")}
            >
              View All →
            </Button>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="grid gap-5">
              {newsEvents
                .filter((item) => item.featured)
                .map((item) => (
                  <Card
                    key={item.title}
                    className="border-emerald-100 bg-emerald-50"
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="rounded-full border border-amber-100 bg-white px-3 py-1 font-semibold">
                          {item.category}
                        </span>
                        <span className="text-gray-500">{item.date}</span>
                      </div>
                      <h3 className="mt-3 text-xl font-bold">{item.title}</h3>
                      <p className="mt-2 text-sm text-gray-600">
                        {item.excerpt}
                      </p>
                      <Button variant="ghost" size="sm" className="mt-4">
                        Read More →
                      </Button>
                    </CardContent>
                  </Card>
                ))}

              <div className="grid gap-4 md:grid-cols-2">
                {newsEvents
                  .filter((item) => !item.featured)
                  .map((item) => (
                    <Card key={item.title}>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3 text-xs">
                          <span className="rounded-full border border-amber-100 bg-white px-3 py-1 font-semibold">
                            {item.category}
                          </span>
                          <span className="text-gray-500">{item.date}</span>
                        </div>
                        <h4 className="mt-3 text-base font-bold">
                          {item.title}
                        </h4>
                        <p className="mt-2 text-xs text-gray-600">
                          {item.excerpt}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>

            <aside className="grid gap-4">
              <h3 className="text-xl font-bold">Announcements</h3>
              {announcements.map((item) => (
                <Card
                  key={item.title}
                  className="border-l-4 border-l-amber-500"
                >
                  <CardContent className="pt-5">
                    <div className="flex items-start gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-md bg-amber-50 text-amber-600">
                        🔔
                      </div>
                      <div>
                        <div className="font-semibold">{item.title}</div>
                        <p className="mt-1 text-sm text-gray-600">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <div className="rounded-xl bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 p-6 text-white shadow-soft">
                <h4 className="text-xl font-bold">Start Your Journey</h4>
                <p className="mt-2 text-sm text-emerald-50">
                  Applications for 2024/2025 session are now open
                </p>
                <Button
                  variant="accent"
                  className="mt-4 w-full"
                  onClick={() => handleNav("/apply")}
                >
                  Apply Now →
                </Button>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-3xl font-bold">Our Core Values</h2>
          <p className="mt-2 text-gray-600">
            The principles that guide our institution
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {coreValues.map((value) => (
              <Card key={value.title} className="bg-gray-50 text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl">{value.icon}</div>
                  <p className="mt-2 text-sm font-semibold text-gray-800">
                    {value.title}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-900 py-16 text-white">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-3xl font-bold">Ready to Begin Your Journey?</h2>
          <p className="mt-2 text-emerald-50">
            Join thousands of students who have launched successful healthcare
            careers with us.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              variant="light"
              size="lg"
              onClick={() => handleNav("/apply")}
            >
              Apply Now
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleNav("/about")}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 py-14 text-gray-200">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-800">
                <img
                  src={logo}
                  alt="MCC Funtua"
                  className="h-7 w-7 object-contain"
                />
              </div>
              <div>
                <div className="text-lg font-bold text-white">
                  MCCHST Funtua
                </div>
                <div className="text-xs text-gray-400">
                  Health Science & Technology
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-400">
              Muslim Community College of Health Science and Technology Funtua -
              Committed to Human Capital Development for Community Service.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-400">
              <li>Funtua, Katsina State, Nigeria</li>
              <li>+234 800 000 0000</li>
              <li>info@mcchstfuntua.edu.ng</li>
              <li>Mon - Fri: 8:00 AM - 4:00 PM</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Quick Links</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-400">
              <li>
                <button
                  onClick={() => handleNav("/about")}
                  className="hover:text-white"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav("/apply")}
                  className="hover:text-white"
                >
                  Admissions
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav("/academics")}
                  className="hover:text-white"
                >
                  Academics
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav("/news")}
                  className="hover:text-white"
                >
                  News & Events
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav("/gallery")}
                  className="hover:text-white"
                >
                  Gallery
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav("/contact")}
                  className="hover:text-white"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Portals</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-400">
              <li>
                <button
                  onClick={() => handleNav("/login")}
                  className="hover:text-white"
                >
                  Student Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav("/login")}
                  className="hover:text-white"
                >
                  Staff Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav("/apply")}
                  className="hover:text-white"
                >
                  Apply Online
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav("/login")}
                  className="hover:text-white"
                >
                  Check Results
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav("/login")}
                  className="hover:text-white"
                >
                  Pay Fees
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav("/e-library")}
                  className="hover:text-white"
                >
                  E-Library
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Our Programs</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-400">
              <li>
                <button
                  onClick={() => handleNav("/programs/community-health")}
                  className="hover:text-white"
                >
                  Community Health
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav("/programs/health-information")}
                  className="hover:text-white"
                >
                  Health Information
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav("/programs/environmental")}
                  className="hover:text-white"
                >
                  Environmental Health
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav("/programs/pharmacy")}
                  className="hover:text-white"
                >
                  Pharmacy Technology
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav("/programs/medical-laboratory")}
                  className="hover:text-white"
                >
                  Medical Laboratory
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-white/10 px-6 pt-6 text-xs text-gray-400">
          <span>
            © {new Date().getFullYear()} MCC Funtua. All rights reserved.
          </span>
          <span>"Discipline and Academic Excellence"</span>
          <div className="flex gap-3">
            <span>📘</span>
            <span>🐦</span>
            <span>📷</span>
            <span>▶️</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
