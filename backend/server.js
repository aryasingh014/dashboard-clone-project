const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");
const {
  OPCUAClient,
  SecurityPolicy,
  MessageSecurityMode,
  AttributeIds
} = require("node-opcua");

const app = express();
const port = 3001;

// OPC UA server endpoint
// const endpointUrl = "opc.tcp://DESKTOP-4IR561J:53530/OPCUA/SimulationServer";
// const endpointUrl ="opc.tcp://SUGAVANESH:53530/OPCUA/SimulationServer";
const endpointUrl ="opc.tcp://Aryasingh:53530/OPCUA/SimulationServer";
// Node IDs to monitor
const nodeIdsToRead = [
  "ns=3;i=1001",
  "ns=3;i=1002",
  "ns=3;i=1003",
  "ns=3;i=1004",
  "ns=3;i=1005",
  "ns=3;i=1006",
  "ns=3;i=1007"
];

app.use(cors());

// Create OPC UA client
const client = OPCUAClient.create({
  endpointMustExist: false,
  securityMode: MessageSecurityMode.None,
  securityPolicy: SecurityPolicy.None,
});

let session = null;

// WebSocket setup
const wss = new WebSocket.Server({ noServer: true });

// Function to browse OPC UA nodes
async function browseFromNode(nodeId) {
  try {
    const browseResult = await session.browse(nodeId);
    console.log(`🔍 Browsing node: ${nodeId}`);
    browseResult.references.forEach((reference) => {
      console.log("📂", reference.browseName.toString(), "-", reference.nodeId.toString());
    });
  } catch (error) {
    console.error(`❌ Error browsing node ${nodeId}:`, error.message);
  }
}

// Connect and start OPC UA session
async function connectToOPCServer() {
  try {
    console.log(`🔌 Connecting to OPC UA Server at ${endpointUrl}`);
    await client.connect(endpointUrl);
    console.log("✅ Connected to OPC UA Server");

    session = await client.createSession();
    console.log("✅ Session created successfully!");

    // Start browsing nodes
    await browseFromNode("RootFolder");
    await browseFromNode("ObjectsFolder");
    await browseFromNode("ns=3;s=85/0:Simulation");
    await browseFromNode("ns=3;s=Simulation");
  } catch (error) {
    console.error("❌ Error connecting to OPC UA server:", error.message);
  }
}

// Read OPC UA data from the configured node
async function readOPCUAData(nodeId) {
  try {
    if (!session) {
      console.log("⚠️ Session is not created yet.");
      return null;
    }

    const dataValue = await session.read({
      nodeId: nodeId,
      attributeId: AttributeIds.Value,
    });

    console.log(`📥 Read value from node ${nodeId}:`, dataValue.value.value);
    return dataValue.value.value;
  } catch (error) {
    console.error("❌ Error reading OPC UA data:", error.message);
    return null;
  }
}

// Broadcast data to connected WebSocket clients
function broadcastToClients(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ value: data }));
    }
  });
}

// Periodically read OPC UA data from all nodes and push it to WebSocket clients
async function startRealTimeUpdates() {
  setInterval(async () => {
    for (let nodeId of nodeIdsToRead) {
      const data = await readOPCUAData(nodeId);
      if (data !== null) {
        broadcastToClients({ nodeId, value: data });
      }
    }
  }, 1000); // Update every second
}

// WebSocket connection handling
wss.on("connection", (ws) => {
  console.log("🌐 New WebSocket connection");
  ws.on("message", (message) => {
    console.log("📩 Received message:", message);
  });
});

// Upgrade HTTP server to WebSocket
app.server = app.listen(port, () => {
  console.log(`🚀 Backend server running at http://localhost:${port}`);
});

app.server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

// Start the connection to OPC UA server and real-time updates
connectToOPCServer();
startRealTimeUpdates();
