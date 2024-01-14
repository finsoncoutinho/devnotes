import { extractErrorMessage } from "@/lib/utils";
import Axios from "./Axios";
interface LoginData {
  email: string;
  password: string;
}

const login = async ({ email, password }: LoginData): Promise<void> => {
  try {
    const response = await Axios({
      method: "post",
      url: "/users/login",
      data: { email, password },
    });

    return response.data.data.user;
  } catch (error: any) {
    const errorMessage = extractErrorMessage(error.response.data);
    throw new Error(errorMessage);
  }
};

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
}

const register = async ({
  fullName,
  email,
  password,
}: RegisterData): Promise<void> => {
  try {
    const response = await Axios({
      method: "post",
      url: "/users/register",
      data: { fullName, email, password },
    });

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractErrorMessage(error.response.data);
    throw new Error(errorMessage);
  }
};

export { login, register };
