"use server";

import { db } from "@/lib/db";
import { quizzes, questions } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type CreateQuizData = {
  title: string;
  subtitle: string;
  questions: {
    question: string;
    options: { text: string; isCorrect: boolean }[];
    answer: string;
  }[];
};

export async function createQuiz(data: CreateQuizData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Transaction not supported in HTTP driver, executing sequentially
  const [newQuiz] = await db
    .insert(quizzes)
    .values({
      creatorId: userId,
      title: data.title,
      subtitle: data.subtitle,
    })
    .returning();

  if (data.questions.length > 0) {
    await db.insert(questions).values(
      data.questions.map((q) => ({
        quizId: newQuiz.id,
        question: q.question,
        options: q.options,
        answer: q.answer,
      }))
    );
  }

  revalidatePath("/create-quiz");
  return { success: true };
}

export async function getUserQuizzes() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return await db.query.quizzes.findMany({
    where: eq(quizzes.creatorId, userId),
    orderBy: [desc(quizzes.createdAt)],
  });
}

export async function getQuizWithQuestions(quizId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const quiz = await db.query.quizzes.findFirst({
    where: (quizzes, { eq, and }) =>
      and(eq(quizzes.id, quizId), eq(quizzes.creatorId, userId)),
    with: {
      questions: true,
    },
  });

  return quiz;
}

export async function deleteQuiz(quizId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Verify ownership
  const quiz = await db.query.quizzes.findFirst({
    where: (quizzes, { eq, and }) =>
      and(eq(quizzes.id, quizId), eq(quizzes.creatorId, userId)),
  });

  if (!quiz) throw new Error("Quiz not found or unauthorized");

  // Manual cascade delete
  await db.delete(questions).where(eq(questions.quizId, quizId));
  await db.delete(quizzes).where(eq(quizzes.id, quizId));

  revalidatePath("/create-quiz");
  return { success: true };
}

export async function updateQuiz(quizId: number, data: CreateQuizData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Verify ownership
  const quiz = await db.query.quizzes.findFirst({
    where: (quizzes, { eq, and }) =>
      and(eq(quizzes.id, quizId), eq(quizzes.creatorId, userId)),
  });

  if (!quiz) throw new Error("Quiz not found or unauthorized");

  // Update quiz details
  await db
    .update(quizzes)
    .set({
      title: data.title,
      subtitle: data.subtitle,
      updatedAt: new Date(),
    })
    .where(eq(quizzes.id, quizId));

  // Replace questions (delete all and re-insert)
  await db.delete(questions).where(eq(questions.quizId, quizId));

  if (data.questions.length > 0) {
    await db.insert(questions).values(
      data.questions.map((q) => ({
        quizId: quizId,
        question: q.question,
        options: q.options,
        answer: q.answer,
      }))
    );
  }

  revalidatePath("/create-quiz");
  return { success: true };
}
