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
const agentProxies={}
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
function getAgentProxy(sandboxId){
  const target = `http://sandbox-service-${sandboxId}:3000`;

  if(!agentProxies[sandboxId]){
    agentProxies[sandboxId] = createProxyMiddleware({
      target,
      changeOrigin: true,
      ws: true,
    });
  }

  return agentProxies[sandboxId];
}
server.use((req, res, next) => {
  const host = req.headers.host;

  if (!host) {
    return res.status(400).json({
      message: "Host header is missing",
    });
  }

  const parts = host.split(".");
  const sandboxId = parts[0];
  const type = parts[1];

  if (type === "agent") {
    return getAgentProxy(sandboxId)(req, res, next);
  }

  if (type === "preview") {
    return getProxy(sandboxId)(req, res, next);
  }

  return res.status(404).json({
    message: "Invalid sandbox host",
  });
});

export default server;