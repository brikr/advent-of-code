import {MapWithDefault} from './../../utils/mapWithDefault';

export class IntcodeComputer {
  private data = new MapWithDefault<number, number>(0);
  private highestAddress = 0;
  private originalProgram = '';
  pc = 0;
  halted = false;

  debug = false;

  private instructionMap: {[key: number]: () => void} = {
    1: this.addFromData,
    2: this.multiplyFromData,
    99: this.halt,
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
    this.halted = false;
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
    while (!this.halted) {
      this.log('executing instruction at', this.pc);
      this.runNextInstruction();
    }
    this.log('halted');
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

  // INTERNAL HELPER FUNCTIONS

  private log(...args: unknown[]) {
    if (this.debug) {
      console.log('intcode:', ...args);
    }
  }

  // INTERNAL PROGRAM EXECUTION FUNCTIONS

  private runNextInstruction() {
    const opcode = this.data.get(this.pc);
    const fn = this.instructionMap[opcode].bind(this);
    this.log(`executing ${opcode}, pc=${this.pc}`);
    if (!fn) {
      throw new Error(`Invalid opcode ${opcode} at address ${this.pc}`);
    }
    fn();
  }

  private addFromData() {
    const operand1Addr = this.readData(this.pc + 1);
    const operand2Addr = this.readData(this.pc + 2);
    const operand1 = this.readData(operand1Addr);
    const operand2 = this.readData(operand2Addr);
    const sumAddr = this.readData(this.pc + 3);
    const sum = operand1 + operand2;
    this.writeData(sumAddr, sum);
    this.pc += 4;
  }

  private multiplyFromData() {
    const operand1Addr = this.readData(this.pc + 1);
    const operand2Addr = this.readData(this.pc + 2);
    const operand1 = this.readData(operand1Addr);
    const operand2 = this.readData(operand2Addr);
    const productAddr = this.readData(this.pc + 3);
    const product = operand1 * operand2;
    this.writeData(productAddr, product);
    this.pc += 4;
  }

  private halt() {
    this.halted = true;
  }
}
