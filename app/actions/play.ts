"use server";

import { db } from "@/lib/db";
import {
  quizzes,
  questions,
  quizSubmissions,
  quizAnswers,
} from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, desc, asc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getPublicQuiz(quizId: number) {
  const quiz = await db.query.quizzes.findFirst({
    where: eq(quizzes.id, quizId),
    with: {
      questions: true,
    },
  });

  if (!quiz) return null;

  // Sanitize answers so they aren't sent to the client
  const sanitizedQuestions = quiz.questions.map((q) => ({
    id: q.id,
    question: q.question,
    options: q.options.map((o) => ({ text: o.text })), // remove isCorrect
  }));

  return {
    ...quiz,
    questions: sanitizedQuestions,
  };
}

export type SubmitQuizData = {
  quizId: number;
  username: string;
  guestId?: string; // UUID from localStorage
  timeTaken: number;
  answers: Record<number, number>; // questionId -> selectedOptionIndex
};

export async function submitQuiz(data: SubmitQuizData) {
  const { userId } = await auth();

  // 1. Fetch correct answers to calculate score
  const quizQuestions = await db.query.questions.findMany({
    where: eq(questions.quizId, data.quizId),
  });

  let score = 0;
  const answerRecords = [];

  for (const q of quizQuestions) {
    const selectedIndex = data.answers[q.id];
    if (selectedIndex !== undefined) {
      const selectedOption = q.options[selectedIndex];
      // Fallback: compare text if isCorrect is false (legacy/current behavior) or just use text match since UI relies on it.
      // The UI saves 'answer' text, so we check if selected option matches that text.
      const isCorrect =
        (selectedOption?.isCorrect ?? false) ||
        selectedOption?.text === q.answer; // Check for exact match

      if (isCorrect) score++;

      answerRecords.push({
        questionId: q.id,
        selectedOptionIndex: selectedIndex,
        isCorrect,
      });
    }
  }

  // 2. Save Submission
  const [submission] = await db
    .insert(quizSubmissions)
    .values({
      quizId: data.quizId,
      userId: userId || null,
      guestId: data.guestId || null,
      username: data.username,
      score: score,
      timeTaken: data.timeTaken,
    })
    .returning();

  // 3. Save Answers
  if (answerRecords.length > 0) {
    await db.insert(quizAnswers).values(
      answerRecords.map((a) => ({
        submissionId: submission.id,
        ...a,
      }))
    );
  }

  revalidatePath(`/quiz/${data.quizId}`);

  return {
    success: true,
    submissionId: submission.id,
    score,
    total: quizQuestions.length,
  };
}

export async function getLeaderboard(quizId: number) {
  // Fetch top 50 submissions sorted by Score (Desc) and Time (Asc)
  const results = await db.query.quizSubmissions.findMany({
    where: eq(quizSubmissions.quizId, quizId),
    orderBy: [desc(quizSubmissions.score), asc(quizSubmissions.timeTaken)],
    limit: 50,
  });

  return results;
}

export async function getQuizAttempt(quizId: number, guestId?: string) {
  const { userId } = await auth();

  if (!userId && !guestId) return null;

  const attempt = await db.query.quizSubmissions.findFirst({
    where: and(
      eq(quizSubmissions.quizId, quizId),
      userId
        ? eq(quizSubmissions.userId, userId)
        : eq(quizSubmissions.guestId, guestId!)
    ),
  });

  return attempt || null;
}
