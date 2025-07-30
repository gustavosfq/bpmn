# BPMN Engine and Modeler

This project includes a simple BPMN engine written in Node.js and a minimalistic BPMN modeler in plain HTML/CSS/JS.

## Usage

1. Install dependencies
   ```bash
   npm install
   ```
2. Edit `data/sample-process.json` or create your own process with the modeler located in `ui/`.
3. Ensure MongoDB is running and `MONGO_URL` is configured if needed.
4. Execute the sample process
   ```bash
   node index.js
   ```
5. Open `ui/index.html` in a browser to build or edit diagrams.

The engine supports `startEvent`, `userTask`, `serviceTask`, `exclusiveGateway`, and `endEvent` nodes.
