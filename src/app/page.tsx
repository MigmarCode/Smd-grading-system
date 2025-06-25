import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#fffef2' }}>
      <main className="flex-1 flex items-center justify-center w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-6xl min-h-[70vh] bg-white/80 dark:bg-neutral-900/80 rounded-xl shadow-lg overflow-hidden">
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
          <div className="flex flex-col items-center justify-center px-6 py-12 md:py-0 text-center md:text-center relative z-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 drop-shadow-lg tracking-tight w-full flex justify-center" style={{ color: '#5d0b0d' }}>
              Welcome to SMD Portal
            </h1>
            <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-200 max-w-xl mb-10 drop-shadow">
              The platform is for managing school grades, teachers, and administration. Please select your role to get started.
            </p>
            <div className="flex flex-col gap-4 mt-8 w-full max-w-xs mx-auto md:mx-0">
              <a
                href="/admin/dashboard"
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 text-white text-lg font-semibold py-3 px-6 text-center shadow-lg hover:from-blue-700 hover:to-blue-500 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2m16-10V7a4 4 0 00-4-4H8a4 4 0 00-4 4v4m16 0a4 4 0 01-4 4H8a4 4 0 01-4-4m16 0V7m0 4H4" /></svg>
                Admin Sign Up
              </a>
              <a
                href="#"
                className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-blue-400 bg-white text-blue-700 text-lg font-semibold py-3 px-6 text-center shadow hover:bg-blue-50 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0 0H6m6 0h6" /></svg>
                Teacher Sign Up
              </a>
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
