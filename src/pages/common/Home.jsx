import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-white pt-16 pb-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-block rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-6">
                Academic Year 2025-2026
              </div>

              <h1 className="text-5xl font-bold leading-tight text-slate-900 mb-6">
                Master Your SWP391 Project with{" "}
                <span className="text-emerald-500">
                  Professional Workflows.
                </span>
              </h1>

              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Bridge the gap between academic requirements and
                industry-standard tools. Sync Jira tasks and GitHub commits
                directly into your course reports.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <Link
                  to="/register"
                  className="rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 shadow-lg shadow-emerald-500/30"
                >
                  Get Started Free
                </Link>
                <button className="rounded-lg border-2 border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                  View Demo
                </button>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <div className="flex -space-x-2">
                  <div className="h-8 w-8 rounded-full bg-slate-300 ring-2 ring-white"></div>
                  <div className="h-8 w-8 rounded-full bg-slate-400 ring-2 ring-white"></div>
                  <div className="h-8 w-8 rounded-full bg-slate-500 ring-2 ring-white"></div>
                </div>
                <span>Trusted by 500+ student teams</span>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 p-8 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
                  alt="Team collaboration"
                  className="rounded-xl shadow-lg w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Logos */}
      <section className="bg-slate-50 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-center text-xs uppercase tracking-widest text-slate-500 mb-8">
            Integrated with your favorite tools
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12">
            <div className="flex items-center gap-2 text-slate-600">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              </svg>
              <span className="font-medium text-sm">Jira</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              <span className="font-medium text-sm">GitHub</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Built for High-Performance Teams
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to succeed in your university software
              project, from tracking sprints to automated grading reports.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 hover:shadow-lg transition">
              <div className="mb-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                  <svg
                    className="h-6 w-6 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Jira Integration
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Real-time Sync. Monitor sprint progress and task distribution
                without leaving the platform.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 hover:shadow-lg transition">
              <div className="mb-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                  <svg
                    className="h-6 w-6 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                GitHub Tracking
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Commit Tracking. Automatically link code contributions to
                student IDs for transparent grading.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 hover:shadow-lg transition">
              <div className="mb-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                  <svg
                    className="h-6 w-6 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Academic Reporting
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Grade-Ready Exports. Generate formatted academic reports based
                on project velocity and activity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to streamline your SWP391 course?
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            Join over 100 teams already using our platform to build better
            software and get higher grades.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/register"
              className="rounded-lg bg-emerald-500 px-8 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
            >
              Get Started for Free
            </Link>
            <button className="rounded-lg border-2 border-white/20 bg-white/10 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/20">
              Talk to an Instructor
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-6 rounded bg-gradient-to-br from-emerald-400 to-emerald-600"></div>
                <span className="font-bold text-slate-900">SWP391 JGMS</span>
              </div>
              <p className="text-sm text-slate-600">
                Empowering the next generation of software engineers with
                professional-grade project management tools tailored for
                academic success.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <a href="#" className="hover:text-slate-900">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-slate-900">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-slate-900">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <a href="#" className="hover:text-slate-900">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-slate-900">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-slate-900">
                    University FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <a href="#" className="hover:text-slate-900">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-slate-900">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-600">
              © 2024 SWP391 JGMS. All rights reserved.
            </p>
            <div className="text-sm text-slate-600">
              Designed for{" "}
              <span className="text-emerald-600 font-medium">
                University Projects
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
