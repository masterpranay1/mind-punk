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
