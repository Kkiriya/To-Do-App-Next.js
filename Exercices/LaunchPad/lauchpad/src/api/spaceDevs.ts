import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const spaceDevs = axios.create({
  baseURL: process.env.SPACE_API || "https://lldev.thespacedevs.com/2.2.0",
  timeout: 100000,
});
