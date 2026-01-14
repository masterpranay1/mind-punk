import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function CreateQuizPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-50 text-black font-sans">
      <h1 className="text-4xl font-black font-display uppercase italic mb-4">
        Create Your Quiz
      </h1>
      <p className="text-xl font-bold">
        This is where the magic happens. (Logic coming soon)
      </p>
    </div>
  );
}
