const fs = require('fs');
const BpmnEngine = require('./engine/BpmnEngine');
const db = require('./db/mongo');

async function main() {
  await db.connect().catch(e => console.error('DB error', e));
  const def = JSON.parse(fs.readFileSync('./data/sample-process.json'));
  const engine = new BpmnEngine(def, db);
  const context = { userId: 'user123' };
  const result = await engine.run(context);
  console.log('Process finished:', result);
  process.exit(0);
}

main();
