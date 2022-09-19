import {ipV4Regex}    from './ipAddressValidator';
import {latLongRegex} from './latLongValidator';
import Ajv            from 'ajv';

const ajv                = new Ajv();
const regexToString      = (regex) => regex.toString().replace(/^\/|\/$/g, '');
const ipV4RegexString    = regexToString(ipV4Regex);
const latLongRegexString = regexToString(latLongRegex);

const importSchema = {
  type: 'object',
  properties: {
    start_ip: {
      type: 'string',
      pattern: ipV4RegexString
    },
    end_ip: {
      type: 'string',
      pattern: ipV4RegexString
    },
    join_key: {
      type: 'string',
      pattern: ipV4RegexString
    },
    city: {
      type: 'string'
    },
    region: {
      type: 'string'
    },
    country: {
      type: 'string'
    },
    latitude: {
      type: 'string',
      pattern: latLongRegexString
    },
    longitude: {
      type: 'string',
      pattern: latLongRegexString
    },
    postal_code: {
      type: 'string'
    },
    timezone: {
      type: 'string'
    }
  },
  required: ['start_ip', 'end_ip', 'country'],
  additionalProperties: false
};

const validator         = ajv.compile(importSchema);
const isValidImportable = (importable) => {
  return {
    valid: validator(importable),
    errors: validator.errors
  }
}

export default isValidImportable;
