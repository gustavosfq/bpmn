function safeEval(expr, context) {
  try {
    const fn = new Function('context', `return (${expr})`);
    return fn(context);
  } catch (err) {
    console.error('Eval error:', err);
    return false;
  }
}

module.exports = { safeEval };
