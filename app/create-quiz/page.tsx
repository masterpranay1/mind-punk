"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  createQuiz,
  getUserQuizzes,
  deleteQuiz,
  updateQuiz,
  getQuizWithQuestions,
} from "@/app/actions/quiz";

type Option = { text: string; isCorrect: boolean };
type Question = { question: string; options: Option[]; answer: string };
type Quiz = { id: number; title: string; subtitle: string | null };

export default function CreateQuizPage() {
  const { user } = useUser();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  async function fetchQuizzes() {
    try {
      const data = await getUserQuizzes();
      setQuizzes(data);
    } catch (error) {
      console.error("Failed to fetch quizzes", error);
    }
  }

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        options: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
        answer: "",
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: string, value: string) => {
    const newQuestions = [...questions];
    // @ts-expect-error - dynamic field access
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const updateOption = (
    qIndex: number,
    oIndex: number,
    field: string,
    value: string | boolean
  ) => {
    const newQuestions = [...questions];
    // @ts-expect-error - dynamic field access
    newQuestions[qIndex].options[oIndex][field] = value;
    setQuestions(newQuestions);
  };

  const addOption = (qIndex: number) => {
    if (questions[qIndex].options.length >= 4) return;
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push({ text: "", isCorrect: false });
    setQuestions(newQuestions);
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    if (questions[qIndex].options.length <= 2) return;
    const newQuestions = [...questions];
    newQuestions[qIndex].options.splice(oIndex, 1);
    setQuestions(newQuestions);
  };

  const resetForm = () => {
    setTitle("");
    setSubtitle("");
    setQuestions([]);
    setEditingId(null);
  };

  const handleEdit = async (quizId: number) => {
    setLoading(true);
    try {
      const quiz = await getQuizWithQuestions(quizId);
      if (quiz) {
        setEditingId(quiz.id);
        setTitle(quiz.title);
        setSubtitle(quiz.subtitle || "");
        setQuestions(quiz.questions);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (error) {
      console.error("Failed to load quiz", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quizId: number) => {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    try {
      await deleteQuiz(quizId);
      await fetchQuizzes();
      if (editingId === quizId) resetForm();
    } catch (error) {
      console.error("Failed to delete quiz", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const quizData = { title, subtitle, questions };

      if (editingId) {
        await updateQuiz(editingId, quizData);
      } else {
        await createQuiz(quizData);
      }

      await fetchQuizzes();
      resetForm();
    } catch (error) {
      console.error("Failed to save quiz", error);
    } finally {
      setLoading(false);
    }
  };

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
            <span className="font-bold hidden md:block">
              {user?.firstName ? `HEY, ${user.firstName.toUpperCase()}` : ""}
            </span>
            <UserButton />
          </div>
        </div>
      </nav>

      <main className="w-full max-w-4xl mx-auto px-4 py-12">
        <div className="grid gap-12">
          {/* Create/Edit Quiz Form */}
          <section className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-black font-display uppercase">
                {editingId ? "Edit Chaos" : "Construct Chaos"}{" "}
                <span className="text-purple-600">
                  ({editingId ? "Edit Mode" : "New"})
                </span>
              </h2>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="text-sm font-bold underline text-red-600 hover:text-red-800"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="font-bold text-xl uppercase">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border-4 border-black p-3 font-bold text-lg focus:outline-none focus:ring-4 ring-cyan-400"
                  placeholder="e.g. THE IMPOSSIBLE TEST"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="font-bold text-xl uppercase">Subtitle</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full border-4 border-black p-3 font-medium text-lg focus:outline-none focus:ring-4 ring-pink-400"
                  placeholder="Prepare to cry..."
                />
              </div>

              {/* Questions */}
              <div className="space-y-8">
                {questions.map((q, qIndex) => (
                  <div
                    key={qIndex}
                    className="bg-gray-100 border-4 border-black p-6 relative group"
                  >
                    <div className="absolute -top-4 -left-4 bg-black text-white px-3 py-1 font-black text-lg -rotate-2">
                      Q{qIndex + 1}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="absolute top-2 right-2 text-red-500 font-bold hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      DELETE QUESTION
                    </button>

                    <div className="space-y-4">
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) =>
                          updateQuestion(qIndex, "question", e.target.value)
                        }
                        className="w-full border-2 border-black p-2 font-bold mb-4"
                        placeholder="Question Text"
                        required
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {q.options.map((opt, oIndex) => (
                          <div key={oIndex} className="flex gap-2 items-center">
                            <span className="font-bold font-mono">
                              {String.fromCharCode(65 + oIndex)}.
                            </span>
                            <div className="flex-1 relative">
                              <input
                                type="text"
                                value={opt.text}
                                onChange={(e) =>
                                  updateOption(
                                    qIndex,
                                    oIndex,
                                    "text",
                                    e.target.value
                                  )
                                }
                                className="w-full border-2 border-black p-2 bg-white pr-8"
                                placeholder={`Option ${oIndex + 1}`}
                                required
                              />
                              {q.options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removeOption(qIndex, oIndex)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 font-black hover:scale-110"
                                  title="Remove Option"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        {q.options.length < 4 && (
                          <button
                            type="button"
                            onClick={() => addOption(qIndex)}
                            className="border-2 border-dashed border-black bg-white/50 p-2 font-bold text-gray-500 hover:bg-white hover:text-black transition-colors"
                          >
                            + ADD OPTION
                          </button>
                        )}
                      </div>

                      <div className="mt-4">
                        <label className="font-bold uppercase text-sm">
                          Correct Answer
                        </label>
                        <input
                          type="text"
                          value={q.answer}
                          onChange={(e) =>
                            updateQuestion(qIndex, "answer", e.target.value)
                          }
                          className="w-full border-2 border-black p-2 bg-green-50"
                          placeholder="Exact answer text"
                          required
                        />
                        <p className="text-xs mt-1 text-gray-500 font-bold">
                          *Must match one option exactly for auto-grading
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addQuestion}
                className="w-full py-3 border-4 border-black border-dashed font-black hover:bg-yellow-200 transition-colors uppercase"
              >
                + Add Question
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-black text-white font-black text-2xl uppercase border-4 border-transparent hover:bg-purple-600 hover:border-black transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Processing..."
                  : editingId
                  ? "Update Quiz"
                  : "Launch Quiz"}
              </button>
            </form>
          </section>

          {/* Previous Quizzes List */}
          <section>
            <h2 className="text-4xl font-black mb-8 font-display uppercase">
              Your Arsenal{" "}
              <span className="text-cyan-600">({quizzes.length})</span>
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="bg-yellow-300 border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-2xl font-black uppercase mb-2 leading-none">
                      {quiz.title}
                    </h3>
                    <p className="font-bold text-black/70 mb-4 h-12 overflow-hidden">
                      {quiz.subtitle || "No subtitle"}
                    </p>
                    <div className="bg-white border-2 border-black p-2 text-center font-mono text-sm break-all mb-4">
                      devotional-quiz.com/quiz/{quiz.id}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(quiz.id)}
                      className="flex-1 bg-white border-2 border-black py-2 font-bold hover:bg-cyan-200 transition-colors"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => handleDelete(quiz.id)}
                      className="flex-1 bg-white border-2 border-black py-2 font-bold hover:bg-red-400 hover:text-white transition-colors"
                    >
                      DELETE
                    </button>
                  </div>
                </div>
              ))}
              {quizzes.length === 0 && (
                <div className="col-span-2 text-center py-12 border-4 border-black border-dashed opacity-50 font-bold text-xl uppercase">
                  No quizzes yet. Get to work.
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
