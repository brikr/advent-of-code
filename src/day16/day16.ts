import {max, min, sum} from 'lodash';
import {fileMapSync} from '../utils/file';
import {printSolution} from '../utils/printSolution';

const hex2Bin = {
  '0': '0000',
  '1': '0001',
  '2': '0010',
  '3': '0011',
  '4': '0100',
  '5': '0101',
  '6': '0110',
  '7': '0111',
  '8': '1000',
  '9': '1001',
  A: '1010',
  B: '1011',
  C: '1100',
  D: '1101',
  E: '1110',
  F: '1111',
};

type Bit = '0' | '1';

enum PacketType {
  SUM = 'SUM',
  PRODUCT = 'PRODUCT',
  MINIMUM = 'MINIMUM',
  MAXIMUM = 'MAXIMUM',
  LITERAL = 'LITERAL',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  EQUAL_TO = 'EQUAL_TO',
}

enum LengthType {
  BIT_COUNT = '0',
  PACKET_COUNT = '1',
}

const typeIdToType: {[id: number]: PacketType} = {
  0: PacketType.SUM,
  1: PacketType.PRODUCT,
  2: PacketType.MINIMUM,
  3: PacketType.MAXIMUM,
  4: PacketType.LITERAL,
  5: PacketType.GREATER_THAN,
  6: PacketType.LESS_THAN,
  7: PacketType.EQUAL_TO,
};

interface Packet {
  version: number;
  type: PacketType;
}

interface LiteralPacket extends Packet {
  type: PacketType.LITERAL;
  value: number;
}

interface OperatorPacket extends Packet {
  operands: Packet[];
}

interface Pointer {
  value: number;
}

function parseNum(bits: Bit[]): number {
  return parseInt(bits.join(''), 2);
}

function isOperator(packet: Packet): packet is OperatorPacket {
  return packet.type !== PacketType.LITERAL;
}

function isLiteral(packet: Packet): packet is LiteralPacket {
  return packet.type === PacketType.LITERAL;
}

function parse(bits: Bit[], pointer: Pointer = {value: 0}): Packet {
  // console.log('reading a packet', pointer);
  // let pointer = 0;
  // first 3 bits are version
  const version = parseNum(bits.slice(pointer.value, (pointer.value += 3)));
  // next 3 are type
  const typeId = parseNum(bits.slice(pointer.value, (pointer.value += 3)));
  let type: PacketType;
  if (typeIdToType[typeId] !== undefined) {
    type = typeIdToType[typeId];
  } else {
    throw 'WTF';
  }

  const packet = {version, type};

  switch (type) {
    case PacketType.LITERAL: {
      const valueBits: Bit[] = [];
      while (bits[pointer.value] !== '0') {
        // read in four bits and add to valueBits
        valueBits.push(...bits.slice(pointer.value + 1, (pointer.value += 5)));
      }
      // read in the last nibble
      valueBits.push(...bits.slice(pointer.value + 1, (pointer.value += 5)));

      // console.log('  literal packet', valueBits.join(''));
      (packet as LiteralPacket).value = parseNum(valueBits);

      break;
    }
    default: {
      // operator packet
      const lengthType = bits[pointer.value++] as LengthType;
      const children: Packet[] = [];
      switch (lengthType) {
        case LengthType.BIT_COUNT: {
          const bitCount = parseNum(
            bits.slice(pointer.value, (pointer.value += 15))
          );
          const endOfPacket = pointer.value + bitCount;
          // console.log('  operator packet; bit-count', bitCount);
          while (pointer.value < endOfPacket) {
            children.push(parse(bits, pointer));
          }
          break;
        }
        case LengthType.PACKET_COUNT: {
          const packetCount = parseNum(
            bits.slice(pointer.value, (pointer.value += 11))
          );
          // console.log('  operator packet; packet-count', packetCount);
          while (children.length < packetCount) {
            children.push(parse(bits, pointer));
          }
          break;
        }
      }
      (packet as OperatorPacket).operands = children;
      break;
    }
  }

  return packet;
}

function getVersionSum(packet: Packet): number {
  const selfAndChildren = [packet.version];
  if (isOperator(packet)) {
    selfAndChildren.push(...packet.operands.map(getVersionSum));
  }
  return sum(selfAndChildren);
}

function part1(bits: Bit[]): number {
  const packet = parse(bits);
  // console.log(JSON.stringify(packet, null, 2));

  return getVersionSum(packet);
}

function operate(packet: Packet): number {
  // console.log('operating on packet', packet.version, packet.type);

  let result;

  if (isLiteral(packet)) {
    result = packet.value;
  } else if (isOperator(packet)) {
    const children = packet.operands.map(operate);
    switch (packet.type) {
      case PacketType.SUM: {
        result = sum(children);
        break;
      }
      case PacketType.PRODUCT: {
        result = children.reduce((acc, cur) => acc * cur);
        break;
      }
      case PacketType.MINIMUM: {
        result = min(children);
        break;
      }
      case PacketType.MAXIMUM: {
        result = max(children);
        break;
      }
      case PacketType.GREATER_THAN: {
        const [a, b] = children;
        result = a > b ? 1 : 0;
        break;
      }
      case PacketType.LESS_THAN: {
        const [a, b] = children;
        result = a < b ? 1 : 0;
        break;
      }
      case PacketType.EQUAL_TO: {
        const [a, b] = children;
        result = a === b ? 1 : 0;
        break;
      }
    }
  }

  if (result === undefined) {
    throw 'wtf';
  }

  // console.log('  result is', result);
  return result;
}

function part2(bits: Bit[]): number {
  const packet = parse(bits);
  // console.log(JSON.stringify(packet, null, 2));
  return operate(packet);
}

const lines = fileMapSync(
  'src/day16/input.txt',
  line =>
    line
      .split('')
      .map(char => hex2Bin[char as keyof typeof hex2Bin])
      .join('')
      .split('') as Bit[]
);

printSolution(part1(lines[0]), part2(lines[0]));
