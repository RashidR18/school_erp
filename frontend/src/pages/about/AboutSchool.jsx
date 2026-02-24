import { motion } from "framer-motion";
import { FaAward, FaBookReader, FaChalkboardTeacher, FaFlask, FaSchool } from "react-icons/fa";
import { HiMiniMapPin, HiMiniPhone, HiMiniEnvelope } from "react-icons/hi2";
import DashboardLayout from "../../layout/DashboardLayout";

const facilities = [
  {
    title: "Sports Infrastructure",
    icon: <FaAward className="text-blue-600" />,
    detail:
      "Football ground, cricket pitch, basketball court, badminton court, table tennis, and jumping pit.",
  },
  {
    title: "Science and Maths Lab",
    icon: <FaFlask className="text-emerald-600" />,
    detail: "Practical lab support for science and mathematics learning across classes.",
  },
  {
    title: "Digital Learning Spaces",
    icon: <FaChalkboardTeacher className="text-indigo-600" />,
    detail: "Dedicated computer room and learning spaces for modern classroom engagement.",
  },
  {
    title: "Library and Auditorium",
    icon: <FaBookReader className="text-amber-600" />,
    detail:
      "School library, auditorium, and activity spaces for overall student development.",
  },
];

function AboutSchool() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl py-4 md:py-6 space-y-4 md:space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-r from-blue-700 via-cyan-600 to-emerald-600 text-white shadow-xl p-5 md:p-8"
        >
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="inline-flex items-center justify-center rounded-full bg-white/20 p-2">
              <FaSchool />
            </span>
            <h1 className="text-2xl md:text-4xl font-bold">Marina English High School</h1>
          </div>
          <p className="text-sm md:text-base text-white/95 max-w-4xl">
            Marina English High School, Goa is a Government 10th+2 school focused on quality
            education, discipline, and student growth. This page is designed for students, parents,
            and staff to quickly understand school profile and facilities.
          </p>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <motion.section
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 rounded-2xl bg-white shadow p-5 md:p-6"
          >
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3">School Profile</h2>
            <p className="text-slate-700 leading-relaxed">
              Marina English High School (MEHS) supports education from secondary to higher
              secondary level. The school aims to provide a strong academic foundation while
              encouraging confidence, values, and practical learning among students.
            </p>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border bg-slate-50 p-3">
                <div className="text-xs uppercase tracking-wide text-slate-500">School Type</div>
                <div className="font-semibold text-slate-800">Government 10th+2</div>
              </div>
              <div className="rounded-xl border bg-slate-50 p-3">
                <div className="text-xs uppercase tracking-wide text-slate-500">Principal</div>
                <div className="font-semibold text-slate-800">Eveletane Antao</div>
              </div>
              <div className="rounded-xl border bg-slate-50 p-3">
                <div className="text-xs uppercase tracking-wide text-slate-500">Location</div>
                <div className="font-semibold text-slate-800">Verna - Goa, 403722</div>
              </div>
              <div className="rounded-xl border bg-slate-50 p-3">
                <div className="text-xs uppercase tracking-wide text-slate-500">Brand</div>
                <div className="font-semibold text-slate-800">MEHS / Marina School ERP</div>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl bg-white shadow p-5 md:p-6"
          >
            <h2 className="text-lg md:text-xl font-semibold text-slate-900 mb-4">Contact Info</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <HiMiniMapPin className="text-blue-600 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-500">Address</div>
                  <div className="text-sm font-medium text-slate-800">Verna - Goa, 403722</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <HiMiniPhone className="text-emerald-600 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-500">Official Number</div>
                  <div className="text-sm font-medium text-slate-800">0832-2783959</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <HiMiniEnvelope className="text-indigo-600 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-500">Email</div>
                  <div className="text-sm font-medium text-slate-800">mehs_verna@rediffmail.com</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <HiMiniPhone className="text-amber-600 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-500">Principal Number</div>
                  <div className="text-sm font-medium text-slate-800">9822140747</div>
                </div>
              </div>
            </div>
            <a
              href="https://marinaenglishhighschool.com/facilities/"
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-block w-full text-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              View Official Facilities Page
            </a>
            <a
              href="https://marinaenglishhighschool.com/"
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block w-full text-center rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
            >
              Visit Official School Website
            </a>
          </motion.section>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white shadow p-5 md:p-6"
        >
          <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">Facilities Snapshot</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {facilities.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-200 p-4 bg-gradient-to-br from-white to-slate-50"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{item.icon}</span>
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                </div>
                <p className="text-sm text-slate-700">{item.detail}</p>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </DashboardLayout>
  );
}

export default AboutSchool;
