import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ROUTER_URL } from "../../consts/router.const";
import { AuthService } from "../../services/auth.service";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    studentCode: "",
    role: "student",

  });
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});

    try {
      let response;

      if (form.role === "lecturer") {
        response = await AuthService.registerLecturer({
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          phone: form.phone,
        });
      } else {
        response = await AuthService.register({
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          phone: form.phone,
          studentCode: form.studentCode,
        });
      }

      if (response?.data) {
        toast.success("Registration successful! Please login.");
        navigate(ROUTER_URL.COMMON.LOGIN);
      }
    } catch (error) {
      console.error("Registration failed:", error);

      const errorData = error?.response?.data;

      if (errorData?.errors) {
        const fieldErrors = {};
        Object.keys(errorData.errors).forEach((field) => {
          const fieldName = field.charAt(0).toLowerCase() + field.slice(1);
          fieldErrors[fieldName] =
            errorData.errors[field][0] || errorData.errors[field];
        });
        setErrors(fieldErrors);
        toast.error("Please check your registration information.");
      } else if (errorData?.message) {
        toast.error(errorData.message);
      } else {
        toast.error("Registration failed. Please try again.");
      }
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white/90 shadow-xl backdrop-blur">
        <div className="grid gap-0 lg:grid-cols-2">
          <div className="hidden flex-col justify-between bg-gradient-to-br from-teal-100 via-slate-50 to-white p-10 lg:flex">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-300 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
                JGMS Onboarding
              </div>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900">
                Create your workspace in minutes.
              </h1>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Register to manage Jira requirements, GitHub insights, and SRS
                reporting in one place.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">What you unlock</p>
              <ul className="mt-3 space-y-2 text-slate-600">
                <li>• SRS generation from Jira issues</li>
                <li>• Team workload & progress summaries</li>
                <li>• GitHub contribution analytics</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col gap-8 p-8 sm:p-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-500">
                Register
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">
                Create your JGMS account
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Use your institutional email to get started.
              </p>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor="fullName"
                >
                  Full name
                </label>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Role
                  </label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  >
                    <option value="student">Student</option>
                    <option value="lecturer">Lecturer</option>
                  </select>
                </div>
                <input
                  className={`w-full rounded-xl border ${errors.fullName ? "border-red-400" : "border-slate-200"} bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30`}
                  id="fullName"
                  name="fullName"
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  type="text"
                  value={form.fullName}
                  required
                />
                {errors.fullName && (
                  <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
                )}
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  className={`w-full rounded-xl border ${errors.email ? "border-red-400" : "border-slate-200"} bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30`}
                  id="email"
                  name="email"
                  onChange={handleChange}
                  placeholder="name@fpt.edu.vn"
                  type="email"
                  value={form.email}
                  required
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  className={`w-full rounded-xl border ${errors.password ? "border-red-400" : "border-slate-200"} bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30`}
                  id="password"
                  name="password"
                  onChange={handleChange}
                  placeholder="••••••••"
                  type="password"
                  value={form.password}
                  required
                />
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                )}
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor="phone"
                >
                  Phone
                </label>
                <input
                  className={`w-full rounded-xl border ${errors.phone ? "border-red-400" : "border-slate-200"} bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30`}
                  id="phone"
                  name="phone"
                  onChange={handleChange}
                  placeholder="0123456789"
                  type="tel"
                  value={form.phone}
                  required
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>
              {form.role === "student" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Student Code
                  </label>
                  <input
                    className={`w-full rounded-xl border ${
                      errors.studentCode ? "border-red-400" : "border-slate-200"
                    } px-4 py-3`}
                    name="studentCode"
                    onChange={handleChange}
                    value={form.studentCode}
                    required
                  />
                  {errors.studentCode && (
                    <p className="text-xs text-red-500">{errors.studentCode}</p>
                  )}
                </div>
              )}
              <button
                className="w-full rounded-xl bg-teal-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:ring-offset-2 focus:ring-offset-white"
                type="submit"
              >
                Create account
              </button>
            </form>
            <div className="space-y-4 text-xs text-slate-500">
              <p>By signing up, you agree to our terms and privacy policy.</p>
              <p>
                Already have an account?{" "}
                <Link
                  to={ROUTER_URL.COMMON.LOGIN}
                  className="font-semibold text-teal-600 transition hover:text-teal-500"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
