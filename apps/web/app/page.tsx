import Header from "@/components/Header";
import { FC } from "react";

interface pageProps {}

const page: FC<pageProps> = ({}) => {
  return (
    <div>
      <Header />
      Welcome to devnotes
    </div>
  );
};

export default page;
