
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
      volumes: [
        {
          name: "workspace-volume", // create a volume named "workspace_volume" in the pod spec
          emptyDir: {} // this volume will be an empty directory that can be used by the containers in the pod 
        }
      ],
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
          },
          volumeMounts: [
            {
              name: "workspace-volume", // mount the "workspace_volume" to the container at /workspace
              mountPath: "/workspace" // sync the volume with the container's filesystem at /workspace
            }
          ]

        },
        {
          image:"agent",
          imagePullPolicy: "IfNotPresent",
          name: "agent-container",
          ports:[{containerPort:3000,name:"http"}],
          resources: {
            limits: {
              cpu: "500m",
              memory: "1Gi"
            },
            requests: {
              cpu: "250m",
              memory: "500Mi"
            }
          },
          volumeMounts: [
            {
              name: "workspace-volume", // mount the "workspace_volume" to the container at /workspace
              mountPath: "/workspace" // sync the volume with the container's filesystem at /workspace
            }
          ]
        } // this is the agent container that will be created in the pod spec
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