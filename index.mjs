import { randomBytes } from 'crypto';
import { createReadStream, createWriteStream } from 'fs';
import { writeFile } from 'fs/promises';
import { createServer } from 'http';
import path from 'path';
import { pipeline } from 'stream';

const server = createServer();

server.on('listening', () => console.log('Server started at http://localhost:4000'));

server.on('request', (req, res) => {
  if (req.url === '/') {
    pipeline(createReadStream('./index.html'), res, () => res.end());
    return;
  }

  if (req.url === '/upload') {
    const chunks = [];

    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    req.on('end', async () => {
      if (!req.headers) return;

      const { filename } = req.headers;

      const id = randomBytes(3).toString('hex');

      const buff = Buffer.concat(chunks);

      const [name, ext] = filename.split('.');

      const fullPath = path.join('./uploads', `${name}_${id}.${ext}`);

      await writeFile(fullPath, buff);

      res.end();
    });
  }
});

server.listen(4000);
