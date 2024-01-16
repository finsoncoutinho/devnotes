"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm, SubmitHandler } from "react-hook-form";
import { useSignUp } from "../_hooks/useSignUp";
import { useRouter } from "next/navigation";

interface RegisterInputs {
  fullName: string;
  email: string;
  password: string;
}

const SignUpForm = () => {
  const router = useRouter();

  const { isPending, signUp } = useSignUp();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInputs>();
  const onSubmit: SubmitHandler<RegisterInputs> = (data) => {
    signUp(data);
  };
  return (
    <Card className="m-4 w-[350px]">
      <CardHeader>
        <CardTitle>Welcome to DevNotes!</CardTitle>
        <CardDescription>Sign up to create your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 flex flex-col gap-6"
        >
          <div className="flex flex-col gap-2">
            <Input
              type="text"
              placeholder="Full Name"
              {...register("fullName", {
                required: "Name is required",
              })}
            />
            {errors.fullName && (
              <span className=" pl-2 text-sm text-red-600">
                {errors.fullName.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Input
              type="email"
              placeholder="Email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && (
              <span className=" pl-2 text-sm text-red-600">
                {errors.email.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Input
              type="password"
              placeholder="Password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be minimum 8 characters",
                },
              })}
            />
            {errors.password && (
              <span className=" pl-2 text-sm text-red-600">
                {errors.password.message}
              </span>
            )}
          </div>
          <Button type="submit" disabled={isPending} className="mt-2">
            {isPending ? "Loading..." : "Sign up"}
          </Button>
        </form>
        <p className="mt-8 text-sm">
          Have an account?{" "}
          <span
            onClick={() => router.push("/sign-in", { scroll: false })}
            className="cursor-pointer underline"
          >
            Sign in
          </span>
        </p>
      </CardContent>
    </Card>
  );
};

export default SignUpForm;
