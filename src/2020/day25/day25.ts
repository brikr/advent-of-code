import {fileLines} from '../../utils/file';

function applyLoop(subject: number, current = 1): number {
  return (current * subject) % 2020_12_27;
}

function findLoop(publicKey: number, subject = 7): number {
  let count = 0;
  let current = 1;
  while (current !== publicKey) {
    current = applyLoop(subject, current);
    // console.log(count, current);
    count++;
  }

  return count;
}

function part1(): number {
  const [doorPubKey, cardPubKey] = fileLines('src/2020/day25/input.txt').map(
    Number
  );

  // console.log(doorPubKey, cardPubKey);

  const doorLoop = findLoop(doorPubKey);
  // const cardLoop = findLoop(cardPubKey);

  let encryptionKey = 1;
  for (let i = 0; i < doorLoop; i++) {
    encryptionKey = applyLoop(cardPubKey, encryptionKey);
  }

  return encryptionKey;
}

console.log('Part 1:');
console.log(part1());
