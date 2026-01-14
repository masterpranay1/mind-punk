import {
  pgTable,
  text,
  timestamp,
  serial,
  integer,
  json,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  creatorId: text("creator_id").notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const quizRelations = relations(quizzes, ({ many }) => ({
  questions: many(questions),
}));

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id")
    .references(() => quizzes.id)
    .notNull(),
  question: text("question").notNull(),
  options: json("options")
    .$type<{ text: string; isCorrect: boolean }[]>()
    .notNull(),
  answer: text("answer").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const questionsRelations = relations(questions, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [questions.quizId],
    references: [quizzes.id],
  }),
}));

export const quizSubmissions = pgTable("quiz_submissions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id")
    .references(() => quizzes.id)
    .notNull(),
  userId: text("user_id"), // Clerk ID (nullable for guests)
  guestId: text("guest_id"), // UUID for guests
  username: text("username").notNull(),
  score: integer("score").notNull(),
  timeTaken: integer("time_taken").notNull(), // in seconds
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quizSubmissionsRelations = relations(
  quizSubmissions,
  ({ one, many }) => ({
    quiz: one(quizzes, {
      fields: [quizSubmissions.quizId],
      references: [quizzes.id],
    }),
    answers: many(quizAnswers),
  })
);

export const quizAnswers = pgTable("quiz_answers", {
  id: serial("id").primaryKey(),
  submissionId: integer("submission_id")
    .references(() => quizSubmissions.id)
    .notNull(),
  questionId: integer("question_id")
    .references(() => questions.id)
    .notNull(),
  selectedOptionIndex: integer("selected_option_index").notNull(),
  isCorrect: boolean("is_correct").notNull(),
});

export const quizAnswersRelations = relations(quizAnswers, ({ one }) => ({
  submission: one(quizSubmissions, {
    fields: [quizAnswers.submissionId],
    references: [quizSubmissions.id],
  }),
  question: one(questions, {
    fields: [quizAnswers.questionId],
    references: [questions.id],
  }),
}));
