import Link from "next/link";

// SVG icons
const TeacherIcon = (
  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
);
const StudentIcon = (
  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0 0H6m6 0h6" /></svg>
);
const ClassIcon = (
  <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M3 20h18" /></svg>
);
const SubjectIcon = (
  <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-5-7 5V5z" /></svg>
);

const dashboardItems = [
  {
    title: "Teachers",
    href: "/admin/teachers",
    icon: TeacherIcon,
    description: "Add, edit, and view teachers",
  },
  {
    title: "Students",
    href: "/admin/students",
    icon: StudentIcon,
    description: "Add, edit, and view students",
  },
  {
    title: "Classes",
    href: "/admin/classes",
    icon: ClassIcon,
    description: "Add, edit, and view classes",
  },
  {
    title: "Subjects",
    href: "/admin/subjects",
    icon: SubjectIcon,
    description: "Add, edit, and view subjects",
  },
];

const features = [
  { label: "Teachers", value: '', color: "text-blue-500", icon: TeacherIcon },
  { label: "Students", value: '', color: "text-green-500", icon: StudentIcon },
  { label: "Classes", value: '', color: "text-yellow-500", icon: ClassIcon },
  { label: "Subjects", value: '', color: "text-purple-500", icon: SubjectIcon },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-white">
      <h1 className="text-3xl font-bold mb-8 text-neutral-800">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl mb-12">
        {dashboardItems.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="flex flex-col items-center justify-center p-8 bg-neutral-50 border border-neutral-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-150 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            {item.icon}
            <span className="mt-4 text-xl font-semibold text-neutral-700">{item.title}</span>
            <span className="mt-2 text-sm text-neutral-500">{item.description}</span>
          </Link>
        ))}
      </div>
      <h2 className="text-xl font-semibold mb-4 text-neutral-700">Features</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full max-w-3xl">
        {features.map((feature) => (
          <div key={feature.label} className="flex flex-col items-center justify-center p-6 bg-neutral-50 border border-neutral-200 rounded-xl shadow-sm">
            <div className="mb-2">{feature.icon}</div>
            <span className={`text-2xl font-bold ${feature.color}`}>{feature.value}</span>
            <span className="text-sm text-neutral-500 mt-1">{feature.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 