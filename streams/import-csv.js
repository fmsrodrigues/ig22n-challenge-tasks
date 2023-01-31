import fs from 'node:fs';
import { parse } from 'csv';

const csv = new URL('./tasks.csv', import.meta.url);

const stream = fs.createReadStream(csv);

const parser = parse({
  delimiter: ',',
  fromLine: 2,
  skipEmptyLines: true,
})

async function main() {
  const lines = stream.pipe(parser);

  for await (const line of lines) {
    const [title, description] = line;

    fetch('http://localhost:3333/tasks', {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title, description
      })
    })
  }
}

main();