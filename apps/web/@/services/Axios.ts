import axios from "axios";

const Axios = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1`,
});

export default Axios;
