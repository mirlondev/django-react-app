// LandingPage.tsx
import React from "react";
import {
  Shield, Users, Wrench, Laptop, Clock, Headphones,
  CheckCircle2, Zap, ArrowRight, Sparkles, BarChart3,
  Award, TrendingUp
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { Link } from "react-router-dom";

const LandingPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
      {/* Glass-morphism header */}
      <header className="relative z-20 px-8 py-5 border-b border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 bg-gradient-to-br w-full from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <h1 className="text-2xl">Regal</h1>
            </div>
            <div>
              <h1 className="text-base font-bold">Regal IT SupportDesk</h1>
            </div>
          </div>

          {/* Login + Theme boutons groupés à droite */}
          <div className="flex items-center gap-4">
          <button
              onClick={toggleTheme}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <Link to={`/login`} className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5" >
     
                  
                  Sign In

              </Link>

            
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative px-8 py-10 lg:py-10 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 leading-tight">
              <span className="block mb-2">Handle every IT request</span>
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                in one place
              </span>
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-300 mb-10 leading-relaxed mx-auto">
              Submit tickets, track progress and get help from our experts—fast.
              <span className="font-semibold text-gray-900 dark:text-white"> Simple, secure, built for Regal employees.</span>
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to={'/login'}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl font-bold shadow-2xl shadow-blue-500/30 dark:shadow-blue-500/20 hover:shadow-blue-500/50 dark:hover:shadow-blue-500/30 transform hover:-translate-y-1 transition-all overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  Get started now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative px-8 pb-5 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto ">
          <div className="relative overflow-hidden p-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-[2rem] shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl m-10 p-10" />

                       <div className="absolute  inset-0 bg-[url('data:image/png;base64,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')] opacity-45" />

            <div className="relative z-10 text-center">
              <h2 className="text-3xl lg:text-4xl font-black mb-5 text-white leading-tight">
                Ready to transform your IT experience?
              </h2>
              <p className="text-lg text-blue-50 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join hundreds of Regal employees already handling tickets the smart way.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/login"
                  className="group relative px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold shadow-2xl hover:shadow-white/30 transform hover:-translate-y-1 transition-all overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    Open the portal
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </span>
                </Link>
                <Link
                  to={"/login"}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-bold border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all transform hover:-translate-y-1"
                >
                  Learn more
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative px-8 py-20 lg:py-24 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-black mb-5">
              Everything you need
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              One powerful platform to cover every IT need—tickets, assets, reporting and more.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FeatureCard
              icon={<Laptop className="w-7 h-7 text-white" />}
              gradient="from-blue-500 to-indigo-600"
              title="Report issues"
              text="Hardware faults, software bugs, network glitches—submit a ticket in seconds."
            />
            <FeatureCard
              icon={<Wrench className="w-7 h-7 text-white" />}
              gradient="from-indigo-500 to-purple-600"
              title="Asset requests"
              text="Need new gear or a replacement? Ask directly through the portal."
            />
            <FeatureCard
              icon={<Headphones className="w-7 h-7 text-white" />}
              gradient="from-pink-500 to-rose-600"
              title="Expert help"
              text="Certified technicians dedicated to solving your problems fast."
            />
            <FeatureCard
              icon={<CheckCircle2 className="w-7 h-7 text-white" />}
              gradient="from-green-500 to-emerald-600"
              title="Rapid fixes"
              text="We prioritise solutions that keep your productivity untouched."
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-8 py-10 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm">
                <div className="font-bold">Regal Group IT Support</div>
                <div className="text-gray-600 dark:text-gray-400">© 2025 – Regal Group employees only</div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-gray-600 dark:text-gray-400">Fully encrypted</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="text-gray-600 dark:text-gray-400"> compliant</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* ---------- sub-components ---------- */
type StatProps = { icon: React.ReactNode; gradient: string; value: string; label: string };
const StatCard: React.FC<StatProps> = ({ icon, gradient, value, label }) => (
  <div className="group relative p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 hover:border-yellow-500 dark:hover:border-yellow-500 transition-all hover:shadow-2xl hover:shadow-yellow-500/10 transform hover:-translate-y-2">
    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl group-hover:bg-yellow-500/20 transition-all" />
    <div className="relative">
      <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${gradient} rounded-2xl mb-4 shadow-lg shadow-yellow-500/30`}>
        {icon}
      </div>
      <div className="text-3xl font-black mb-2 bg-gradient-to-br from-yellow-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400 bg-clip-text text-transparent">{value}</div>
      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  </div>
);

type FeatProps = { icon: React.ReactNode; gradient: string; title: string; text: string };
const FeatureCard: React.FC<FeatProps> = ({ icon, gradient, title, text }) => (
  <div className="group relative p-6 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-950/20 rounded-3xl border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 transition-all transform hover:-translate-y-2">
    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all" />
    <div className="relative">
      <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl mb-4 shadow-xl shadow-blue-500/30 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{text}</p>
    </div>
  </div>
);

export default LandingPage;