
import { k8sApi } from "./config.js";

// Pod = metadata + spec
export const createPod = async (sandboxId) => {
  const podManifest = {
    metadata: {
      name: `sandbox-pod-${sandboxId}`,
      labels: {
        app: "sandbox",
        sandboxId: String(sandboxId)
      }
    },
    spec: {
      containers: [
        {
          image: "template",
          imagePullPolicy: "IfNotPresent",
          name: "sandbox-container",
          ports: [
            { containerPort: 5173, name: "http" }
          ],
          resources: {
            limits: {
              cpu: "500m",
              memory: "1Gi"
            },
            requests: {
              cpu: "250m",
              memory: "500Mi"
            }
          }
        }
      ]
    }
  };

  try {
    const response = await k8sApi.createNamespacedPod({
      namespace: "default",
      body: podManifest
    });

    console.log("Created Pod:", response);
    return response;
  } catch (err) {
    console.error("Error creating Pod:", err);
    throw err;
  }
}; 