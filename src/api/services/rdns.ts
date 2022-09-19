import {promises} from 'dns';

const rDnsLookup = async (ip) => {
  try {
    const records = await promises.reverse(ip);
    return {hostname: records[0]};
  } catch (err) {
    return {hostname: `${ip} has no PTR record`};
  }
}

export default rDnsLookup;
