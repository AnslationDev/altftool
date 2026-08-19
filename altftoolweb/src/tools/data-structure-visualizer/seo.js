const seo = {
  title: "Data Structure Visualizer: Stack/Queue/Tree/List",
  metaDescription:
    "Build an array, stack, queue, linked list or binary tree box by box, with TOP, FRONT and REAR labels and each structure's own O(1) or O(n) costs.",
  steps: [
    "Pick Array, Stack, Queue, Linked List or Tree from the row of buttons above the panel.",
    "For the first four, type into the Push value or Enqueue value box and use the plus button to add an element and the minus button to remove one; for Tree, type comma-separated numbers such as 10, 5, 15, 2, 7, 12, 20 into Tree Values (comma separated).",
    "Watch TOP mark the stack's last element and FRONT and REAR mark the queue's ends, while the Operations panel switches to that structure's costs - Push O(1), linked-list Append O(n).",
  ],
  intro:
    "The Data Structure Visualizer draws five core data structures — array, stack, queue, linked list and binary tree — as labelled boxes you can add to and remove from, so the effect of each operation is visible immediately. Stacks mark the TOP element, queues mark FRONT and REAR, linked list nodes are joined by arrows, and tree values entered comma-separated are laid out level by level with 1, 2, 4, 8 nodes per row. Each structure also shows the time complexity of its own operations, so you can see why pushing to a stack is O(1) while appending to a linked list is O(n).",
  useCases: [
    "Studying for a data structures exam and needing to see why removing from a queue takes the FRONT element while removing from a stack takes the TOP one.",
    "Explaining LIFO versus FIFO to someone new to programming by pushing and popping values live rather than drawing boxes on a whiteboard.",
    "Checking your mental model of a binary tree by typing values like 10, 5, 15, 2, 7, 12, 20 and watching them fill the root, then two children, then four grandchildren.",
  ],
  benefits: [
    [
      "Position labels, not just boxes",
      "TOP, FRONT and REAR markers appear on the actual elements, so the difference between the two ends of a queue is shown rather than described.",
    ],
    [
      "Complexity shown alongside the structure",
      "Switching to a linked list swaps the operations panel to that structure's costs — prepend O(1), append O(n), delete O(n) — instead of a generic cheat sheet.",
    ],
    [
      "Level-order tree layout",
      "Comma-separated values are packed into levels of 2^n nodes, which is exactly how an array-backed binary heap or complete binary tree is indexed.",
    ],
  ],
  faqs: [
    [
      "Which data structures does this visualizer support?",
      "Five: array, stack, queue, linked list and binary tree. Arrays, stacks, queues and linked lists are built interactively with add and remove buttons; the tree is built by typing comma-separated values that fill each level in order.",
    ],
    [
      "What is the difference between a stack and a queue?",
      "A stack is LIFO — the last element pushed is the first popped, both O(1) at the TOP. A queue is FIFO — enqueue adds at the REAR and dequeue removes from the FRONT, also O(1) each — which is why the visualizer labels the two ends of a queue but only one end of a stack.",
    ],
    [
      "Why is array access O(1) but array insert O(n)?",
      "Access is O(1) because an index maps straight to a memory offset, so no scanning is needed. Insert and delete are O(n) because every element after the touched position has to shift by one slot, and searching an unsorted array is O(n) for the same scanning reason.",
    ],
    [
      "How are the tree values arranged?",
      "In level order: the first value becomes the root, the next two become level two, the next four level three, doubling each level as 2^n. That is the same layout as an array-backed complete binary tree, where the children of index i sit at 2i+1 and 2i+2.",
    ],
  ],
};

export default seo;
