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
import { useSignIn } from "../_hooks/useSignIn";
import { useRouter } from "next/navigation";

interface loginInputs {
  email: string;
  password: string;
}

const SignInForm = () => {
  const router = useRouter();

  const { isPending, signIn } = useSignIn();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<loginInputs>();
  const onSubmit: SubmitHandler<loginInputs> = (data) => {
    signIn(data);
  };
  return (
    <Card className="m-4 w-[350px]">
      <CardHeader>
        <CardTitle>Welcome Back!</CardTitle>
        <CardDescription>Sign in to your DevNotes Account</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4 flex flex-col gap-4"
        >
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
            {isPending ? "Loading..." : "Sign in"}
          </Button>
        </form>
        <p className="mt-8 text-sm">
          No account?{" "}
          <span
            onClick={() => router.push("/sign-up", { scroll: false })}
            className="cursor-pointer text-indigo-600 "
          >
            Sign up
          </span>
        </p>
      </CardContent>
    </Card>
  );
};

export default SignInForm;
