let env = process.env.NODE_ENV;

if (!env) {
  env = 'staging';
}

module.exports = env;
