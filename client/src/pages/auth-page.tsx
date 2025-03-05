import React, { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(1),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { loginMutation, registerMutation } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  // Use separate form instances for login and register to avoid hook ordering issues
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    const result = await loginMutation.mutateAsync({
      username: data.email,
      password: data.password,
    });

    if (!loginMutation.error) {
      // Redirect based on user role
      navigate(result.role === "ADMIN" ? "/admin" : "/");
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    const result = await registerMutation.mutateAsync({
      name: data.name,
      username: data.email,
      password: data.password,
      role: "STUDENT", // Default role for new registrations
      class: 1, // Default class
      section: "A", // Default section
    });

    if (!registerMutation.error) {
      // Students are redirected to the student dashboard
      navigate("/");
    }
  };

  return (
    <div className="container mx-auto max-w-md p-6">
      <div className="flex flex-col items-center mb-6">
        <h1 className="text-2xl font-bold mb-2">
          {isLogin ? "Login" : "Register"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isLogin
            ? "Login to access your account"
            : "Create a new account to get started"}
        </p>
      </div>

      {isLogin ? (
        <form
          onSubmit={loginForm.handleSubmit(onLoginSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full p-2 border rounded"
              {...loginForm.register("email")}
            />
            {loginForm.formState.errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {loginForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full p-2 border rounded"
              {...loginForm.register("password")}
            />
            {loginForm.formState.errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {loginForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-primary text-white rounded"
            disabled={loginForm.formState.isSubmitting || loginMutation.isPending}
          >
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </button>
        </form>
      ) : (
        <form
          onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              type="text"
              className="w-full p-2 border rounded"
              {...registerForm.register("name")}
            />
            {registerForm.formState.errors.name && (
              <p className="text-red-500 text-xs mt-1">
                {registerForm.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full p-2 border rounded"
              {...registerForm.register("email")}
            />
            {registerForm.formState.errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {registerForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full p-2 border rounded"
              {...registerForm.register("password")}
            />
            {registerForm.formState.errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {registerForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-primary text-white rounded"
            disabled={registerForm.formState.isSubmitting || registerMutation.isPending}
          >
            {registerMutation.isPending ? "Registering..." : "Register"}
          </button>
        </form>
      )}

      <div className="mt-4 text-center">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-primary text-sm"
        >
          {isLogin
            ? "Don't have an account? Register"
            : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}