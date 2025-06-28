const { override } = require('customize-cra');
const path = require('path');

module.exports = override(
  (config) => {
    // Find the oneOf rule which contains the babel-loader for JS/TS files
    const oneOfRule = config.module.rules.find(rule => rule.oneOf);
    if (oneOfRule) {
      // Find the babel-loader rule inside oneOf that handles .ts/.tsx files
      const babelLoaderRule = oneOfRule.oneOf.find(rule =>
        rule.loader && rule.loader.includes('babel-loader') && rule.test && rule.test.toString().includes('ts|tsx')
      );

      if (babelLoaderRule) {
        // Ensure include is an array and add our package path
        if (!Array.isArray(babelLoaderRule.include)) {
          babelLoaderRule.include = [babelLoaderRule.include];
        }
        babelLoaderRule.include.push(path.resolve(__dirname, 'packages/fast-auth-with-keycloak'));
      }
    }

    return config;
  }
); 