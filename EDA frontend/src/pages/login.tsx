import React, { useState, FormEvent, ChangeEvent, useEffect, useRef, useCallback } from "react";
import { login, signup, setAuthToken, googleLogin } from "../api/auth";
import RoleDropdown from "../components/RoleDropdown";

interface AuthPageProps {
  onLoginSuccess: () => void;
}

// Google Client ID - Replace with your actual client ID from Google Cloud Console
const GOOGLE_CLIENT_ID = "128759038802-odee7hpc0uc7e00k9nuso93qsqtqg0so.apps.googleusercontent.com";

export default function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [role, setRole] = useState<'user' | 'admin'>('user');

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setMessage("");
    setForm({ name: "", email: "", password: "" });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGoogleSignIn = useCallback(async (response: { credential: string }) => {
    setIsGoogleLoading(true);
    setMessage("");

    try {
      // For signup, use the selected role; for login, use "user" as default
      const selectedRole = isSignup ? role : "user";
      const authResponse = await googleLogin(response.credential, selectedRole);
      setAuthToken(authResponse.access_token);
      // Store user info if available
      if (authResponse.user) {
        localStorage.setItem("user", JSON.stringify(authResponse.user));
      }
      setMessage("Login successful! Redirecting...");
      setMessageType("success");
      setTimeout(() => {
        onLoginSuccess();
      }, 1000);
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Google sign-in failed. Please try again.";
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setIsGoogleLoading(false);
    }
  }, [onLoginSuccess, isSignup, role]);

  // Check if Google script is loaded
  useEffect(() => {
    const checkGoogleScript = () => {
      if (window.google?.accounts?.id) {
        setGoogleScriptLoaded(true);
      }
    };

    // Check immediately
    checkGoogleScript();

    // Also check periodically in case script loads later
    const interval = setInterval(() => {
      if (window.google?.accounts?.id) {
        setGoogleScriptLoaded(true);
        clearInterval(interval);
      }
    }, 100);

    // Cleanup after 10 seconds
    const timeout = setTimeout(() => clearInterval(interval), 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Initialize Google Sign-In button
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleScriptLoaded) {
      return;
    }

    if (!googleButtonRef.current) {
      return;
    }

    try {
      // Clear any existing content
      googleButtonRef.current.innerHTML = '';

      // Initialize Google Sign-In
      window.google!.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleSignIn,
      });

      // Render the button
      window.google!.accounts.id.renderButton(googleButtonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: isSignup ? "signup_with" : "signin_with",
        shape: "rectangular",
      });
    } catch (error) {
      console.error("Error initializing Google Sign-In:", error);
    }

    // Cleanup: Google button will be re-rendered when dependencies change
  }, [isSignup, googleScriptLoaded, handleGoogleSignIn]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      if (isSignup) {
        await signup({
          name: form.name,
          email: form.email,
          password: form.password,
          role: role,
        });
        setMessage("Signup successful! Please login now.");
        setMessageType("success");
        setIsSignup(false);
        setForm({ name: "", email: "", password: "" });
      } else {
        const response = await login({
          email: form.email,
          password: form.password,
        });
        setAuthToken(response.access_token);
        // Store user info if available
        if (response.user) {
          localStorage.setItem("user", JSON.stringify(response.user));
        }
        setMessage("Login successful! Redirecting...");
        setMessageType("success");
        // Call the callback to update parent component
        setTimeout(() => {
          onLoginSuccess();
        }, 1000);
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Something went wrong! Please try again.";
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header matching dashboard theme */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-3">
            <img
              src="/logo-BlQOt2VI.svg"
              alt="Quant Matrix AI"
              className="h-8 w-auto"
            />
          </div>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {isSignup ? "Create Your Account" : "Welcome Back"}
            </h2>
            <p className="text-sm text-gray-500">
              {isSignup
                ? "Sign up to access your dashboard"
                : "Sign in to continue to your dashboard"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name
                </label>
                <input
                  id="name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Role Selection Dropdown */}
            {isSignup && (
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Select Role
                </label>
                <RoleDropdown value={role} onChange={setRole} />
              </div>
            )}

            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  messageType === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full py-2 px-4 bg-yellow-500 text-white rounded-lg shadow-sm hover:bg-yellow-600 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 font-medium"
            >
              {isLoading ? "Processing..." : isSignup ? "Sign Up" : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Sign-In Button */}
          <div className="w-full mb-6">
            {GOOGLE_CLIENT_ID && googleScriptLoaded ? (
              <div
                ref={googleButtonRef}
                className={isGoogleLoading ? "opacity-50 pointer-events-none" : ""}
                style={{ minHeight: '40px', width: '100%' }}
              ></div>
            ) : (
              <button
                type="button"
                disabled={!GOOGLE_CLIENT_ID}
                onClick={() => {
                  if (!GOOGLE_CLIENT_ID) {
                    setMessage("Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file");
                    setMessageType("error");
                  }
                }}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border-2 border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all duration-200 shadow-sm"
                title={!GOOGLE_CLIENT_ID ? "Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file" : "Sign in with Google"}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-medium">{isSignup ? "Sign up with Google" : "Sign in with Google"}</span>
              </button>
            )}
          </div>

          {!GOOGLE_CLIENT_ID && (
            <div className="text-center text-xs text-amber-600 mb-2 px-2">
              ⚠️ Google Sign-In is not configured. Add VITE_GOOGLE_CLIENT_ID to your .env file.
            </div>
          )}

          {GOOGLE_CLIENT_ID && !googleScriptLoaded && (
            <div className="text-center text-xs text-gray-500 mb-2">
              Loading Google Sign-In...
            </div>
          )}

          {isGoogleLoading && (
            <div className="text-center text-sm text-gray-500 mb-4">
              Signing in with Google...
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={toggleMode}
                className="text-gray-900 font-medium hover:text-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded px-1 transition-colors"
              >
                {isSignup ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
