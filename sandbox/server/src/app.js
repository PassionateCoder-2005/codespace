import express from "express"
import { v7 as uuid } from "uuid"
import { createPod } from "./kubernetes/pod.js";
import { createService } from "./kubernetes/service.js";
const server=express();
server.use(express.json());
server.get("/api/sandbox/health",async (req,res) => {
      return res.status(200).json({
        message:"Sandbox is healthy"
      })
})
server.post("/api/sandbox/start",async (req,res) => {
   const sandboxId=uuid();
   await Promise.all([
    createPod(sandboxId),
    createService(sandboxId)
   ])
   return res.status(201).json({
    message:"sandbox enviornment created sucessfully",
    sandboxId,
    previewUrl:`http://${sandboxId}.preview.localhost`
   })
})

export default server