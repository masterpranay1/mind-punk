"use client";

import {
  useUser,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { useEffect, useState, use } from "react";
import {
  getPublicQuiz,
  submitQuiz,
  getLeaderboard,
  getQuizAttempt,
  SubmitQuizData,
} from "@/app/actions/play";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";

type QuizState = "LOADING" | "ENTRY" | "PLAYING" | "SUBMITTING" | "RESULTS";

export default function PlayQuizPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { user, isLoaded } = useUser();
  const [unwrappedParams, setUnwrappedParams] = useState<{
    quizId: string;
  } | null>(null);

  // Quiz Data
  const [quiz, setQuiz] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // User State
  const [guestName, setGuestName] = useState("");
  const [username, setUsername] = useState("");

  // Game State
  const [state, setState] = useState<QuizState>("LOADING");
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [startTime, setStartTime] = useState<number>(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    params.then(setUnwrappedParams);
  }, [params]);

  useEffect(() => {
    if (!unwrappedParams) return;
    loadQuiz(parseInt(unwrappedParams.quizId));
  }, [unwrappedParams]);

  useEffect(() => {
    if (isLoaded) {
      if (user) {
        setUsername(user.firstName || user.username || "Player");
      } else {
        const storedName = localStorage.getItem("mindpunk_username");
        if (storedName) setGuestName(storedName);
      }
    }
  }, [isLoaded, user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state === "PLAYING") {
      interval = setInterval(() => {
        setScore((prev) => prev); // Force re-render or just use local state for display
        // Actually, let's use a dedicated state for display time to avoid full re-renders if not needed,
        // but here we need to show it.
        // Better approach:
        setTimeTaken(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state, startTime]);

  const loadQuiz = async (id: number) => {
    try {
      const data = await getPublicQuiz(id);
      if (data) {
        setQuiz(data);

        // Check for existing attempt
        const guestId = localStorage.getItem("mindpunk_guest_id") || undefined;
        const attempt = await getQuizAttempt(id, guestId);

        if (attempt) {
          setScore(attempt.score);
          setTimeTaken(attempt.timeTaken);
          setState("RESULTS");
          const lb = await getLeaderboard(id);
          setLeaderboard(lb);
        } else {
          // Fetch leaderboard for entry screen
          const lb = await getLeaderboard(id);
          setLeaderboard(lb);
          setState("ENTRY");
        }
      } else {
        // Handle 404
      }
    } catch (error) {
      console.error("Failed to load quiz", error);
    }
  };

  const startQuiz = () => {
    const finalUsername = user ? user.firstName || "Player" : guestName;
    if (!user) {
      if (!finalUsername.trim()) {
        alert("Enter a name, coward.");
        return;
      }
      localStorage.setItem("mindpunk_username", finalUsername);
      if (!localStorage.getItem("mindpunk_guest_id")) {
        localStorage.setItem("mindpunk_guest_id", uuidv4());
      }
    }
    setUsername(finalUsername);
    setStartTime(Date.now());
    setState("PLAYING");
  };

  const handleOptionSelect = (qId: number, oIdx: number) => {
    setAnswers({ ...answers, [qId]: oIdx });
  };

  const nextQuestion = () => {
    if (currentQuestionIdx < quiz.questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setState("SUBMITTING");
    const endTime = Date.now();
    const totalTime = Math.floor((endTime - startTime) / 1000);
    setTimeTaken(totalTime);

    const guestId = !user
      ? localStorage.getItem("mindpunk_guest_id")
      : undefined;

    try {
      const result = await submitQuiz({
        quizId: quiz.id,
        username,
        guestId: guestId || undefined,
        timeTaken: totalTime,
        answers,
      });

      setScore(result.score);

      // Fetch updated leaderboard
      const lb = await getLeaderboard(quiz.id);
      setLeaderboard(lb);

      setState("RESULTS");
    } catch (error) {
      console.error("Submission failed", error);
      alert("Failed to submit. The server is probably laughing at you.");
      // Don't reset to ENTRY if submission failed but we might want to stay here
      // But for now, let's just leave it or maybe go to results?
      // Actually if it failed, we can't show results.
      setState("ENTRY");
    }
  };

  const refreshLeaderboard = async () => {
    const lb = await getLeaderboard(quiz.id);
    setLeaderboard(lb);
  };

  if (state === "LOADING" || !quiz) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center font-black text-2xl animate-pulse">
        LOADING CHAOS...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50 text-black font-sans selection:bg-purple-500 selection:text-white">
      {/* Navbar */}
      <nav className="w-full border-b-4 border-black bg-white p-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/">
            <div className="text-2xl font-black font-display tracking-tighter uppercase italic cursor-pointer">
              MIND_PUNK
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-black text-white px-4 py-2 font-bold text-sm hover:bg-purple-600 transition-colors border-2 border-transparent hover:border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 cursor-pointer">
                  LOGIN
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </nav>

      <main className="w-full max-w-4xl mx-auto px-4 py-12">
        {state === "ENTRY" && (
          <div className="space-y-12">
            <div className="max-w-lg mx-auto bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
              <h1 className="text-4xl font-black mb-2 uppercase">
                {quiz.title}
              </h1>
              <p className="text-xl font-bold text-gray-600 mb-8 italic">
                {quiz.subtitle}
              </p>

              {!user && (
                <div className="mb-6">
                  <label className="block font-bold mb-2 uppercase">
                    Identify Yourself
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full border-4 border-black p-3 font-bold text-center text-xl focus:outline-none focus:ring-4 ring-purple-400"
                    placeholder="ENTER NAME"
                  />
                </div>
              )}

              <button
                onClick={startQuiz}
                className="w-full py-4 bg-purple-600 text-white font-black text-2xl uppercase border-4 border-black hover:bg-purple-700 hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                Start The Pain
              </button>
            </div>

            <div className="max-w-3xl mx-auto bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black uppercase">Hall of Fame</h3>
                <button
                  onClick={refreshLeaderboard}
                  className="text-sm font-bold underline hover:text-purple-600"
                >
                  REFRESH
                </button>
              </div>

              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left font-bold border-collapse">
                  <thead>
                    <tr className="border-b-4 border-black bg-gray-100 uppercase text-sm sticky top-0">
                      <th className="p-3">Rank</th>
                      <th className="p-3">Player</th>
                      <th className="p-3 text-right">Score</th>
                      <th className="p-3 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center opacity-50">
                          BE THE FIRST TO SUFFER
                        </td>
                      </tr>
                    ) : (
                      leaderboard.map((entry, idx) => (
                        <tr key={idx} className={`border-b-2 border-black/10`}>
                          <td className="p-3">#{idx + 1}</td>
                          <td className="p-3">
                            {entry.username} {entry.userId && "✅"}
                          </td>
                          <td className="p-3 text-right">{entry.score}</td>
                          <td className="p-3 text-right">{entry.timeTaken}s</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {state === "PLAYING" && (
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-xl">
                Q{currentQuestionIdx + 1} / {quiz.questions.length}
              </span>
              <span className="font-mono bg-black text-white px-3 py-1 font-bold">
                TIMER: {timeTaken}s
              </span>
            </div>

            <div className="bg-white border-4 border-black p-8 min-h-[300px] flex flex-col justify-center relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-3xl font-black mb-8 leading-tight">
                {quiz.questions[currentQuestionIdx].question}
              </h2>

              <div className="grid gap-4">
                {quiz.questions[currentQuestionIdx].options.map(
                  (opt: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() =>
                        handleOptionSelect(
                          quiz.questions[currentQuestionIdx].id,
                          idx
                        )
                      }
                      className={`w-full p-4 border-4 border-black font-bold text-left transition-all ${
                        answers[quiz.questions[currentQuestionIdx].id] === idx
                          ? "bg-black text-white translate-x-1 translate-y-1 shadow-none"
                          : "bg-white hover:bg-yellow-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                      }`}
                    >
                      <span className="mr-4 opacity-50">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      {opt.text}
                    </button>
                  )
                )}
              </div>
            </div>

            <button
              onClick={nextQuestion}
              className="mt-8 w-full py-4 bg-cyan-400 border-4 border-black font-black text-xl uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              {currentQuestionIdx === quiz.questions.length - 1
                ? "FINISH HIM"
                : "NEXT SUFFERING"}
            </button>
          </div>
        )}

        {state === "SUBMITTING" && (
          <div className="text-center font-black text-4xl animate-bounce">
            JUDGING YOUR CHOICES...
          </div>
        )}

        {state === "RESULTS" && (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="bg-black text-white border-4 border-black p-8 text-center shadow-[12px_12px_0px_0px_rgba(255,0,255,1)]">
              <h2 className="text-5xl font-black mb-4 uppercase text-yellow-400">
                GAME OVER
              </h2>
              <div className="flex justify-center gap-12">
                <div>
                  <div className="text-sm font-bold opacity-70 uppercase">
                    Score
                  </div>
                  <div className="text-6xl font-display">
                    {score} / {quiz.questions.length}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold opacity-70 uppercase">
                    Time
                  </div>
                  <div className="text-6xl font-display">{timeTaken}s</div>
                </div>
              </div>
            </div>

            <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-black uppercase">Leaderboard</h3>
                <button
                  onClick={refreshLeaderboard}
                  className="text-sm font-bold underline hover:text-purple-600"
                >
                  REFRESH
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-bold border-collapse">
                  <thead>
                    <tr className="border-b-4 border-black bg-gray-100 uppercase text-sm">
                      <th className="p-3">Rank</th>
                      <th className="p-3">Player</th>
                      <th className="p-3 text-right">Score</th>
                      <th className="p-3 text-right">Time</th>
                      <th className="p-3 text-right">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, idx) => (
                      <tr
                        key={idx}
                        className={`border-b-2 border-black/10 ${
                          entry.username === username ? "bg-yellow-100" : ""
                        }`}
                      >
                        <td className="p-3">#{idx + 1}</td>
                        <td className="p-3">
                          {entry.username} {entry.userId && "✅"}
                        </td>
                        <td className="p-3 text-right">{entry.score}</td>
                        <td className="p-3 text-right">{entry.timeTaken}s</td>
                        <td className="p-3 text-right text-xs opacity-60">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-center">
              <Link href="/">
                <button className="px-8 py-3 bg-white border-4 border-black font-bold hover:bg-gray-100">
                  GO HOME
                </button>
              </Link>
              <Link
                href="/create-quiz"
                className="ml-4 px-8 py-3 bg-purple-600 text-white border-4 border-black font-bold hover:bg-purple-700"
              >
                CREATE YOUR OWN
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
