"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#fffef2' }}>
      <main className="flex-1 flex items-center justify-center w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-6xl min-h-[85vh] bg-white/80 dark:bg-neutral-900/80 rounded-xl shadow-lg overflow-hidden">
          {/* Left: Image */}
          <div className="relative h-64 md:h-auto w-full">
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundImage: "url('/Root-Guru-SMDKIDS.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center 60%",
                backgroundRepeat: "no-repeat",
              }}
            />
          </div>
          {/* Right: Content */}
          <div className="flex flex-col items-center justify-center px-6 py-12 md:py-0 text-center md:text-center relative z-10" style={{ background: '#fffef2' }}>
            <div className="mb-10">
              <img 
                src="/SMD_Logo.png" 
                alt="SMD Logo" 
                className="w-24 h-24 md:w-32 md:h-32 object-contain"
              />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 drop-shadow-lg tracking-tight w-full flex justify-center" style={{ color: '#5d0b0d' }}>
              Welcome to SMD
            </h1>
            <p className="text-base text-black max-w-xl mb-8 drop-shadow px-2.5">
              Shree Mangal Dvip (SMD) School for Himalayan Children in Kathmandu provides free education, housing and full care for over 500 children from the most vulnerable and remote Himalayan mountain villages of northern Nepal.
            </p>
            <div className="w-full flex justify-center">
              <div className="w-full max-w-xs">
                <div className="border-t border-neutral-300 mb-8"></div>
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => router.push("/admin/login")}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-400 text-white text-lg font-semibold py-3 px-6 text-center shadow-lg hover:from-yellow-600 hover:to-yellow-500 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
                  >
                    Administrator Access
                  </button>
                  <button
                    onClick={() => router.push("/teacher/login")}
                    className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-blue-400 bg-white text-blue-700 text-lg font-semibold py-3 px-6 text-center shadow hover:bg-blue-50 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2"
                  >
                    Class Teacher Access
                  </button>
                  <button
                    onClick={() => router.push("/subject-teacher/login")}
                    className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-green-400 bg-white text-green-700 text-lg font-semibold py-3 px-6 text-center shadow hover:bg-green-50 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-green-200 focus:ring-offset-2"
                  >
                    Subject Teacher Access
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-xs text-neutral-500 dark:text-neutral-400 relative z-10">
        &copy; {new Date().getFullYear()} himalayanchildren.org. All rights reserved.
      </footer>
    </div>
  );
}
