import {times} from 'lodash';

export interface CLLNode<T> {
  data: T;
  next: CLLNode<T>;
  prev: CLLNode<T>;
}

export class CircularlyLinkedList<T> {
  head?: CLLNode<T>;
  length = 0;

  constructor(initialData?: T[]) {
    if (initialData) {
      for (const item of initialData) {
        this.append(item);
      }
    }
  }

  public getNodeArray(): CLLNode<T>[] {
    if (!this.head) {
      // empty
      return [];
    }

    const rval: CLLNode<T>[] = [this.head];
    let curr = this.head.next;
    while (curr !== this.head) {
      rval.push(curr);
      curr = curr.next;
    }
    return rval;
  }

  public getByIndex(idx: number): CLLNode<T> | undefined {
    if (!this.head) {
      return undefined;
    }
    const jumps = Math.abs(idx) % this.length;
    let curr = this.head;
    if (idx >= 0) {
      times(jumps, () => {
        curr = curr.next;
      });
    } else {
      times(jumps, () => {
        curr = curr.prev;
      });
    }
    return curr;
  }

  public append(item: T): CLLNode<T> {
    const node = {
      data: item,
    } as CLLNode<T>;

    return this.appendNode(node);
  }

  public appendNode(node: CLLNode<T>): CLLNode<T> {
    if (this.head) {
      // list already has elements
      node.next = this.head;
      node.prev = this.head.prev;
      this.head.prev.next = node;
      this.head.prev = node;
    } else {
      // initial add
      node.next = node;
      node.prev = node;
      this.head = node;
    }

    this.length++;

    return node;
  }

  public insertNodeAfter(newNode: CLLNode<T>, inList: CLLNode<T>): CLLNode<T> {
    newNode.next = inList.next;
    newNode.prev = inList;
    inList.next.prev = newNode;
    inList.next = newNode;
    this.length++;
    return newNode;
  }

  public insertNodeBefore(newNode: CLLNode<T>, inList: CLLNode<T>): CLLNode<T> {
    newNode.next = inList;
    newNode.prev = inList.prev;
    inList.prev.next = newNode;
    inList.prev = newNode;
    this.length++;
    return newNode;
  }

  public remove(node: CLLNode<T>): CLLNode<T> {
    node.prev.next = node.next;
    node.next.prev = node.prev;

    if (this.head === node) {
      // removing the head
      if (this.length === 1) {
        // removing the only element
        this.head = undefined;
      } else {
        this.head = node.next;
      }
    }

    this.length--;

    return node;
  }

  public moveHead(newHead: CLLNode<T>) {
    this.head = newHead;
  }
}
