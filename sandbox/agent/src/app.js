import express from 'express';
import morgan from "morgan"
import fs from 'fs';
const server=express();

server.use(morgan("combined"));
const WORKING_DIR='/workspace'

server.get("/", (req, res) => {
  res.send("Hello, from the sandbox agent!");
});
server.get("/list-files", async (req, res) => {
    const elements=await fs.promises.readdir(WORKING_DIR);
    res.status(200).json({
        message: "Files in the working directory",
        files: elements
    });
});
export default server;