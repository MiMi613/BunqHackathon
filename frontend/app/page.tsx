import { fetchHello } from "@/lib/api";

async function BackendGreeting() {
  let message: string;
  try {
    const data = await fetchHello("Bunq Hackathon");
    message = data.message;
  } catch {
    message = "⚠️ Could not reach the Python backend. Is it running?";
  }
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-6 py-4 dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
        Response from Python backend
      </p>
      <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {message}
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-2xl flex-col gap-10 py-20 px-8">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Bunq Hackathon 7.0
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Next.js + Python Template
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-base leading-7">
            A full-stack starter with a{" "}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              Next.js
            </span>{" "}
            frontend and a{" "}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              FastAPI (Python)
            </span>{" "}
            backend. Edit{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm dark:bg-zinc-800">
              frontend/app/page.tsx
            </code>{" "}
            and{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm dark:bg-zinc-800">
              backend/main.py
            </code>{" "}
            to get started.
          </p>
        </div>

        <BackendGreeting />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">
              API Docs →
            </span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Explore the interactive FastAPI Swagger UI at localhost:8000/docs
            </span>
          </a>
          <a
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">
              Next.js Docs →
            </span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Learn about the Next.js App Router, server components, and more.
            </span>
          </a>
        </div>
      </main>
    </div>
  );
}
