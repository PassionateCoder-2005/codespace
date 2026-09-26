import express from "express"
const server=express();
server.use(express.json());
server.get("/api/sandbox/health",async (req,res) => {
      return res.status(200).json({
        message:"Sandbox is healthy"
      })
})
export default server