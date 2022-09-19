import IpInfoRequest from '../types/IpInfoRequest';

export const generateRandomBetween = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min)
};

export const parseCacheArrayResponseToKeyValueObject = (toBeParsed: []): {} => {
  let respObject = {};
  for (let i = 0; i < toBeParsed.length; i += 2) {
    try {
      respObject[toBeParsed[i]] = toBeParsed[i + 1];
    } catch (err) {
      // TODO: log missing key value
      break;
    }
  }

  return respObject;
};

export const extractToken = (requestObject: IpInfoRequest): string | null => {
  if (!! requestObject.query.token) {
    return requestObject.query.token as string;
  }

  const authHeader = requestObject.header('Authorization');

  if (typeof authHeader == 'undefined') {
    return null;
  }

  const headerParts = authHeader.split(' ');

  if (headerParts.length !== 2) {
    return null;
  }

  // @ts-ignore
  if ((headerParts.shift()).toLowerCase() !== 'bearer') {
    return null;
  }

  return headerParts.pop() as string;
};

export const arrayShuffle = (toBeShuffled: any[]): any[] => {
  if (! Array.isArray(toBeShuffled)) {
    throw new TypeError(`Expected an array, got ${typeof toBeShuffled}`);
  }

  if (toBeShuffled.length === 0) {
    return [];
  }

  toBeShuffled = [...toBeShuffled];

  for (let index = toBeShuffled.length - 1; index > 0; index--) {
    const newIndex                                = Math.floor(Math.random() * (index + 1));
    [toBeShuffled[index], toBeShuffled[newIndex]] = [toBeShuffled[newIndex], toBeShuffled[index]];
  }

  return toBeShuffled;
}

export const week  = 604800;
export const month = 2629800;
