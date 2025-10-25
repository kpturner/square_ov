import config from 'config';
import bcrypt from 'bcrypt';

console.log('Generating password for: ', process.argv[2]);

const unencoded = bcrypt.hashSync(process.argv[2], config.get('saltRounds'));
console.log('Unencoded', unencoded);
console.log('Encoded:');
const encoded = Buffer.from(unencoded).toString('base64');
console.log(encoded);
console.log('Test decoded:', Buffer.from(encoded, 'base64').toString('utf-8'));
