import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const rootConfig = require('../../eslint.config.js');

export default [
  ...rootConfig,
  {
    languageOptions: {
      sourceType: 'module',
    },
  },
  {
    ignores: ['dist/'],
  },
];
