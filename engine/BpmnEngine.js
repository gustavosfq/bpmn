const axios = require('axios');
const { safeEval } = require('./evaluators');
const { interpolate, interpolateObject } = require('./interpolator');

class BpmnEngine {
  constructor(definition, db) {
    this.definition = definition;
    this.db = db;
    this.elements = {};
    for (const el of definition.elements) {
      this.elements[el.id] = el;
    }
  }

  findFlows(fromId) {
    return this.definition.flows.filter(f => f.from === fromId);
  }

  async run(context = {}) {
    let current = this.definition.elements.find(e => e.type === 'startEvent');
    while (current) {
      context._last = current.id;
      switch (current.type) {
        case 'startEvent':
          break;
        case 'userTask':
          await this.handleUserTask(current, context);
          break;
        case 'serviceTask':
          await this.handleServiceTask(current, context);
          break;
        case 'exclusiveGateway':
          current = await this.nextGateway(current, context);
          continue; // skip default flow resolution later
      }
      const next = await this.next(current, context);
      current = next;
    }
    if (this.db) {
      await this.db.saveHistory('processHistory', context);
    }
    return context;
  }

  async nextGateway(gateway, context) {
    const flows = this.findFlows(gateway.id);
    for (const flow of flows) {
      if (!flow.condition || safeEval(flow.condition, context)) {
        return this.elements[flow.to];
      }
    }
    return null;
  }

  async next(element, context) {
    if (element.type === 'endEvent') return null;
    const flows = this.findFlows(element.id);
    for (const flow of flows) {
      if (!flow.condition || safeEval(flow.condition, context)) {
        return this.elements[flow.to];
      }
    }
    return null;
  }

  async handleUserTask(task, context) {
    const result = {};
    if (Array.isArray(task.form)) {
      for (const field of task.form) {
        if (field.mock) {
          result[field.field] = field.mockValue || true;
        } else {
          // simple stdin prompt
          result[field.field] = await this.prompt(field.label || field.field);
        }
      }
    }
    context[task.id] = result;
  }

  async prompt(label) {
    return new Promise(resolve => {
      process.stdout.write(`${label}: `);
      process.stdin.once('data', d => resolve(d.toString().trim()));
    });
  }

  async handleServiceTask(task, context) {
    if (task.service === 'http') {
      const url = interpolate(task.url, context);
      const opts = { method: task.method || 'GET', url };
      if (task.body) opts.data = interpolateObject(task.body, context);
      const res = await axios(opts).catch(err => ({ data: err.message }));
      context[task.id] = res.data;
      if (task.saveTo) context[task.saveTo] = res.data;
      if (task.map) Object.assign(context, interpolateObject(task.map, res.data));
    } else if (task.service === 'db' && this.db) {
      await this.db.insert(task.collection, context);
      context[task.id] = 'inserted';
    }
  }
}

module.exports = BpmnEngine;
