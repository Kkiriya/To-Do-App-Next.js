import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const spaceDevs = axios.create({
  baseURL: process.env.SPACE_API || "http://ldev.tesspacedevs.com/2.2.0",
  timeout: 100000,
});

