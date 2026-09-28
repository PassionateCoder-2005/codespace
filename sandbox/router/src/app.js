import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import morgan from "morgan";

const server = express();

server.use(morgan("combined"));

server.get("/api/status/healthz", (req, res) => {
  return res.status(200).json({
    message: "Router is healthy",
  });
});

server.get("/api/status/readyz", (req, res) => {
  return res.status(200).json({
    message: "Router is ready",
  });
});
const proxies={}
function getProxy(sandboxId){
  const target = `http://sandbox-service-${sandboxId}:80`; // changes

    if(!proxies[sandboxId]){
        proxies[sandboxId] = createProxyMiddleware({
            target,
            changeOrigin: true,
            ws: true,
        });
    }
    return proxies[sandboxId];
}

server.use((req, res, next) => {
  const host = req.headers.host;

  if (!host) {
    return res.status(400).json({
      message: "Host header is missing",
    });
  }

  const sandboxId = host.split(".")[0];


 return getProxy(sandboxId)(req, res, next);
});

export default server;