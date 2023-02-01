import {repeat} from 'lodash';
import {getDigit} from '../../utils/math';
import {MapWithDefault} from './../../utils/mapWithDefault';

type ParamType = 'read' | 'write';
type ProgramStatus = 'not started' | 'running' | 'halted' | 'awaiting input';

interface InstructionPrototype {
  name: string;
  paramTypes: ParamType[];
  fn: (...params: number[]) => void | number;
}

export class IntcodeComputer {
  debug = false;

  private data = new MapWithDefault<number, number>(0);
  private highestAddress = 0;
  private originalProgram = '';
  private pc = 0;
  private status: ProgramStatus = 'not started';

  private inputBuffer: number[] = [];
  private outputBuffer: number[] = [];

  private instructionMap: {[key: number]: InstructionPrototype} = {
    1: {
      name: 'add',
      paramTypes: ['read', 'read', 'write'],
      fn: this.add,
    },
    2: {
      name: 'multiply',
      paramTypes: ['read', 'read', 'write'],
      fn: this.multiply,
    },
    3: {
      name: 'input',
      paramTypes: ['write'],
      fn: this.input,
    },
    4: {
      name: 'output',
      paramTypes: ['read'],
      fn: this.output,
    },
    5: {
      name: 'jump-if-true',
      paramTypes: ['read', 'read'],
      fn: this.jumpIfTrue,
    },
    6: {
      name: 'jump-if-false',
      paramTypes: ['read', 'read'],
      fn: this.jumpIfFalse,
    },
    7: {
      name: 'less than',
      paramTypes: ['read', 'read', 'write'],
      fn: this.lessThan,
    },
    8: {
      name: 'equals',
      paramTypes: ['read', 'read', 'write'],
      fn: this.equals,
    },
    99: {
      name: 'halt',
      paramTypes: [],
      fn: this.halt,
    },
  };

  constructor(program?: string) {
    this.reset();
    if (program) {
      this.loadProgram(program);
    }
  }

  // PUBLIC FUNCTIONS

  reset() {
    this.pc = 0;
    this.status = 'not started';
    this.loadProgram(this.originalProgram);
  }

  loadProgram(program: string) {
    this.originalProgram = program;
    const initialData = program.split(',').map(Number);
    for (const [idx, value] of initialData.entries()) {
      this.data.set(idx, value);
    }
    this.highestAddress = initialData.length - 1;
  }

  runProgram() {
    this.status = 'running';
    while (this.status === 'running') {
      this.log('executing instruction at', this.pc);
      this.logIndent();
      this.runNextInstruction();
      this.logDedent();
    }
    this.log('no longer running, status', this.status);
    if (this.outputBuffer.length > 0) {
      this.logIndent();
      this.log('current output buffer', this.outputBuffer.join(','));
      this.logDedent();
    }
  }

  readData(address: number): number {
    const value = this.data.get(address);
    this.log(`read ${value} from ${address}`);
    return value;
  }

  writeData(address: number, value: number) {
    this.log(`writing ${value} to ${address}`);
    this.data.set(address, value);
    if (address > this.highestAddress) {
      this.highestAddress = address;
    }
  }

  dumpData(): number[] {
    const rval: number[] = [];
    for (let i = 0; i < this.highestAddress; i++) {
      rval.push(this.data.get(i));
    }
    return rval;
  }

  pushInput(input: number) {
    this.inputBuffer.push(input);
  }

  takeOutput(): number | undefined {
    return this.outputBuffer.splice(0, 1)[0];
  }

  takeAllOutputs(): number[] {
    const allOutputs = this.outputBuffer;
    this.outputBuffer = [];
    return allOutputs;
  }

  // INTERNAL HELPER FUNCTIONS
  private logIndentCount = 0;

  private log(...args: unknown[]) {
    if (this.debug) {
      console.log('intcode:', repeat('  ', this.logIndentCount), ...args);
    }
  }

  private logIndent() {
    this.logIndentCount++;
  }

  private logDedent() {
    this.logIndentCount--;
  }

  // INTERNAL PROGRAM EXECUTION FUNCTIONS

  private runNextInstruction() {
    const opcode = this.data.get(this.pc);
    const instruction = this.instructionMap[opcode % 100];
    if (!instruction) {
      throw new Error(`Invalid opcode ${opcode} at address ${this.pc}`);
    }

    const params: number[] = [];
    let pcOffset = 0;
    for (const pType of instruction.paramTypes) {
      pcOffset++;
      if (pType === 'read') {
        const paramMode = getDigit(opcode, pcOffset + 1);
        this.log('param (read)', pcOffset, 'paramMode', paramMode);
        this.logIndent();
        if (paramMode === 0) {
          // position mode, read value at address
          const addr = this.readData(this.pc + pcOffset);
          const param = this.readData(addr);
          params.push(param);
        } else if (paramMode === 1) {
          // immediate mode, use value as is
          const param = this.readData(this.pc + pcOffset);
          params.push(param);
        } else {
          throw new Error(
            `Invalid param mode ${paramMode} for opcode ${opcode} at address ${this.pc}`
          );
        }
        this.logDedent();
      } else {
        // write params just pass through (they are always addresses)
        this.log('param (write)', pcOffset);
        this.logIndent();
        params.push(this.readData(this.pc + pcOffset));
        this.logDedent();
      }
    }
    this.log(
      `executing ${instruction.name}, pc=${
        this.pc
      }, opcode=${opcode}, params=${params.join(',')}`
    );
    const fn = instruction.fn.bind(this);
    fn(...params);
    this.pc += instruction.paramTypes.length + 1;
  }

  private add(a: number, b: number, resultAddr: number) {
    const sum = a + b;
    this.writeData(resultAddr, sum);
  }

  private multiply(a: number, b: number, resultAddr: number) {
    const product = a * b;
    this.writeData(resultAddr, product);
  }

  private input(addr: number) {
    const nextInput = this.inputBuffer.splice(0, 1)[0];

    if (nextInput === undefined) {
      // no inputs available, pause program
      this.status = 'awaiting input';
      // fix the program counter since runNextInstruction will bump it
      this.pc -= 2;
    } else {
      this.writeData(addr, nextInput);
    }
  }

  private output(value: number) {
    this.outputBuffer.push(value);
  }

  private jumpIfTrue(value: number, addr: number) {
    if (value !== 0) {
      // slightly offset the address since runNextInstruction will add 3
      this.pc = addr - 3;
    }
  }

  private jumpIfFalse(value: number, addr: number) {
    if (value === 0) {
      // slightly offset the address since runNextInstruction will add 3
      this.pc = addr - 3;
    }
  }

  private lessThan(a: number, b: number, resultAddr: number) {
    const result = a < b ? 1 : 0;
    this.writeData(resultAddr, result);
  }

  private equals(a: number, b: number, resultAddr: number) {
    const result = a === b ? 1 : 0;
    this.writeData(resultAddr, result);
  }

  private halt() {
    this.status = 'halted';
  }
}
