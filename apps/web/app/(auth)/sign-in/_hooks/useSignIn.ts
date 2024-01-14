import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login as loginApi } from "@/services/apiAuth";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface LoginData {
  email: string;
  password: string;
}
export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { isPending, mutate: login } = useMutation({
    mutationFn: ({ email, password }: LoginData) =>
      loginApi({ email, password }),
    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user);
      router.push("/", { scroll: false });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return { login, isPending };
}
