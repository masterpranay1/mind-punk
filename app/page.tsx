import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="min-h-screen bg-yellow-50 text-black font-sans selection:bg-purple-500 selection:text-white">
      {/* Navbar */}
      <nav className="w-full border-b-4 border-black bg-white p-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-black font-display tracking-tighter uppercase italic">
            MIND_PUNK
          </div>
          <div className="hidden md:flex gap-6 font-bold text-lg">
            <Link
              href="#"
              className="hover:underline decoration-4 underline-offset-4 decoration-pink-500"
            >
              Quizzes
            </Link>
            <Link
              href="#"
              className="hover:underline decoration-4 underline-offset-4 decoration-cyan-500"
            >
              Leaderboard
            </Link>
            <Link
              href="/create-quiz"
              className="hover:underline decoration-4 underline-offset-4 decoration-yellow-500"
            >
              Create
            </Link>
          </div>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-black text-white px-6 py-2 font-bold text-lg hover:bg-purple-600 transition-colors border-2 border-transparent hover:border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:translate-x-1 active:translate-y-1 cursor-pointer">
                LOGIN
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </nav>

      <main className="flex flex-col items-center w-full">
        {/* Hero Section */}
        <section className="w-full max-w-6xl px-4 py-20 md:py-32 flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 space-y-8 text-center md:text-left">
            <h1 className="text-6xl md:text-8xl font-black leading-[0.9] font-display">
              QUIZZES FOR THE{" "}
              <span className="bg-pink-500 text-white px-2">BRAVE</span>.
            </h1>
            <p className="text-xl md:text-2xl font-bold border-l-4 border-black pl-6 py-2 bg-white/50">
              Create impossible quizzes. Challenge your friends. Watch them cry.
            </p>
            <div className="flex flex-col md:flex-row gap-4 pt-4 justify-center md:justify-start">
              <button className="px-8 py-4 bg-cyan-400 border-4 border-black font-black text-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer">
                START PLAYING
              </button>
              <SignedOut>
                <SignUpButton mode="modal" forceRedirectUrl="/create-quiz">
                  <button className="px-8 py-4 bg-white border-4 border-black font-black text-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer">
                    CREATE QUIZ
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/create-quiz">
                  <button className="px-8 py-4 bg-white border-4 border-black font-black text-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer">
                    CREATE QUIZ
                  </button>
                </Link>
              </SignedIn>
            </div>
          </div>

          <div className="flex-1 relative w-full aspect-square max-w-md">
            <div className="absolute inset-0 bg-purple-500 border-4 border-black transform translate-x-4 translate-y-4"></div>
            <div className="absolute inset-0 bg-yellow-400 border-4 border-black flex items-center justify-center">
              <div className="text-9xl font-black opacity-20 rotate-12">?!</div>
            </div>
          </div>
        </section>

        {/* Features Marquee */}
        <div className="w-full bg-black text-white py-4 overflow-hidden border-y-4 border-white rotate-1">
          <div className="animate-marquee whitespace-nowrap font-black text-3xl md:text-5xl uppercase font-display">
            <span>
              • NO MERCY • HIGH STAKES • GLORY AWAITS • NO MERCY • HIGH STAKES •
              GLORY AWAITS • NO MERCY • HIGH STAKES • GLORY AWAITS
            </span>
          </div>
        </div>

        {/* Features Grid */}
        <section className="w-full max-w-6xl px-4 py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1.5 hover:translate-y-1.5 transition-all">
              <div className="w-16 h-16 bg-pink-500 border-4 border-black mb-6 flex items-center justify-center text-3xl font-bold text-white">
                1
              </div>
              <h3 className="text-3xl font-black mb-4 font-display">
                THE CREATOR
              </h3>
              <p className="text-lg font-medium leading-relaxed">
                Build quizzes that defy logic. Use images, bizarre text, and
                confusing timers to stump the best.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-yellow-300 border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1.5 hover:translate-y-1.5 transition-all transform md:-translate-y-8">
              <div className="w-16 h-16 bg-white border-4 border-black mb-6 flex items-center justify-center text-3xl font-bold">
                2
              </div>
              <h3 className="text-3xl font-black mb-4 font-display">
                THE ARENA
              </h3>
              <p className="text-lg font-medium leading-relaxed">
                Share your quiz link. Watch live stats. Laugh as your friends
                fail repeatedly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-cyan-300 border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1.5 hover:translate-y-1.5 transition-all">
              <div className="w-16 h-16 bg-black border-4 border-white mb-6 flex items-center justify-center text-3xl font-bold text-white">
                3
              </div>
              <h3 className="text-3xl font-black mb-4 font-display">
                THE GLORY
              </h3>
              <p className="text-lg font-medium leading-relaxed">
                Rise to the top of the global leaderboard. Earn badges. Become a
                legend of nonsense.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full px-4 py-20 bg-purple-600 border-t-4 border-black text-center text-white">
          <h2 className="text-5xl md:text-7xl font-black mb-8 font-display">
            READY TO LOSE?
          </h2>
          <button className="px-12 py-6 bg-yellow-400 text-black border-4 border-black font-black text-2xl shadow-[10px_10px_0px_0px_rgba(255,255,255,1)] hover:shadow-[5px_5px_0px_0px_rgba(255,255,255,1)] hover:translate-x-1 hover:translate-y-1 transition-all">
            ENTER THE CHAOS
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t-4 border-black p-8 text-center font-bold">
        <p>© 2024 MIND_PUNK. NO RIGHTS RESERVED. COPY LEFT.</p>
      </footer>
    </div>
  );
}
