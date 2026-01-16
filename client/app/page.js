import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";
import Plans from "./components/Plans";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function HomePage() {
  return (
    <main className="bg-black">
      <Navbar />

      {/* Hero section serves as 'Home' */}
      <section id="home">
        <Hero />
      </section>

      <section id="how-it-works">
        <HowItWorks />
      </section>

      <section id="features">
        <Features />
      </section>

      <section id="plans">
        <Plans />
      </section>

      {/* Added a placeholder for Tips to prevent console errors 
          and allow the navbar to highlight the last link */}
      <section id="tips" className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white mb-8">Safety Tips</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 italic text-gray-400">
              "Never share your seed phrase or OTP with anyone, even if they claim to be support."
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 italic text-gray-400">
              "Check the 'Threat Intelligence' dashboard daily for localized scam patterns."
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 italic text-gray-400">
              "Always verify the sender's email address by hovering over the name."
            </div>
          </div>
        </div>
      </section>

      <CTA />
      <Footer />
    </main>
  );
}