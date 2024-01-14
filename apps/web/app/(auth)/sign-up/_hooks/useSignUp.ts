import { useMutation, useQueryClient } from "@tanstack/react-query";
import { register } from "@/services/apiAuth";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
}
export function useSignUp() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { isPending, mutate: signUp } = useMutation({
    mutationFn: ({ fullName, email, password }: RegisterData) =>
      register({ fullName, email, password }),
    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user);
      toast.success("Account created succesfully!!");
      router.replace("/", { scroll: false });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return { signUp, isPending };
}
