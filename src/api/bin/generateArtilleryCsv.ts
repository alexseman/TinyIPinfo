import {parse}                               from 'csv-parse';
import ipInt                                 from 'ip-to-int';
import {getChunked}                          from '../repository/userRepository';
import {createReadStream, createWriteStream} from 'fs';
import {arrayShuffle}                        from '../utils/utils';
import {cartesianProduct}                    from 'combinatorial-generators';
import 'dotenv/config';

const parser = parse({delimiter: ',', columns: true, relax_column_count: true});

const noOfIps: number      = 200;
const noOfVisitors: number = 100;

let ipsIndex: number = 0;
let ips: number[]    = [];
let users: string[]  = [];

const run = async () => {
  parser.on('readable', () => {
    let record;

    while ((record = parser.read()) !== null) {
      const startIp: number = ipInt(record.start_ip).toInt();
      const endIp: number   = ipInt(record.end_ip).toInt();

      for (let i = startIp; i <= endIp && ipsIndex < noOfIps; i++) {
        ips.push(ipInt(i).toIP());
        ipsIndex++;
      }

      if (ipsIndex >= noOfIps) {
        parser.emit('finish');
        break;
      }
    }
  });

  createReadStream(`${process.env.IPINFO_DB_PATH}/dataset.csv`).pipe(parser).on('finish', async () => {
    users              = arrayShuffle((await getChunked(['token'], noOfVisitors, 0)).map((u) => u!.token));
    ips                = arrayShuffle(ips);
    const toBeInserted = arrayShuffle([...cartesianProduct(ips, users)]);
    const writeStream  = createWriteStream(`${process.env.IPINFO_DB_PATH}/artillery.csv`);

    writeStream.write('ip,token\n', 'utf8');
    for (const insertable of toBeInserted) {
      writeStream.write(insertable.join(',') + '\n', 'utf8');
    }
  });
}

run();
