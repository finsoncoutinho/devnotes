import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "@/services/apiAuth";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface LoginData {
  email: string;
  password: string;
}
export function useSignIn() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { isPending, mutate: signIn } = useMutation({
    mutationFn: ({ email, password }: LoginData) => login({ email, password }),
    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user);
      router.replace("/", { scroll: false });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return { signIn, isPending };
}
