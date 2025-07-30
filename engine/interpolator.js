function interpolate(str, context) {
  return str.replace(/\{\{\s*(.+?)\s*\}\}/g, (_, expr) => {
    const fn = new Function('context', `with(context) { return ${expr}; }`);
    try {
      return fn(context);
    } catch {
      return '';
    }
  });
}

function interpolateObject(obj, context) {
  if (typeof obj === 'string') return interpolate(obj, context);
  if (Array.isArray(obj)) return obj.map(o => interpolateObject(o, context));
  if (obj && typeof obj === 'object') {
    const res = {};
    for (const k in obj) res[k] = interpolateObject(obj[k], context);
    return res;
  }
  return obj;
}

module.exports = { interpolate, interpolateObject };
