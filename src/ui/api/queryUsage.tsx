import axios       from 'axios';
import UsageResult from '../types/UsageResult';

const queryUsage = (from: number, to: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get(`${process.env.IPINFO_API_PATH}/user-requests`, {
        params: {
          from,
          to
        },
        headers: {
          'Accept': 'application/json'
        },
      });
      resolve(response.data as UsageResult[]);
    } catch (err: any) {
      if (err.response?.data && typeof err.response.data === 'object') {
        reject(err.response.data);
      }

      reject({status: err.response.status, message: err.message});
    }
  });
};

export default queryUsage;
