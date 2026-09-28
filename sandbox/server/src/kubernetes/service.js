
import { k8sApi } from "./config.js";

// Service = metadata + spec
export const createService = async (sandboxId) => {
  const serviceManifest = {
    metadata: {
      name: `sandbox-service-${sandboxId}`,
      labels: {
        app: "sandbox",
        sandboxId: sandboxId
      }
    },
    spec: {
      type: "ClusterIP",
      selector: {
        app: "sandbox",
        sandboxId: sandboxId
      },
      ports: [
        {
          port: 80,
          targetPort: 5173,
          protocol: "TCP",
          name: "http"
        }
      ]
    }
  };

  try {
    const response = await k8sApi.createNamespacedService({
      namespace: "default",
      body: serviceManifest
    });

    console.log("Created Service:", response);
    return response;
  } catch (err) {
    console.error("Error creating Service:", err);
    throw err;
  }
};