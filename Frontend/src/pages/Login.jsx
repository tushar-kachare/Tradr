import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";


const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Login Data:", formData);

    try {
        const res = await loginUser(formData);
        console.log(res.data);
        navigate('/')
    } catch(err) {
        console.log(err.response?.data || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      {/* Card */}
      <div className="w-full max-w-md bg-[#0f0f0f] border border-gray-800 rounded-2xl p-8 shadow-lg">
        {/* Heading */}
        <h2 className="text-2xl font-semibold text-white mb-2">
          Welcome Back, Trader
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Log in to continue trading on Tradr.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="text-gray-400 text-sm block mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@gmail.com"
              className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-gray-400 text-sm block mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-linear-to-r from-blue-600 to-indigo-700 text-white font-medium hover:opacity-90 transition"
          >
            Login
          </button>
        </form>

        {/* Register Link */}
        <p className="text-gray-400 text-sm text-center mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-white hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
