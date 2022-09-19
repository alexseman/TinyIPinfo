import axios from 'axios';

const queryIpInfo = (ip: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get(`${process.env.IPINFO_API_PATH}/ip/${ip}`, {
        headers: {
          'Authorization': `bearer ${process.env.IPINFO_API_TOKEN}`,
          'Accept': 'application/json'
        },
      });
      resolve(response.data);
    } catch (err: any) {
      if (err.response?.data && typeof err.response.data === 'object') {
        reject(err.response.data);
      }

      reject({status: err.response.status, message: err.message});
    }
  });
};

export default queryIpInfo;
