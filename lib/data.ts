import {
  BarChart3,
  Binary,
  Boxes,
  HandCoins,
  Layers,
  Puzzle,
  Search,
  Share2,
  Sigma,
  Type,
  type LucideIcon,
} from "lucide-react";

export interface Algorithm {
  slug: string;
  name: string;
  summary: string;
  time: string;
  space: string;
  /** C source shown in the code viewer (`<slug>.c`). */
  code: string;
  /**
   * Language-neutral pseudocode for the same algorithm, **line for line** with
   * `code`: line i of one explains line i of the other. That alignment is what
   * lets a single `codeLine` from a step generator highlight either view, with
   * no second mapping to keep in sync — and `npm test` enforces it.
   */
  pseudo: string;
  /** When set, the workspace lets the user enter their own numbers. */
  inputKind?: "array" | "array-target";
  /** Input is auto-sorted before display (e.g. Binary Search). */
  sortedInput?: boolean;
}

export interface Category {
  slug: string;
  name: string;
  tagline: string;
  icon: LucideIcon;
  algorithms: Algorithm[];
}

export const categories: Category[] = [
  {
    slug: "sorting",
    name: "Sorting",
    tagline: "Ordering data step by step",
    icon: BarChart3,
    algorithms: [
      {
        slug: "bubble-sort",
        name: "Bubble Sort",
        summary:
          "Repeatedly swaps adjacent elements that are out of order, bubbling the largest value to the end on each pass.",
        time: "O(n²)",
        space: "O(1)",
        inputKind: "array",
        code: `void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int swapped = 0;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int tmp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = tmp;
                swapped = 1;
            }
        }
        if (!swapped) break;
    }
}`,
        pseudo: `procedure BubbleSort(A, n)
    for i ← 0 to n-2
        swapped ← false
        for j ← 0 to n-i-2
            if A[j] > A[j+1]
                tmp ← A[j]
                A[j] ← A[j+1]
                A[j+1] ← tmp
                swapped ← true
            end if
        end for
        if not swapped then break        ▸ already sorted
    end for
end procedure`,
      },
      {
        slug: "selection-sort",
        name: "Selection Sort",
        summary:
          "Scans the unsorted part for the smallest element and swaps it into the next position of the sorted prefix.",
        time: "O(n²)",
        space: "O(1)",
        inputKind: "array",
        code: `void selectionSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int min = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[min]) min = j;
        }
        if (min != i) {
            int tmp = arr[i];
            arr[i] = arr[min];
            arr[min] = tmp;
        }
    }
}`,
        pseudo: `procedure SelectionSort(A, n)
    for i ← 0 to n-2
        min ← i
        for j ← i+1 to n-1
            if A[j] < A[min] then min ← j
        end for
        if min ≠ i
            tmp ← A[i]
            A[i] ← A[min]
            A[min] ← tmp
        end if
    end for
end procedure`,
      },
      {
        slug: "insertion-sort",
        name: "Insertion Sort",
        summary:
          "Grows a sorted prefix one element at a time, shifting larger values right until the new element fits.",
        time: "O(n²)",
        space: "O(1)",
        inputKind: "array",
        code: `void insertionSort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`,
        pseudo: `procedure InsertionSort(A, n)
    for i ← 1 to n-1
        key ← A[i]                       ▸ lift it out
        j ← i-1
        while j ≥ 0 and A[j] > key
            A[j+1] ← A[j]                ▸ shift right
            j ← j-1
        end while
        A[j+1] ← key                     ▸ drop it in
    end for
end procedure`,
      },
      {
        slug: "shell-sort",
        name: "Shell Sort",
        summary:
          "Insertion sort over shrinking gaps: distant elements move first, so the final pass has little work left.",
        time: "O(n log² n)",
        space: "O(1)",
        inputKind: "array",
        code: `void shellSort(int arr[], int n) {
    for (int gap = n / 2; gap > 0; gap /= 2) {
        for (int i = gap; i < n; i++) {
            int key = arr[i];
            int j = i;
            while (j >= gap && arr[j - gap] > key) {
                arr[j] = arr[j - gap];
                j -= gap;
            }
            arr[j] = key;
        }
    }
}`,
        pseudo: `procedure ShellSort(A, n)
    for gap ← n/2 down to 1, halving
        for i ← gap to n-1
            key ← A[i]
            j ← i
            while j ≥ gap and A[j-gap] > key
                A[j] ← A[j-gap]          ▸ jump gap slots
                j ← j-gap
            end while
            A[j] ← key
        end for
    end for
end procedure`,
      },
      {
        slug: "merge-sort",
        name: "Merge Sort",
        summary:
          "Recursively splits the array in half, sorts each half, then merges the two sorted halves back together.",
        time: "O(n log n)",
        space: "O(n)",
        inputKind: "array",
        code: `void merge(int arr[], int lo, int mid, int hi) {
    int n1 = mid - lo + 1, n2 = hi - mid;
    int L[n1], R[n2];
    for (int i = 0; i < n1; i++) L[i] = arr[lo + i];
    for (int j = 0; j < n2; j++) R[j] = arr[mid + 1 + j];

    int i = 0, j = 0, k = lo;
    while (i < n1 && j < n2)
        arr[k++] = (L[i] <= R[j]) ? L[i++] : R[j++];
    while (i < n1) arr[k++] = L[i++];
    while (j < n2) arr[k++] = R[j++];
}

void mergeSort(int arr[], int lo, int hi) {
    if (lo >= hi) return;
    int mid = lo + (hi - lo) / 2;
    mergeSort(arr, lo, mid);
    mergeSort(arr, mid + 1, hi);
    merge(arr, lo, mid, hi);
}`,
        pseudo: `procedure Merge(A, lo, mid, hi)
    n1 ← mid-lo+1, n2 ← hi-mid
    let L[n1], R[n2]
    copy A[lo .. mid]   into L
    copy A[mid+1 .. hi] into R

    i ← 0, j ← 0, k ← lo
    while i < n1 and j < n2              ▸ take the smaller head
        A[k++] ← if L[i] ≤ R[j] then L[i++] else R[j++]
    while i < n1: A[k++] ← L[i++]        ▸ drain L
    while j < n2: A[k++] ← R[j++]        ▸ drain R
end procedure

procedure MergeSort(A, lo, hi)
    if lo ≥ hi then return               ▸ one element is sorted
    mid ← lo + (hi-lo)/2
    MergeSort(A, lo, mid)
    MergeSort(A, mid+1, hi)
    Merge(A, lo, mid, hi)
end procedure`,
      },
      {
        slug: "quick-sort",
        name: "Quick Sort",
        summary:
          "Divide-and-conquer sort that partitions the array around a pivot, then recursively sorts each side.",
        time: "O(n log n)",
        space: "O(log n)",
        inputKind: "array",
        code: `int partition(int arr[], int lo, int hi) {
    int pivot = arr[hi];
    int i = lo - 1;
    for (int j = lo; j < hi; j++) {
        if (arr[j] < pivot) {
            i++;
            int tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
        }
    }
    int tmp = arr[i + 1]; arr[i + 1] = arr[hi]; arr[hi] = tmp;
    return i + 1;
}

void quickSort(int arr[], int lo, int hi) {
    if (lo < hi) {
        int p = partition(arr, lo, hi);
        quickSort(arr, lo, p - 1);
        quickSort(arr, p + 1, hi);
    }
}`,
        pseudo: `function Partition(A, lo, hi)
    pivot ← A[hi]
    i ← lo-1                             ▸ end of the "smaller" region
    for j ← lo to hi-1
        if A[j] < pivot
            i ← i+1
            swap A[i], A[j]
        end if
    end for
    swap A[i+1], A[hi]                   ▸ pivot to its final place
    return i+1
end function

procedure QuickSort(A, lo, hi)
    if lo < hi
        p ← Partition(A, lo, hi)
        QuickSort(A, lo, p-1)
        QuickSort(A, p+1, hi)
    end if
end procedure`,
      },
      {
        slug: "heap-sort",
        name: "Heap Sort",
        summary:
          "Builds a max-heap, then repeatedly swaps the root to the end and re-heapifies the shrinking prefix.",
        time: "O(n log n)",
        space: "O(1)",
        inputKind: "array",
        code: `void heapify(int arr[], int n, int i) {
    int largest = i;
    int l = 2 * i + 1, r = 2 * i + 2;
    if (l < n && arr[l] > arr[largest]) largest = l;
    if (r < n && arr[r] > arr[largest]) largest = r;
    if (largest != i) {
        int tmp = arr[i];
        arr[i] = arr[largest];
        arr[largest] = tmp;
        heapify(arr, n, largest);
    }
}

void heapSort(int arr[], int n) {
    for (int i = n / 2 - 1; i >= 0; i--)
        heapify(arr, n, i);
    for (int i = n - 1; i > 0; i--) {
        int tmp = arr[0];
        arr[0] = arr[i];
        arr[i] = tmp;
        heapify(arr, i, 0);
    }
}`,
        pseudo: `procedure Heapify(A, n, i)                ▸ sift A[i] down
    largest ← i
    l ← 2i+1, r ← 2i+2
    if l < n and A[l] > A[largest] then largest ← l
    if r < n and A[r] > A[largest] then largest ← r
    if largest ≠ i
        tmp ← A[i]
        A[i] ← A[largest]
        A[largest] ← tmp
        Heapify(A, n, largest)
    end if
end procedure

procedure HeapSort(A, n)
    for i ← n/2-1 down to 0              ▸ build a max-heap
        Heapify(A, n, i)
    for i ← n-1 down to 1
        tmp ← A[0]
        A[0] ← A[i]                      ▸ max to the back
        A[i] ← tmp
        Heapify(A, i, 0)                 ▸ restore the heap
    end for
end procedure`,
      },
      {
        slug: "radix-sort",
        name: "Radix Sort",
        summary:
          "Sorts without comparisons: runs a stable counting pass per digit, from least to most significant.",
        time: "O(d · (n + k))",
        space: "O(n + k)",
        inputKind: "array",
        code: `int getMax(int arr[], int n) {
    int mx = arr[0];
    for (int i = 1; i < n; i++)
        if (arr[i] > mx) mx = arr[i];
    return mx;
}

void countingPass(int arr[], int n, int exp) {
    int out[n], count[10] = {0};
    for (int i = 0; i < n; i++)
        count[(arr[i] / exp) % 10]++;
    for (int d = 1; d < 10; d++)
        count[d] += count[d - 1];
    for (int i = n - 1; i >= 0; i--)
        out[--count[(arr[i] / exp) % 10]] = arr[i];
    for (int i = 0; i < n; i++)
        arr[i] = out[i];
}

void radixSort(int arr[], int n) {
    for (int exp = 1; getMax(arr, n) / exp > 0; exp *= 10)
        countingPass(arr, n, exp);
}`,
        pseudo: `function GetMax(A, n)
    mx ← A[0]
    for i ← 1 to n-1
        if A[i] > mx then mx ← A[i]
    return mx
end function

procedure CountingPass(A, n, exp)         ▸ stable, by one digit
    let out[n], count[10] ← all zero
    for i ← 0 to n-1
        count[digit(A[i], exp)] ← count[...] + 1
    for d ← 1 to 9
        count[d] ← count[d] + count[d-1]  ▸ running positions
    for i ← n-1 down to 0                 ▸ backwards ⇒ stable
        out[--count[digit(A[i], exp)]] ← A[i]
    for i ← 0 to n-1
        A[i] ← out[i]
end procedure

procedure RadixSort(A, n)
    for exp ← 1, 10, 100, … while GetMax(A,n)/exp > 0
        CountingPass(A, n, exp)
end procedure`,
      },
      {
        slug: "counting-sort",
        name: "Counting Sort",
        summary:
          "Tallies how many times each value occurs, prefix-sums the counts into final positions, then places each element directly — no comparisons.",
        time: "O(n + k)",
        space: "O(n + k)",
        inputKind: "array",
        code: `void countingSort(int arr[], int n) {
    int max = arr[0];
    for (int i = 1; i < n; i++)
        if (arr[i] > max) max = arr[i];

    int count[max + 1];
    for (int i = 0; i <= max; i++) count[i] = 0;

    for (int i = 0; i < n; i++)
        count[arr[i]]++;

    for (int i = 1; i <= max; i++)
        count[i] += count[i - 1];

    int out[n];
    for (int i = n - 1; i >= 0; i--)
        out[--count[arr[i]]] = arr[i];

    for (int i = 0; i < n; i++)
        arr[i] = out[i];
}`,
        pseudo: `procedure CountingSort(A, n)
    max ← A[0]
    for i ← 1 to n-1
        if A[i] > max then max ← A[i]

    let count[max+1]
    for i ← 0 to max: count[i] ← 0

    for i ← 0 to n-1                     ▸ tally each value
        count[A[i]] ← count[A[i]] + 1

    for i ← 1 to max                     ▸ running positions
        count[i] ← count[i] + count[i-1]

    let out[n]
    for i ← n-1 down to 0                ▸ backwards ⇒ stable
        out[--count[A[i]]] ← A[i]

    for i ← 0 to n-1
        A[i] ← out[i]
end procedure`,
      },
      {
        slug: "bucket-sort",
        name: "Bucket Sort",
        summary:
          "Scatters values into a few range buckets, sorts each bucket, then concatenates them back — fast when the data spreads evenly.",
        time: "O(n + k)",
        space: "O(n + k)",
        inputKind: "array",
        code: `#define BUCKETS 5

void bucketSort(int arr[], int n) {
    int max = arr[0];
    for (int i = 1; i < n; i++)
        if (arr[i] > max) max = arr[i];

    int bucket[BUCKETS][100], count[BUCKETS] = {0};
    int size = max / BUCKETS + 1;

    for (int i = 0; i < n; i++) {
        int b = arr[i] / size;
        bucket[b][count[b]++] = arr[i];
    }

    for (int b = 0; b < BUCKETS; b++)
        insertionSort(bucket[b], count[b]);

    int idx = 0;
    for (int b = 0; b < BUCKETS; b++)
        for (int j = 0; j < count[b]; j++)
            arr[idx++] = bucket[b][j];
}`,
        pseudo: `BUCKETS ← 5

procedure BucketSort(A, n)
    max ← A[0]
    for i ← 1 to n-1
        if A[i] > max then max ← A[i]

    let bucket[BUCKETS][…], count[BUCKETS] ← 0
    size ← max/BUCKETS + 1               ▸ value range per bucket

    for i ← 0 to n-1
        b ← A[i] / size
        append A[i] to bucket[b]
    end for

    for b ← 0 to BUCKETS-1
        InsertionSort(bucket[b])         ▸ few items each

    idx ← 0
    for b ← 0 to BUCKETS-1
        for each v in bucket[b]
            A[idx++] ← v
end procedure`,
      },
    ],
  },
  {
    slug: "searching",
    name: "Searching",
    tagline: "Finding values fast",
    icon: Search,
    algorithms: [
      {
        slug: "linear-search",
        name: "Linear Search",
        summary:
          "Walks the array element by element until the target is found — works on any array, sorted or not.",
        time: "O(n)",
        space: "O(1)",
        inputKind: "array-target",
        code: `int linearSearch(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == target)
            return i;
    }
    return -1;
}`,
        pseudo: `function LinearSearch(A, n, target)
    for i ← 0 to n-1
        if A[i] = target
            return i                     ▸ first match wins
    end for
    return -1                            ▸ not present
end function`,
      },
      {
        slug: "binary-search",
        name: "Binary Search",
        summary:
          "Halves a sorted range each step by comparing the middle element with the target.",
        time: "O(log n)",
        space: "O(1)",
        inputKind: "array-target",
        sortedInput: true,
        code: `int binarySearch(int arr[], int n, int target) {
    int lo = 0, hi = n - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] == target)
            return mid;
        if (arr[mid] < target)
            lo = mid + 1;
        else
            hi = mid - 1;
    }
    return -1;
}`,
        pseudo: `function BinarySearch(A, n, target)        ▸ A must be sorted
    lo ← 0, hi ← n-1
    while lo ≤ hi
        mid ← lo + (hi-lo)/2             ▸ no overflow
        if A[mid] = target
            return mid
        if A[mid] < target
            lo ← mid+1                   ▸ drop the left half
        else
            hi ← mid-1                   ▸ drop the right half
    end while
    return -1
end function`,
      },
      {
        slug: "jump-search",
        name: "Jump Search",
        summary:
          "On a sorted array, leaps ahead in fixed blocks of √n to find the block that may hold the target, then scans that block linearly.",
        time: "O(√n)",
        space: "O(1)",
        inputKind: "array-target",
        sortedInput: true,
        code: `int jumpSearch(int arr[], int n, int target) {
    int step = (int)sqrt(n);
    int prev = 0;
    while (arr[min(step, n) - 1] < target) {
        prev = step;
        step += (int)sqrt(n);
        if (prev >= n)
            return -1;
    }
    while (arr[prev] < target) {
        prev++;
        if (prev == min(step, n))
            return -1;
    }
    if (arr[prev] == target)
        return prev;
    return -1;
}`,
        pseudo: `function JumpSearch(A, n, target)          ▸ A must be sorted
    step ← ⌊√n⌋
    prev ← 0
    while A[min(step,n)-1] < target      ▸ leap block by block
        prev ← step
        step ← step + ⌊√n⌋
        if prev ≥ n
            return -1                    ▸ past the end
    end while
    while A[prev] < target               ▸ scan inside the block
        prev ← prev+1
        if prev = min(step,n)
            return -1
    end while
    if A[prev] = target
        return prev
    return -1
end function`,
      },
      {
        slug: "interpolation-search",
        name: "Interpolation Search",
        summary:
          "Estimates the probe position from the target's value relative to the window's endpoints — near O(log log n) on uniformly spread data.",
        time: "O(log log n)",
        space: "O(1)",
        inputKind: "array-target",
        sortedInput: true,
        code: `int interpolationSearch(int arr[], int n, int target) {
    int lo = 0, hi = n - 1;
    while (lo <= hi && target >= arr[lo] && target <= arr[hi]) {
        if (lo == hi) {
            if (arr[lo] == target) return lo;
            return -1;
        }
        if (arr[hi] == arr[lo])   /* flat window: all equal */
            return lo;            /* loop guard => match    */
        int pos = lo + (target - arr[lo]) * (hi - lo)
                       / (arr[hi] - arr[lo]);
        if (arr[pos] == target)
            return pos;
        if (arr[pos] < target)
            lo = pos + 1;
        else
            hi = pos - 1;
    }
    return -1;
}`,
        pseudo: `function InterpolationSearch(A, n, target) ▸ sorted, ~uniform
    lo ← 0, hi ← n-1
    while lo ≤ hi and A[lo] ≤ target ≤ A[hi]
        if lo = hi
            if A[lo] = target then return lo
            return -1
        end if
        if A[hi] = A[lo]                 ▸ flat window: all equal
            return lo                    ▸ guard ⇒ it is the match
        pos ← lo + (target-A[lo])·(hi-lo)
                   / (A[hi]-A[lo])       ▸ guess by value
        if A[pos] = target
            return pos
        if A[pos] < target
            lo ← pos+1
        else
            hi ← pos-1
    end while
    return -1
end function`,
      },
    ],
  },
  {
    slug: "data-structures",
    name: "Data Structures",
    tagline: "How data is organized",
    icon: Boxes,
    algorithms: [
      {
        slug: "linked-list",
        name: "Linked List",
        summary:
          "Nodes chained by pointers: O(1) insertion at the head, sequential traversal to search or delete.",
        time: "O(n) search",
        space: "O(n)",
        inputKind: "array",
        code: `typedef struct Node {
    int data;
    struct Node *next;
} Node;

Node *pushFront(Node *head, int value) {
    Node *node = malloc(sizeof(Node));
    node->data = value;
    node->next = head;
    return node;
}

Node *removeValue(Node *head, int value) {
    if (head == NULL) return NULL;
    if (head->data == value) {
        Node *rest = head->next;
        free(head);
        return rest;
    }
    head->next = removeValue(head->next, value);
    return head;
}`,
        pseudo: `record Node
    data
    next                                 ▸ pointer to the next node
end record

function PushFront(head, value)
    node ← allocate Node
    node.data ← value
    node.next ← head                     ▸ old head follows
    return node                          ▸ the new head
end function

function RemoveValue(head, value)
    if head = NIL then return NIL        ▸ ran off the end
    if head.data = value
        rest ← head.next
        free head
        return rest                      ▸ splice it out
    end if
    head.next ← RemoveValue(head.next, value)
    return head
end function`,
      },
      {
        slug: "stack",
        name: "Stack",
        summary:
          "LIFO container: push and pop happen at the same end, so the last element in is the first one out.",
        time: "O(1) push/pop",
        space: "O(n)",
        inputKind: "array",
        code: `#define MAX 100

typedef struct {
    int items[MAX];
    int top;          /* -1 when empty */
} Stack;

void push(Stack *s, int value) {
    if (s->top == MAX - 1) return;   /* overflow */
    s->items[++s->top] = value;
}

int pop(Stack *s) {
    if (s->top == -1) return -1;     /* underflow */
    return s->items[s->top--];
}

int peek(const Stack *s) {
    return s->items[s->top];
}`,
        pseudo: `MAX ← 100

record Stack
    items[MAX]
    top                                  ▸ -1 when empty
end record

procedure Push(s, value)
    if s.top = MAX-1 then return         ▸ overflow
    s.items[++s.top] ← value             ▸ grow at the top
end procedure

function Pop(s)
    if s.top = -1 then return -1         ▸ underflow
    return s.items[s.top--]              ▸ last in, first out
end function

function Peek(s)
    return s.items[s.top]                ▸ look, do not remove
end function`,
      },
      {
        slug: "queue",
        name: "Queue",
        summary:
          "FIFO container implemented as a circular buffer: enqueue at the rear, dequeue from the front.",
        time: "O(1) enqueue/dequeue",
        space: "O(n)",
        inputKind: "array",
        code: `#define MAX 100

typedef struct {
    int items[MAX];
    int front, rear, size;
} Queue;

void enqueue(Queue *q, int value) {
    if (q->size == MAX) return;      /* full */
    q->rear = (q->rear + 1) % MAX;
    q->items[q->rear] = value;
    q->size++;
}

int dequeue(Queue *q) {
    if (q->size == 0) return -1;     /* empty */
    int value = q->items[q->front];
    q->front = (q->front + 1) % MAX;
    q->size--;
    return value;
}`,
        pseudo: `MAX ← 100

record Queue
    items[MAX]
    front, rear, size                    ▸ indices wrap around
end record

procedure Enqueue(q, value)
    if q.size = MAX then return          ▸ full
    q.rear ← (q.rear + 1) mod MAX        ▸ wrap
    q.items[q.rear] ← value
    q.size ← q.size + 1
end procedure

function Dequeue(q)
    if q.size = 0 then return -1         ▸ empty
    value ← q.items[q.front]             ▸ first in, first out
    q.front ← (q.front + 1) mod MAX
    q.size ← q.size - 1
    return value
end function`,
      },
      {
        slug: "hash-table",
        name: "Hash Table",
        summary:
          "Maps keys to buckets with a hash function; collisions are chained as linked lists inside each bucket.",
        time: "O(1) average",
        space: "O(n)",
        inputKind: "array",
        code: `#define BUCKETS 8

typedef struct Entry {
    int key;
    struct Entry *next;
} Entry;

Entry *table[BUCKETS];

int hash(int key) {
    return ((key % BUCKETS) + BUCKETS) % BUCKETS;
}

void insert(int key) {
    int b = hash(key);
    Entry *e = malloc(sizeof(Entry));
    e->key = key;
    e->next = table[b];   /* chain on collision */
    table[b] = e;
}

int contains(int key) {
    for (Entry *e = table[hash(key)]; e; e = e->next)
        if (e->key == key) return 1;
    return 0;
}`,
        pseudo: `BUCKETS ← 8

record Entry
    key
    next                                 ▸ next entry in the chain
end record

let table[BUCKETS] ← all empty

function Hash(key)
    return key mod BUCKETS               ▸ non-negative
end function

procedure Insert(key)
    b ← Hash(key)                        ▸ which bucket
    e ← allocate Entry
    e.key ← key
    e.next ← table[b]                    ▸ chain on collision
    table[b] ← e                         ▸ new head of the chain
end procedure

function Contains(key)
    for each e in chain table[Hash(key)]
        if e.key = key then return true  ▸ only one bucket scanned
    return false
end function`,
      },
      {
        slug: "union-find",
        name: "Union-Find (Disjoint Set)",
        summary:
          "Forest of sets: find walks to a root and flattens the path behind it, union hangs the lower-rank root under the higher one.",
        time: "O(α(n))",
        space: "O(n)",
        code: `int parent[N], rank_[N];

void makeSets(int n) {
    for (int i = 0; i < n; i++) {
        parent[i] = i;
        rank_[i] = 0;
    }
}

int find(int x) {
    if (parent[x] != x)
        parent[x] = find(parent[x]);   /* compress */
    return parent[x];
}

void unionSets(int a, int b) {
    int ra = find(a), rb = find(b);
    if (ra == rb) return;              /* same set */
    if (rank_[ra] < rank_[rb]) {
        parent[ra] = rb;
    } else if (rank_[ra] > rank_[rb]) {
        parent[rb] = ra;
    } else {
        parent[rb] = ra;
        rank_[ra]++;
    }
}`,
        pseudo: `let parent[N], rank[N]

procedure MakeSets(n)
    for i ← 0 to n-1
        parent[i] ← i                    ▸ its own root
        rank[i] ← 0
    end for
end procedure

function Find(x)
    if parent[x] ≠ x
        parent[x] ← Find(parent[x])      ▸ compress the path
    return parent[x]                     ▸ the set's representative
end function

procedure Union(a, b)
    ra ← Find(a), rb ← Find(b)
    if ra = rb then return               ▸ same set already
    if rank[ra] < rank[rb]
        parent[ra] ← rb                  ▸ shallower under deeper
    else if rank[ra] > rank[rb]
        parent[rb] ← ra
    else
        parent[rb] ← ra
        rank[ra] ← rank[ra] + 1          ▸ equal ranks: depth grows
    end if
end procedure`,
      },
    ],
  },
  {
    slug: "graphs",
    name: "Graphs",
    tagline: "Traversal & shortest paths",
    icon: Share2,
    algorithms: [
      {
        slug: "bfs",
        name: "Breadth-First Search",
        summary:
          "Explores a graph level by level using a queue — the backbone of shortest paths in unweighted graphs.",
        time: "O(V + E)",
        space: "O(V)",
        code: `#define V 6

void bfs(int graph[V][V], int start) {
    int visited[V] = {0};
    int queue[V], front = 0, rear = 0;

    visited[start] = 1;
    queue[rear++] = start;

    while (front < rear) {
        int u = queue[front++];
        printf("%d ", u);
        for (int v = 0; v < V; v++) {
            if (graph[u][v] && !visited[v]) {
                visited[v] = 1;
                queue[rear++] = v;
            }
        }
    }
}`,
        pseudo: `V ← 6

procedure BFS(graph, start)
    let visited[V] ← all false
    let queue ← empty                    ▸ FIFO

    visited[start] ← true
    enqueue start

    while queue is not empty
        u ← dequeue                      ▸ nearest unexplored
        output u
        for v ← 0 to V-1
            if edge u→v and not visited[v]
                visited[v] ← true        ▸ mark on discovery
                enqueue v
            end if
        end for
    end while
end procedure`,
      },
      {
        slug: "dfs",
        name: "Depth-First Search",
        summary:
          "Dives as deep as possible along each branch before backtracking — implemented with recursion or a stack.",
        time: "O(V + E)",
        space: "O(V)",
        code: `#define V 6

void dfs(int graph[V][V], int u, int visited[V]) {
    visited[u] = 1;
    printf("%d ", u);
    for (int v = 0; v < V; v++) {
        if (graph[u][v] && !visited[v])
            dfs(graph, v, visited);
    }
}`,
        pseudo: `V ← 6

procedure DFS(graph, u, visited)
    visited[u] ← true
    output u
    for v ← 0 to V-1
        if edge u→v and not visited[v]
            DFS(graph, v, visited)       ▸ dive before widening
    end for
end procedure`,
      },
      {
        slug: "dijkstra",
        name: "Dijkstra's Algorithm",
        summary:
          "Finds the shortest path from a source node to every other node in a weighted graph with non-negative edges.",
        time: "O(V²)",
        space: "O(V)",
        code: `#define V 6
#define INF 1000000

void dijkstra(int graph[V][V], int src, int dist[V]) {
    int visited[V] = {0};
    for (int i = 0; i < V; i++) dist[i] = INF;
    dist[src] = 0;

    for (int count = 0; count < V - 1; count++) {
        int u = -1;
        for (int v = 0; v < V; v++)
            if (!visited[v] && (u == -1 || dist[v] < dist[u]))
                u = v;
        visited[u] = 1;

        for (int v = 0; v < V; v++)
            if (graph[u][v] && !visited[v] &&
                dist[u] + graph[u][v] < dist[v])
                dist[v] = dist[u] + graph[u][v];
    }
}`,
        pseudo: `V ← 6
INF ← ∞

procedure Dijkstra(graph, src, dist)      ▸ non-negative weights
    let visited[V] ← all false
    for i ← 0 to V-1: dist[i] ← INF
    dist[src] ← 0

    repeat V times
        u ← -1
        for v ← 0 to V-1                 ▸ nearest unvisited
            if not visited[v] and (u = -1 or dist[v] < dist[u])
                u ← v
        visited[u] ← true                ▸ dist[u] is now final

        for v ← 0 to V-1                 ▸ relax u's edges
            if edge u→v and not visited[v] and
               dist[u] + w(u,v) < dist[v]
                dist[v] ← dist[u] + w(u,v)
    end repeat
end procedure`,
      },
      {
        slug: "bellman-ford",
        name: "Bellman-Ford",
        summary:
          "Shortest paths from a source that also works with negative edge weights, by relaxing every edge V−1 times.",
        time: "O(V · E)",
        space: "O(V)",
        code: `#define V 6
#define INF 1000000

int bellmanFord(int graph[V][V], int src, int dist[V]) {
    for (int i = 0; i < V; i++) dist[i] = INF;
    dist[src] = 0;

    for (int pass = 1; pass < V; pass++) {
        for (int u = 0; u < V; u++) {
            if (dist[u] == INF) continue;
            for (int v = 0; v < V; v++) {
                if (graph[u][v] &&
                    dist[u] + graph[u][v] < dist[v])
                    dist[v] = dist[u] + graph[u][v];
            }
        }
    }

    /* One extra sweep: an edge that still relaxes after V-1
       passes proves a negative cycle is reachable. */
    for (int u = 0; u < V; u++)
        for (int v = 0; v < V; v++)
            if (graph[u][v] && dist[u] != INF &&
                dist[u] + graph[u][v] < dist[v])
                return 0;
    return 1;
}`,
        pseudo: `V ← 6
INF ← ∞

function BellmanFord(graph, src, dist)    ▸ negatives allowed
    for i ← 0 to V-1: dist[i] ← INF
    dist[src] ← 0

    for pass ← 1 to V-1
        for u ← 0 to V-1
            if dist[u] = INF then skip
            for v ← 0 to V-1
                if edge u→v and
                   dist[u] + w(u,v) < dist[v]
                    dist[v] ← dist[u] + w(u,v)
            end for
        end for
    end for

    ▸ One extra sweep: an edge that still relaxes after
    ▸ V-1 passes proves a negative cycle is reachable.
    for u ← 0 to V-1
        for v ← 0 to V-1
            if edge u→v and dist[u] ≠ INF and
               dist[u] + w(u,v) < dist[v]
                return false             ▸ no shortest path exists
    return true
end function`,
      },
      {
        slug: "topological-sort",
        name: "Topological Sort",
        summary:
          "Linear ordering of a DAG's nodes so every edge points forward — Kahn's algorithm peels off in-degree-0 nodes.",
        time: "O(V + E)",
        space: "O(V)",
        code: `#define V 6

void topoSort(int graph[V][V]) {
    int indeg[V] = {0};
    for (int u = 0; u < V; u++)
        for (int v = 0; v < V; v++)
            if (graph[u][v]) indeg[v]++;

    int queue[V], front = 0, rear = 0;
    for (int v = 0; v < V; v++)
        if (indeg[v] == 0) queue[rear++] = v;

    while (front < rear) {
        int u = queue[front++];
        printf("%d ", u);
        for (int v = 0; v < V; v++) {
            if (graph[u][v] && --indeg[v] == 0)
                queue[rear++] = v;
        }
    }

    if (rear < V)
        printf("\\ncycle: %d node(s) never reached in-degree 0", V - rear);
}`,
        pseudo: `V ← 6

procedure TopoSort(graph)                 ▸ Kahn's algorithm
    let indeg[V] ← all zero
    for u ← 0 to V-1
        for v ← 0 to V-1
            if edge u→v then indeg[v] ← indeg[v] + 1

    let queue ← empty
    for v ← 0 to V-1
        if indeg[v] = 0 then enqueue v   ▸ no prerequisites

    while queue is not empty
        u ← dequeue
        output u
        for v ← 0 to V-1
            if edge u→v and --indeg[v] = 0
                enqueue v                ▸ last prerequisite met
        end for
    end while

    if fewer than V nodes were emitted
        report a cycle                   ▸ no valid order exists
end procedure`,
      },
      {
        slug: "prim",
        name: "Prim's MST",
        summary:
          "Grows a minimum spanning tree from a start node, always adding the cheapest edge that reaches a new node.",
        time: "O(V²)",
        space: "O(V)",
        code: `#define V 6
#define INF 1000000

void prim(int graph[V][V], int start) {
    int inMST[V] = {0};
    int key[V], parent[V];
    for (int i = 0; i < V; i++) key[i] = INF;
    key[start] = 0;

    for (int count = 0; count < V; count++) {
        int u = -1;
        for (int v = 0; v < V; v++)
            if (!inMST[v] && (u == -1 || key[v] < key[u]))
                u = v;
        inMST[u] = 1;

        for (int v = 0; v < V; v++)
            if (graph[u][v] && !inMST[v] &&
                graph[u][v] < key[v]) {
                key[v] = graph[u][v];
                parent[v] = u;
            }
    }
}`,
        pseudo: `V ← 6
INF ← ∞

procedure Prim(graph, start)              ▸ grow one tree
    let inMST[V] ← all false
    let key[V], parent[V]
    for i ← 0 to V-1: key[i] ← INF
    key[start] ← 0

    repeat V times
        u ← -1
        for v ← 0 to V-1                 ▸ cheapest node outside
            if not inMST[v] and (u = -1 or key[v] < key[u])
                u ← v
        inMST[u] ← true                  ▸ add it to the tree

        for v ← 0 to V-1                 ▸ update the frontier
            if edge u→v and not inMST[v] and
               w(u,v) < key[v]
                key[v] ← w(u,v)
                parent[v] ← u
            end if
    end repeat
end procedure`,
      },
      {
        slug: "kruskal",
        name: "Kruskal's MST",
        summary:
          "Builds a minimum spanning tree by adding edges in weight order, using union-find to reject cycle edges.",
        time: "O(E log E)",
        space: "O(V)",
        code: `#define V 6

int parent[V];
int find(int x) {
    while (parent[x] != x) x = parent[x];
    return x;
}

void kruskal(Edge edges[], int m) {
    for (int i = 0; i < V; i++) parent[i] = i;
    sortByWeight(edges, m);

    for (int i = 0; i < m; i++) {
        int a = find(edges[i].u), b = find(edges[i].v);
        if (a == b)
            continue;           /* same set -> cycle, skip */
        parent[a] = b;          /* union: keep this edge */
    }
}`,
        pseudo: `V ← 6

let parent[V]
function Find(x)
    while parent[x] ≠ x: x ← parent[x]
    return x
end function

procedure Kruskal(edges, m)               ▸ grow a forest
    for i ← 0 to V-1: parent[i] ← i
    sort edges by weight, ascending

    for i ← 0 to m-1
        a ← Find(edges[i].u), b ← Find(edges[i].v)
        if a = b
            continue                     ▸ same set ⇒ cycle, skip
        parent[a] ← b                    ▸ union: keep this edge
    end for
end procedure`,
      },
      {
        slug: "a-star",
        name: "A* Search",
        summary:
          "Best-first shortest path guided by a heuristic: expands the node with the lowest g + straight-line estimate.",
        time: "O(E)",
        space: "O(V)",
        code: `#define V 6
#define INF 1000000

/* h[v] = straight-line estimate from v to the goal */
int aStar(int graph[V][V], int h[V], int src, int goal) {
    int g[V], f[V], closed[V] = {0};
    for (int i = 0; i < V; i++) { g[i] = INF; f[i] = INF; }
    g[src] = 0;
    f[src] = h[src];

    for (int count = 0; count < V; count++) {
        int u = -1;
        for (int v = 0; v < V; v++)
            if (!closed[v] && (u == -1 || f[v] < f[u]))
                u = v;
        if (u == goal) return g[goal];
        closed[u] = 1;

        for (int v = 0; v < V; v++)
            if (graph[u][v] && g[u] + graph[u][v] < g[v]) {
                g[v] = g[u] + graph[u][v];
                f[v] = g[v] + h[v];
            }
    }
    return -1;
}`,
        pseudo: `V ← 6
INF ← ∞

▸ h[v] = straight-line estimate from v to the goal
function AStar(graph, h, src, goal)
    let g[V], f[V], closed[V] ← all false
    for i ← 0 to V-1: g[i] ← INF, f[i] ← INF
    g[src] ← 0
    f[src] ← h[src]                      ▸ cost so far + guess

    repeat V times
        u ← -1
        for v ← 0 to V-1                 ▸ lowest f, not closed
            if not closed[v] and (u = -1 or f[v] < f[u])
                u ← v
        if u = goal then return g[goal]
        closed[u] ← true

        for v ← 0 to V-1
            if edge u→v and g[u] + w(u,v) < g[v]
                g[v] ← g[u] + w(u,v)
                f[v] ← g[v] + h[v]       ▸ steer toward the goal
            end if
    end repeat
    return -1                            ▸ goal unreachable
end function`,
      },
      {
        slug: "floyd-warshall",
        name: "Floyd-Warshall",
        summary:
          "All-pairs shortest paths by dynamic programming: round k asks every pair whether a stopover at node k shortens their path.",
        time: "O(V³)",
        space: "O(V²)",
        code: `#define V 4
#define INF 1000000

void floydWarshall(int dist[V][V]) {
    for (int k = 0; k < V; k++) {
        for (int i = 0; i < V; i++) {
            for (int j = 0; j < V; j++) {
                if (dist[i][k] + dist[k][j] < dist[i][j])
                    dist[i][j] = dist[i][k]
                               + dist[k][j];
            }
        }
    }
}`,
        pseudo: `V ← 4
INF ← ∞

procedure FloydWarshall(dist)             ▸ all pairs at once
    for k ← 0 to V-1                     ▸ allowed stop-over
        for i ← 0 to V-1
            for j ← 0 to V-1
                if dist[i][k] + dist[k][j] < dist[i][j]
                    dist[i][j] ← dist[i][k]
                                + dist[k][j]
            end for
        end for
    end for
end procedure`,
      },
    ],
  },
  {
    slug: "dynamic-programming",
    name: "Dynamic Programming",
    tagline: "Optimal substructure & memoization",
    icon: Layers,
    algorithms: [
      {
        slug: "lcs",
        name: "Longest Common Subsequence",
        summary:
          "Finds the longest subsequence shared by two strings by building a 2-D table of subproblem answers.",
        time: "O(m · n)",
        space: "O(m · n)",
        code: `int max(int a, int b) { return a > b ? a : b; }

int lcs(const char *a, const char *b) {
    int m = strlen(a), n = strlen(b);
    int dp[m + 1][n + 1];

    for (int i = 0; i <= m; i++) {
        for (int j = 0; j <= n; j++) {
            if (i == 0 || j == 0)
                dp[i][j] = 0;
            else if (a[i - 1] == b[j - 1])
                dp[i][j] = dp[i - 1][j - 1] + 1;
            else
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
        }
    }
    return dp[m][n];
}`,
        pseudo: `function Max(a, b) → the larger of a and b

function LCS(a, b)
    m ← length(a), n ← length(b)
    let dp[m+1][n+1]                     ▸ dp[i][j] = LCS of prefixes

    for i ← 0 to m
        for j ← 0 to n
            if i = 0 or j = 0
                dp[i][j] ← 0             ▸ empty prefix
            else if a[i-1] = b[j-1]
                dp[i][j] ← dp[i-1][j-1] + 1   ▸ extend diagonally
            else
                dp[i][j] ← Max(dp[i-1][j], dp[i][j-1])
        end for
    end for
    return dp[m][n]
end function`,
      },
      {
        slug: "knapsack",
        name: "0/1 Knapsack",
        summary:
          "Maximizes total value under a weight limit, deciding for each item whether to take it or leave it.",
        time: "O(n · W)",
        space: "O(n · W)",
        code: `int max(int a, int b) { return a > b ? a : b; }

int knapsack(int w[], int val[], int n, int W) {
    int dp[n + 1][W + 1];

    for (int i = 0; i <= n; i++) {
        for (int c = 0; c <= W; c++) {
            if (i == 0 || c == 0)
                dp[i][c] = 0;
            else if (w[i - 1] > c)
                dp[i][c] = dp[i - 1][c];
            else
                dp[i][c] = max(dp[i - 1][c],
                    dp[i - 1][c - w[i - 1]] + val[i - 1]);
        }
    }
    return dp[n][W];
}`,
        pseudo: `function Max(a, b) → the larger of a and b

function Knapsack(w, val, n, W)           ▸ each item once
    let dp[n+1][W+1]                     ▸ dp[i][c] = best with i items

    for i ← 0 to n
        for c ← 0 to W
            if i = 0 or c = 0
                dp[i][c] ← 0             ▸ nothing fits, nothing gained
            else if w[i-1] > c
                dp[i][c] ← dp[i-1][c]    ▸ too heavy: skip it
            else
                dp[i][c] ← Max(dp[i-1][c],
                    dp[i-1][c-w[i-1]] + val[i-1])
        end for
    end for
    return dp[n][W]
end function`,
      },
      {
        slug: "edit-distance",
        name: "Edit Distance",
        summary:
          "Fewest single-character insertions, deletions or replacements to turn one string into another (Levenshtein).",
        time: "O(m · n)",
        space: "O(m · n)",
        code: `int min3(int a, int b, int c) {
    int m = a < b ? a : b;
    return m < c ? m : c;
}

int editDistance(const char *a, const char *b) {
    int m = strlen(a), n = strlen(b);
    int dp[m + 1][n + 1];

    for (int i = 0; i <= m; i++) {
        for (int j = 0; j <= n; j++) {
            if (i == 0)
                dp[i][j] = j;
            else if (j == 0)
                dp[i][j] = i;
            else if (a[i - 1] == b[j - 1])
                dp[i][j] = dp[i - 1][j - 1];
            else
                dp[i][j] = 1 + min3(dp[i - 1][j - 1],
                                    dp[i - 1][j], dp[i][j - 1]);
        }
    }
    return dp[m][n];
}`,
        pseudo: `function Min3(a, b, c)
    m ← the smaller of a and b
    return the smaller of m and c
end function

function EditDistance(a, b)               ▸ Levenshtein
    m ← length(a), n ← length(b)
    let dp[m+1][n+1]                     ▸ dp[i][j] = edits so far

    for i ← 0 to m
        for j ← 0 to n
            if i = 0
                dp[i][j] ← j             ▸ j inserts
            else if j = 0
                dp[i][j] ← i             ▸ i deletes
            else if a[i-1] = b[j-1]
                dp[i][j] ← dp[i-1][j-1]  ▸ free: same character
            else
                dp[i][j] ← 1 + Min3(dp[i-1][j-1],
                                    dp[i-1][j], dp[i][j-1])
        end for
    end for
    return dp[m][n]
end function`,
      },
      {
        slug: "coin-change",
        name: "Coin Change",
        summary:
          "Fewest coins that sum to a target amount, given unlimited supply of each denomination.",
        time: "O(n · amount)",
        space: "O(n · amount)",
        code: `#define INF 1000000

int min(int a, int b) { return a < b ? a : b; }

int coinChange(int coins[], int n, int amount) {
    int dp[n + 1][amount + 1];

    for (int i = 0; i <= n; i++) {
        for (int a = 0; a <= amount; a++) {
            if (a == 0)
                dp[i][a] = 0;
            else if (i == 0)
                dp[i][a] = INF;
            else if (coins[i - 1] > a)
                dp[i][a] = dp[i - 1][a];
            else
                dp[i][a] = min(dp[i - 1][a],
                               dp[i][a - coins[i - 1]] + 1);
        }
    }
    return dp[n][amount];
}`,
        pseudo: `INF ← ∞

function Min(a, b) → the smaller of a and b

function CoinChange(coins, n, amount)     ▸ unlimited of each
    let dp[n+1][amount+1]

    for i ← 0 to n
        for a ← 0 to amount
            if a = 0
                dp[i][a] ← 0             ▸ no coins needed
            else if i = 0
                dp[i][a] ← INF           ▸ no coins available
            else if coins[i-1] > a
                dp[i][a] ← dp[i-1][a]    ▸ coin too large
            else
                dp[i][a] ← Min(dp[i-1][a],
                               dp[i][a-coins[i-1]] + 1)
        end for
    end for
    return dp[n][amount]
end function`,
      },
      {
        slug: "fibonacci",
        name: "Fibonacci (Tabulation)",
        summary:
          "Builds the Fibonacci sequence bottom-up, each term being the sum of the two before it — no repeated work.",
        time: "O(n)",
        space: "O(n)",
        code: `int fib(int n) {
    if (n <= 1) return n;
    int dp[n + 1];
    dp[0] = 0;
    dp[1] = 1;
    for (int i = 2; i <= n; i++)
        dp[i] = dp[i - 1] + dp[i - 2];
    return dp[n];
}`,
        pseudo: `function Fib(n)                            ▸ bottom-up
    if n ≤ 1 then return n
    let dp[n+1]
    dp[0] ← 0
    dp[1] ← 1
    for i ← 2 to n
        dp[i] ← dp[i-1] + dp[i-2]        ▸ each solved once
    return dp[n]
end function`,
      },
      {
        slug: "kadane",
        name: "Kadane's Algorithm",
        summary:
          "Maximum subarray sum in one pass: extend the running sum while it helps, restart at the current element when it turns negative.",
        time: "O(n)",
        space: "O(1)",
        code: `int kadane(int a[], int n) {
    int best = a[0];
    int cur = a[0];
    for (int i = 1; i < n; i++) {
        if (cur + a[i] > a[i])
            cur = cur + a[i];   /* extend the run   */
        else
            cur = a[i];         /* restart run here */
        if (cur > best)
            best = cur;
    }
    return best;
}`,
        pseudo: `function Kadane(A, n)                      ▸ max subarray sum
    best ← A[0]
    cur ← A[0]                           ▸ best run ending here
    for i ← 1 to n-1
        if cur + A[i] > A[i]
            cur ← cur + A[i]             ▸ extend the run
        else
            cur ← A[i]                   ▸ restart run here
        if cur > best
            best ← cur
    end for
    return best
end function`,
      },
      {
        slug: "lis",
        name: "Longest Increasing Subsequence",
        summary:
          "Longest run of values that strictly increases (not necessarily contiguous), via dp[i] = best subsequence ending at i.",
        time: "O(n²)",
        space: "O(n)",
        code: `int lis(int a[], int n) {
    int dp[n];
    int best = 0;
    for (int i = 0; i < n; i++) {
        dp[i] = 1;
        for (int j = 0; j < i; j++) {
            if (a[j] < a[i] && dp[j] + 1 > dp[i])
                dp[i] = dp[j] + 1;
        }
        if (dp[i] > best) best = dp[i];
    }
    return best;
}`,
        pseudo: `function LIS(A, n)                         ▸ longest increasing
    let dp[n]
    best ← 0
    for i ← 0 to n-1
        dp[i] ← 1                        ▸ A[i] on its own
        for j ← 0 to i-1
            if A[j] < A[i] and dp[j] + 1 > dp[i]
                dp[i] ← dp[j] + 1        ▸ extend that run
        end for
        if dp[i] > best then best ← dp[i]
    end for
    return best
end function`,
      },
    ],
  },
  {
    slug: "greedy",
    name: "Greedy",
    tagline: "Locally optimal choices",
    icon: HandCoins,
    algorithms: [
      {
        slug: "activity-selection",
        name: "Activity Selection",
        summary:
          "Picks the maximum number of non-overlapping activities by always taking the one that finishes earliest.",
        time: "O(n log n)",
        space: "O(1)",
        code: `/* activities sorted by finish time */
void activitySelect(int start[], int finish[], int n) {
    int lastFinish = finish[0];
    printf("select 0\\n");
    for (int i = 1; i < n; i++) {
        if (start[i] >= lastFinish) {
            printf("select %d\\n", i);
            lastFinish = finish[i];
        }
    }
}`,
        pseudo: `▸ activities sorted by finish time
procedure ActivitySelect(start, finish, n)
    lastFinish ← finish[0]               ▸ earliest finisher is safe
    select 0
    for i ← 1 to n-1
        if start[i] ≥ lastFinish         ▸ no overlap
            select i
            lastFinish ← finish[i]       ▸ move the frontier
        end if
    end for
end procedure`,
      },
      {
        slug: "fractional-knapsack",
        name: "Fractional Knapsack",
        summary:
          "Maximizes value under a weight limit when items can be split: take items in value/weight order, breaking the last one.",
        time: "O(n log n)",
        space: "O(1)",
        code: `/* items sorted by value/weight ratio (desc) */
double fracKnapsack(int w[], int v[], int n, int W) {
    double total = 0;
    int remaining = W;
    for (int i = 0; i < n && remaining > 0; i++) {
        if (w[i] <= remaining) {
            remaining -= w[i];       /* take it all */
            total += v[i];
        } else {
            double frac = (double)remaining / w[i];
            total += v[i] * frac;    /* take a fraction */
            remaining = 0;
        }
    }
    return total;
}`,
        pseudo: `▸ items sorted by value/weight ratio, descending
function FracKnapsack(w, v, n, W)
    total ← 0
    remaining ← W
    for i ← 0 to n-1 while remaining > 0
        if w[i] ≤ remaining
            remaining ← remaining - w[i] ▸ take it all
            total ← total + v[i]
        else
            frac ← remaining / w[i]
            total ← total + v[i]·frac    ▸ take a fraction
            remaining ← 0                ▸ the bag is full
        end if
    end for
    return total
end function`,
      },
      {
        slug: "job-sequencing",
        name: "Job Sequencing",
        summary:
          "Schedules deadline-bound unit jobs for maximum profit: greedily place each job (highest profit first) into the latest free hour before its deadline.",
        time: "O(n²)",
        space: "O(n)",
        code: `/* jobs sorted by profit (desc) */
int jobSequence(int dl[], int p[], int n, int maxD) {
    int slot[maxD + 1];
    for (int t = 1; t <= maxD; t++)
        slot[t] = -1;                /* all hours free */

    int total = 0;
    for (int i = 0; i < n; i++) {
        for (int t = dl[i]; t >= 1; t--) {
            if (slot[t] == -1) {
                slot[t] = i;         /* latest free hour */
                total += p[i];
                break;
            }
        }
    }
    return total;
}`,
        pseudo: `▸ jobs sorted by profit, descending
function JobSequence(deadline, profit, n, maxD)
    let slot[1 .. maxD]
    for t ← 1 to maxD
        slot[t] ← empty                  ▸ all hours free

    total ← 0
    for i ← 0 to n-1
        for t ← deadline[i] down to 1
            if slot[t] is empty
                slot[t] ← i              ▸ latest free hour
                total ← total + profit[i]
                break                    ▸ keep earlier hours open
            end if
        end for
    end for
    return total
end function`,
      },
      {
        slug: "huffman-coding",
        name: "Huffman Coding",
        summary:
          "Builds an optimal prefix code: repeatedly merge the two least frequent trees, then read codes off the root-to-leaf paths.",
        time: "O(n log n)",
        space: "O(n)",
        code: `typedef struct Node {
    char ch;
    int freq;
    struct Node *left, *right;
} Node;

Node *buildHuffman(Node *forest[], int n) {
    while (n > 1) {
        int a = minIndex(forest, n, -1);
        int b = minIndex(forest, n, a);
        Node *m = newNode(forest[a]->freq
                        + forest[b]->freq);
        m->left  = forest[a];
        m->right = forest[b];
        forest[a] = m;               /* replace one    */
        forest[b] = forest[--n];     /* drop the other */
    }
    return forest[0];
}

void printCodes(Node *t, char buf[], int d) {
    if (!t->left && !t->right) {
        buf[d] = '\\0';
        printf("%c: %s\\n", t->ch, buf);
        return;
    }
    buf[d] = '0'; printCodes(t->left,  buf, d + 1);
    buf[d] = '1'; printCodes(t->right, buf, d + 1);
}`,
        pseudo: `record Node
    ch
    freq
    left, right                          ▸ NIL for a leaf
end record

function BuildHuffman(forest, n)
    while n > 1
        a ← index of the lightest tree
        b ← index of the next lightest
        m ← new Node with freq
                  forest[a].freq + forest[b].freq
        m.left  ← forest[a]              ▸ 0 goes left
        m.right ← forest[b]              ▸ 1 goes right
        forest[a] ← m                    ▸ replace one
        forest[b] ← forest[--n]          ▸ drop the other
    end while
    return forest[0]                     ▸ the Huffman tree
end function

procedure PrintCodes(t, buf, d)
    if t is a leaf                       ▸ path spells its code
        buf[d] ← end of string
        output t.ch and buf
        return
    end if
    buf[d] ← '0'; PrintCodes(t.left,  buf, d+1)
    buf[d] ← '1'; PrintCodes(t.right, buf, d+1)
end procedure`,
      },
    ],
  },
  {
    slug: "backtracking",
    name: "Backtracking",
    tagline: "Explore, fail fast, undo",
    icon: Puzzle,
    algorithms: [
      {
        slug: "n-queens",
        name: "N-Queens",
        summary:
          "Places N queens on an N×N board so none attack each other, undoing placements the moment a conflict appears.",
        time: "O(N!)",
        space: "O(N)",
        code: `int safe(int board[], int row, int col) {
    for (int r = 0; r < row; r++) {
        if (board[r] == col) return 0;
        if (r - board[r] == row - col) return 0;
        if (r + board[r] == row + col) return 0;
    }
    return 1;
}

int solve(int board[], int row, int n) {
    if (row == n) return 1;   /* all queens placed */
    for (int col = 0; col < n; col++) {
        if (safe(board, row, col)) {
            board[row] = col;
            if (solve(board, row + 1, n)) return 1;
            board[row] = -1;   /* backtrack */
        }
    }
    return 0;
}`,
        pseudo: `function Safe(board, row, col)
    for r ← 0 to row-1
        if board[r] = col then return false        ▸ same column
        if r - board[r] = row - col then return false   ▸ ╲
        if r + board[r] = row + col then return false   ▸ ╱
    end for
    return true
end function

function Solve(board, row, n)
    if row = n then return true          ▸ all queens placed
    for col ← 0 to n-1
        if Safe(board, row, col)
            board[row] ← col             ▸ place
            if Solve(board, row+1, n) then return true
            board[row] ← empty           ▸ backtrack
        end if
    end for
    return false                         ▸ this row has no option
end function`,
      },
      {
        slug: "sudoku",
        name: "Sudoku Solver",
        summary:
          "Fills empty cells one at a time, trying digits 1–9 and backtracking whenever a digit breaks the rules.",
        time: "O(9^m)",
        space: "O(m)",
        code: `int valid(int g[9][9], int r, int c, int d) {
    for (int i = 0; i < 9; i++) {
        if (g[r][i] == d || g[i][c] == d)
            return 0;
        if (g[3*(r/3) + i/3][3*(c/3) + i%3] == d)
            return 0;
    }
    return 1;
}

int solve(int g[9][9]) {
    for (int r = 0; r < 9; r++) {
        for (int c = 0; c < 9; c++) {
            if (g[r][c]) continue;
            for (int d = 1; d <= 9; d++) {
                if (valid(g, r, c, d)) {
                    g[r][c] = d;
                    if (solve(g)) return 1;
                    g[r][c] = 0;   /* backtrack */
                }
            }
            return 0;
        }
    }
    return 1;
}`,
        pseudo: `function Valid(g, r, c, d)
    for i ← 0 to 8
        if g[r][i] = d or g[i][c] = d    ▸ row or column clash
            return false
        if d is already in r,c's 3×3 box
            return false
    end for
    return true
end function

function Solve(g)
    for r ← 0 to 8
        for c ← 0 to 8
            if g[r][c] is filled then continue
            for d ← 1 to 9               ▸ try each digit
                if Valid(g, r, c, d)
                    g[r][c] ← d          ▸ place
                    if Solve(g) then return true
                    g[r][c] ← empty      ▸ backtrack
                end if
            end for
            return false                 ▸ no digit fits: back up
        end for
    end for
    return true                          ▸ no blanks left
end function`,
      },
      {
        slug: "rat-in-a-maze",
        name: "Rat in a Maze",
        summary:
          "Finds a path from the top-left to the bottom-right of a grid, marking the route and undoing it at dead ends.",
        time: "O(4^(N²))",
        space: "O(N²)",
        code: `#define N 4

int solve(int maze[N][N], int r, int c, int sol[N][N]) {
    if (r < 0 || c < 0 || r >= N || c >= N ||
        maze[r][c] == 0 || sol[r][c] == 1)
        return 0;

    sol[r][c] = 1;
    if (r == N - 1 && c == N - 1)
        return 1;   /* exit reached */

    if (solve(maze, r + 1, c, sol)) return 1;   /* down  */
    if (solve(maze, r, c + 1, sol)) return 1;   /* right */
    if (solve(maze, r - 1, c, sol)) return 1;   /* up    */
    if (solve(maze, r, c - 1, sol)) return 1;   /* left  */
    sol[r][c] = 0;   /* backtrack */
    return 0;
}`,
        pseudo: `N ← 4

function Solve(maze, r, c, sol)
    if (r,c) is off the board or
       maze[r][c] is a wall or sol[r][c] is on the path
        return false

    sol[r][c] ← on the path
    if r = N-1 and c = N-1
        return true                      ▸ exit reached

    if Solve(maze, r+1, c, sol) then return true   ▸ down
    if Solve(maze, r, c+1, sol) then return true   ▸ right
    if Solve(maze, r-1, c, sol) then return true   ▸ up
    if Solve(maze, r, c-1, sol) then return true   ▸ left
    sol[r][c] ← off the path             ▸ backtrack
    return false
end function`,
      },
      {
        slug: "subsets",
        name: "Subsets",
        summary:
          "Generates every subset of a set by, for each element, branching into taking it or leaving it out.",
        time: "O(2^n)",
        space: "O(n)",
        code: `void subsets(int a[], int n, int i, int cur[], int k) {
    if (i == n) {
        printSubset(cur, k);
        return;
    }
    cur[k] = a[i];              /* include a[i] */
    subsets(a, n, i + 1, cur, k + 1);
    /* backtrack: exclude a[i] */
    subsets(a, n, i + 1, cur, k);
}`,
        pseudo: `procedure Subsets(A, n, i, cur, k)
    if i = n
        output cur[0 .. k-1]             ▸ one complete subset
        return
    end if
    cur[k] ← A[i]                        ▸ include A[i]
    Subsets(A, n, i+1, cur, k+1)
    ▸ backtrack: exclude A[i]
    Subsets(A, n, i+1, cur, k)
end procedure`,
      },
      {
        slug: "permutations",
        name: "Permutations",
        summary:
          "Generates every ordering of a set by fixing each position in turn and swapping, then undoing the swap.",
        time: "O(n · n!)",
        space: "O(n)",
        code: `void permute(int a[], int n, int k) {
    if (k == n) {
        printPerm(a, n);
        return;
    }
    for (int i = k; i < n; i++) {
        swap(&a[k], &a[i]);
        permute(a, n, k + 1);
        swap(&a[k], &a[i]);   /* undo */
    }
}`,
        pseudo: `procedure Permute(A, n, k)
    if k = n
        output A                         ▸ one complete permutation
        return
    end if
    for i ← k to n-1
        swap A[k], A[i]                  ▸ fix A[i] at position k
        Permute(A, n, k+1)
        swap A[k], A[i]                  ▸ undo
    end for
end procedure`,
      },
    ],
  },
  {
    slug: "trees",
    name: "Trees",
    tagline: "Hierarchies, balancing & queries",
    icon: Binary,
    algorithms: [
      {
        slug: "bst",
        name: "Binary Search Tree",
        summary:
          "Ordered tree where every left subtree is smaller and every right subtree larger — insert, search and delete all follow one root-to-leaf path.",
        time: "O(h)",
        space: "O(n)",
        code: `typedef struct Node {
    int key;
    struct Node *left, *right;
} Node;

Node *insert(Node *root, int key) {
    if (root == NULL)
        return newNode(key);
    if (key < root->key)
        root->left = insert(root->left, key);
    else if (key > root->key)
        root->right = insert(root->right, key);
    return root;
}

Node *search(Node *root, int key) {
    while (root && root->key != key)
        root = key < root->key ? root->left
                               : root->right;
    return root;
}

Node *deleteNode(Node *root, int key) {
    if (root == NULL) return NULL;
    if (key < root->key)
        root->left = deleteNode(root->left, key);
    else if (key > root->key)
        root->right = deleteNode(root->right, key);
    else {
        if (!root->left)  return root->right;
        if (!root->right) return root->left;
        Node *m = minNode(root->right);
        root->key = m->key;
        root->right = deleteNode(root->right, m->key);
    }
    return root;
}`,
        pseudo: `record Node
    key
    left, right
end record

function Insert(root, key)
    if root = NIL
        return new Node(key)             ▸ found the empty slot
    if key < root.key
        root.left ← Insert(root.left, key)
    else if key > root.key
        root.right ← Insert(root.right, key)
    return root                          ▸ duplicates ignored
end function

function Search(root, key)
    while root ≠ NIL and root.key ≠ key
        root ← if key < root.key then root.left
                                 else root.right
    return root                          ▸ NIL when absent
end function

function Delete(root, key)
    if root = NIL then return NIL
    if key < root.key
        root.left ← Delete(root.left, key)
    else if key > root.key
        root.right ← Delete(root.right, key)
    else
        if root has no left  then return root.right
        if root has no right then return root.left
        m ← smallest node in root.right  ▸ in-order successor
        root.key ← m.key                 ▸ copy it up
        root.right ← Delete(root.right, m.key)
    end if
    return root
end function`,
      },
      {
        slug: "avl",
        name: "AVL Tree",
        summary:
          "A self-balancing BST: after each insert it checks balance factors and rotates so the height stays O(log n).",
        time: "O(log n)",
        space: "O(n)",
        code: `int height(Node *n) { return n ? n->height : 0; }
int bf(Node *n) {
    return n ? height(n->left) - height(n->right) : 0;
}

Node *rotateRight(Node *y) {
    Node *x = y->left;
    y->left = x->right;
    x->right = y;
    fixHeight(y); fixHeight(x);
    return x;
}

Node *rotateLeft(Node *x) {
    Node *y = x->right;
    x->right = y->left;
    y->left = x;
    fixHeight(x); fixHeight(y);
    return y;
}

Node *insert(Node *n, int key) {
    if (!n) return newNode(key);
    if (key < n->key) n->left = insert(n->left, key);
    else n->right = insert(n->right, key);
    fixHeight(n);
    int b = bf(n);
    if (b > 1 && key < n->left->key)
        return rotateRight(n);
    if (b < -1 && key > n->right->key)
        return rotateLeft(n);
    if (b > 1 && key > n->left->key) {
        n->left = rotateLeft(n->left);
        return rotateRight(n);
    }
    if (b < -1 && key < n->right->key) {
        n->right = rotateRight(n->right);
        return rotateLeft(n);
    }
    return n;
}`,
        pseudo: `function Height(n) → n.height, or 0 for NIL
function BF(n)                            ▸ balance factor
    return Height(n.left) - Height(n.right)
end function

function RotateRight(y)
    x ← y.left
    y.left ← x.right                     ▸ x's right subtree moves
    x.right ← y                          ▸ y drops under x
    fix heights of y then x
    return x                             ▸ x is the new root
end function

function RotateLeft(x)
    y ← x.right
    x.right ← y.left
    y.left ← x
    fix heights of x then y
    return y
end function

function Insert(n, key)
    if n = NIL then return new Node(key)
    if key < n.key then n.left ← Insert(n.left, key)
    else n.right ← Insert(n.right, key)
    fix height of n
    b ← BF(n)                            ▸ |b| ≤ 1 must hold
    if b > 1 and key < n.left.key        ▸ Left-Left
        return RotateRight(n)
    if b < -1 and key > n.right.key      ▸ Right-Right
        return RotateLeft(n)
    if b > 1 and key > n.left.key        ▸ Left-Right
        n.left ← RotateLeft(n.left)
        return RotateRight(n)
    end if
    if b < -1 and key < n.right.key      ▸ Right-Left
        n.right ← RotateRight(n.right)
        return RotateLeft(n)
    end if
    return n
end function`,
      },
      {
        slug: "heap",
        name: "Binary Heap",
        summary:
          "A complete binary tree stored in an array; push sifts a value up and pop sinks the last element down to restore the max-heap order.",
        time: "O(log n)",
        space: "O(n)",
        code: `void siftUp(int h[], int i) {
    while (i > 0 && h[i] > h[(i - 1) / 2]) {
        swap(&h[i], &h[(i - 1) / 2]);
        i = (i - 1) / 2;
    }
}

void push(int h[], int *n, int val) {
    h[*n] = val;
    siftUp(h, (*n)++);
}

void siftDown(int h[], int n, int i) {
    for (;;) {
        int l = 2*i+1, r = 2*i+2, big = i;
        if (l < n && h[l] > h[big]) big = l;
        if (r < n && h[r] > h[big]) big = r;
        if (big == i) break;
        swap(&h[i], &h[big]);
        i = big;
    }
}

int pop(int h[], int *n) {
    int top = h[0];
    h[0] = h[--(*n)];
    siftDown(h, *n, 0);
    return top;
}`,
        pseudo: `procedure SiftUp(h, i)                    ▸ after a push
    while i > 0 and h[i] > h[parent(i)]
        swap h[i], h[parent(i)]
        i ← parent(i)
    end while
end procedure

procedure Push(h, n, val)
    h[n] ← val                           ▸ append at the end
    SiftUp(h, n++)                       ▸ then bubble it up
end procedure

procedure SiftDown(h, n, i)               ▸ after a pop
    loop
        l ← 2i+1, r ← 2i+2, big ← i
        if l < n and h[l] > h[big] then big ← l
        if r < n and h[r] > h[big] then big ← r
        if big = i then break            ▸ heap restored
        swap h[i], h[big]
        i ← big
    end loop
end procedure

function Pop(h, n)
    top ← h[0]                           ▸ the maximum
    h[0] ← h[--n]                        ▸ last element to the root
    SiftDown(h, n, 0)
    return top
end function`,
      },
      {
        slug: "trie",
        name: "Trie (Prefix Tree)",
        summary:
          "A tree keyed by characters: each root-to-node path spells a prefix, so insert and lookup cost only the length of the word.",
        time: "O(L)",
        space: "O(Σ · N)",
        code: `#define R 26
typedef struct Trie {
    struct Trie *next[R];
    int end;
} Trie;

void insert(Trie *root, const char *w) {
    Trie *node = root;
    for (int i = 0; w[i]; i++) {
        int c = w[i] - 'a';
        if (!node->next[c])
            node->next[c] = newTrie();
        node = node->next[c];
    }
    node->end = 1;
}

int search(Trie *root, const char *w) {
    Trie *node = root;
    for (int i = 0; w[i]; i++) {
        int c = w[i] - 'a';
        if (!node->next[c]) return 0;
        node = node->next[c];
    }
    return node->end;
}`,
        pseudo: `R ← 26
record Trie
    next[R]                              ▸ one child per letter
    end                                  ▸ true if a word stops here
end record

procedure Insert(root, w)
    node ← root
    for i ← 0 to length(w)-1
        c ← index of w[i]
        if node.next[c] = NIL
            node.next[c] ← new Trie      ▸ extend the path
        node ← node.next[c]
    end for
    node.end ← true                      ▸ mark the word's end
end procedure

function Search(root, w)
    node ← root
    for i ← 0 to length(w)-1
        c ← index of w[i]
        if node.next[c] = NIL then return false   ▸ no such path
        node ← node.next[c]
    end for
    return node.end                      ▸ word, or only a prefix?
end function`,
      },
      {
        slug: "segment-tree",
        name: "Segment Tree",
        summary:
          "A binary tree over array ranges: each node stores an aggregate (here, a sum) so range queries resolve in O(log n) by combining O(log n) covering nodes.",
        time: "O(log n) query",
        space: "O(n)",
        code: `int tree[4 * MAXN];

void build(int a[], int node, int lo, int hi) {
    if (lo == hi) {
        tree[node] = a[lo];
        return;
    }
    int mid = (lo + hi) / 2;
    build(a, 2*node, lo, mid);
    build(a, 2*node+1, mid+1, hi);
    tree[node] = tree[2*node] + tree[2*node+1];
}

int query(int node, int lo, int hi, int l, int r) {
    if (r < lo || hi < l) return 0;
    if (l <= lo && hi <= r) return tree[node];
    int mid = (lo + hi) / 2;
    return query(2*node, lo, mid, l, r)
         + query(2*node+1, mid+1, hi, l, r);
}`,
        pseudo: `let tree[4·MAXN]

procedure Build(A, node, lo, hi)
    if lo = hi
        tree[node] ← A[lo]               ▸ a leaf is one element
        return
    end if
    mid ← (lo + hi)/2
    Build(A, 2·node, lo, mid)
    Build(A, 2·node+1, mid+1, hi)
    tree[node] ← tree[2·node] + tree[2·node+1]
end procedure

function Query(node, lo, hi, l, r)
    if [lo,hi] and [l,r] do not overlap then return 0
    if [lo,hi] lies inside [l,r] then return tree[node]
    mid ← (lo + hi)/2                    ▸ partial: split
    return Query(2·node, lo, mid, l, r)
         + Query(2·node+1, mid+1, hi, l, r)
end function`,
      },
    ],
  },
  {
    slug: "strings",
    name: "Strings",
    tagline: "Pattern matching & palindromes",
    icon: Type,
    algorithms: [
      {
        slug: "kmp",
        name: "KMP",
        summary:
          "Knuth-Morris-Pratt: precomputes a longest-prefix-suffix table so a mismatch never rescans the text — linear-time pattern matching.",
        time: "O(n + m)",
        space: "O(m)",
        code: `void computeLPS(const char *p, int m, int lps[]) {
    int len = 0;
    lps[0] = 0;
    for (int i = 1; i < m; ) {
        if (p[i] == p[len]) {
            lps[i++] = ++len;
        } else if (len > 0) {
            len = lps[len - 1];
        } else {
            lps[i++] = 0;
        }
    }
}

void kmp(const char *t, const char *p) {
    int n = strlen(t), m = strlen(p);
    int lps[m];
    computeLPS(p, m, lps);

    int i = 0, j = 0;
    while (i < n) {
        if (t[i] == p[j]) {
            i++; j++;
            if (j == m) {
                printf("found at %d\\n", i - j);
                j = lps[j - 1];
            }
        } else if (j > 0) {
            j = lps[j - 1];
        } else {
            i++;
        }
    }
}`,
        pseudo: `procedure ComputeLPS(p, m, lps)            ▸ prefix = suffix lengths
    len ← 0, i ← 1
    lps[0] ← 0
    while i < m
        if p[i] = p[len]
            lps[i++] ← ++len             ▸ prefix grew
        else if len > 0
            len ← lps[len-1]             ▸ fall back, do not restart
        else
            lps[i++] ← 0
        end if
    end while
end procedure

procedure KMP(t, p)
    n ← length(t), m ← length(p)
    let lps[m]
    ComputeLPS(p, m, lps)

    i ← 0, j ← 0                         ▸ i never moves backwards
    while i < n
        if t[i] = p[j]
            i ← i+1, j ← j+1
            if j = m
                report a match at i-j
                j ← lps[j-1]             ▸ keep scanning
            end if
        else if j > 0
            j ← lps[j-1]                 ▸ reuse the table
        else
            i ← i+1
        end if
    end while
end procedure`,
      },
      {
        slug: "rabin-karp",
        name: "Rabin-Karp",
        summary:
          "Hashes the pattern and each text window with a rolling hash, verifying character-by-character only when hashes collide.",
        time: "O(n + m) avg",
        space: "O(1)",
        code: `#define BASE 256
#define MOD 1000000007

void rabinKarp(const char *t, const char *p) {
    int n = strlen(t), m = strlen(p);
    long ph = 0, th = 0, pow = 1;
    for (int i = 0; i < m; i++) {
        ph = (ph * BASE + p[i]) % MOD;
        th = (th * BASE + t[i]) % MOD;
        if (i) pow = (pow * BASE) % MOD;
    }
    for (int i = 0; i + m <= n; i++) {
        if (ph == th) {
            int k = 0;
            while (k < m && t[i + k] == p[k]) k++;
            if (k == m) printf("found at %d\\n", i);
        }
        if (i + m < n) {
            th = ((th - t[i] * pow) * BASE
                  + t[i + m]) % MOD;
            if (th < 0) th += MOD;
        }
    }
}`,
        pseudo: `BASE ← 256
MOD ← a large prime

procedure RabinKarp(t, p)
    n ← length(t), m ← length(p)
    ph ← 0, th ← 0, pow ← 1
    for i ← 0 to m-1                     ▸ hash pattern + first window
        ph ← (ph·BASE + p[i]) mod MOD
        th ← (th·BASE + t[i]) mod MOD
        if i > 0 then pow ← (pow·BASE) mod MOD
    end for
    for i ← 0 while i+m ≤ n
        if ph = th                       ▸ hashes agree
            k ← 0
            while k < m and t[i+k] = p[k]: k ← k+1   ▸ verify
            if k = m then report a match at i
        end if
        if i+m < n                       ▸ roll the window
            th ← ((th - t[i]·pow)·BASE
                  + t[i+m]) mod MOD
            if th < 0 then th ← th + MOD
        end if
    end for
end procedure`,
      },
      {
        slug: "z-algorithm",
        name: "Z-Algorithm",
        summary:
          "Computes, for every position, the length of the longest substring starting there that matches a prefix of the string — reusing a [l, r) window.",
        time: "O(n)",
        space: "O(n)",
        code: `void zArray(const char *s, int n, int z[]) {
    z[0] = n;
    int l = 0, r = 0;
    for (int i = 1; i < n; i++) {
        if (i < r)
            z[i] = min(r - i, z[i - l]);
        while (i + z[i] < n &&
               s[z[i]] == s[i + z[i]])
            z[i]++;
        if (i + z[i] > r) {
            l = i;
            r = i + z[i];
        }
    }
}`,
        pseudo: `procedure ZArray(s, n, z)                 ▸ z[i] = prefix match at i
    z[0] ← n
    l ← 0, r ← 0                         ▸ rightmost known match
    for i ← 1 to n-1
        if i < r
            z[i] ← min(r-i, z[i-l])      ▸ reuse the mirror
        while i + z[i] < n and
               s[z[i]] = s[i + z[i]]
            z[i] ← z[i] + 1              ▸ extend by comparing
        if i + z[i] > r
            l ← i
            r ← i + z[i]                 ▸ new rightmost window
        end if
    end for
end procedure`,
      },
      {
        slug: "boyer-moore",
        name: "Boyer-Moore",
        summary:
          "Compares the pattern right to left and uses the bad-character table to leap past hopeless alignments — often sublinear in practice.",
        time: "O(n/m) best",
        space: "O(σ)",
        code: `#define R 256

void badChar(const char *p, int m, int last[R]) {
    for (int c = 0; c < R; c++) last[c] = -1;
    for (int i = 0; i < m; i++)
        last[(int)p[i]] = i;
}

void boyerMoore(const char *t, const char *p) {
    int n = strlen(t), m = strlen(p);
    int last[R];
    badChar(p, m, last);

    int s = 0;
    while (s <= n - m) {
        int j = m - 1;
        while (j >= 0 && p[j] == t[s + j])
            j--;
        if (j < 0) {
            printf("found at %d\\n", s);
            s += 1;
        } else {
            int shift = j - last[(int)t[s + j]];
            s += shift > 1 ? shift : 1;
        }
    }
}`,
        pseudo: `R ← 256

procedure BadChar(p, m, last)             ▸ rightmost index per char
    for c ← 0 to R-1: last[c] ← -1
    for i ← 0 to m-1
        last[p[i]] ← i                   ▸ later wins
end procedure

procedure BoyerMoore(t, p)
    n ← length(t), m ← length(p)
    let last[R]
    BadChar(p, m, last)

    s ← 0                                ▸ current alignment
    while s ≤ n-m
        j ← m-1
        while j ≥ 0 and p[j] = t[s+j]    ▸ compare right to left
            j ← j-1
        if j < 0
            report a match at s
            s ← s+1
        else
            shift ← j - last[t[s+j]]     ▸ align the bad character
            s ← s + max(shift, 1)
        end if
    end while
end procedure`,
      },
      {
        slug: "manacher",
        name: "Manacher's Algorithm",
        summary:
          "Finds the longest palindromic substring in linear time by expanding around centers and mirroring radii across the current palindrome.",
        time: "O(n)",
        space: "O(n)",
        code: `/* transform: "aba" -> "^#a#b#a#$" */
int manacher(const char *t, int n, int p[]) {
    int c = 0, r = 0, best = 0;
    for (int i = 1; i < n - 1; i++) {
        if (i < r)
            p[i] = min(r - i, p[2 * c - i]);
        while (t[i + p[i] + 1] == t[i - p[i] - 1])
            p[i]++;
        if (i + p[i] > r) {
            c = i;
            r = i + p[i];
        }
        if (p[i] > best) best = p[i];
    }
    return best;
}`,
        pseudo: `▸ transform: "aba" → "^#a#b#a#$" so every centre is odd
function Manacher(t, n, p)
    c ← 0, r ← 0, best ← 0               ▸ centre and right edge
    for i ← 1 to n-2
        if i < r
            p[i] ← min(r-i, p[2c-i])     ▸ mirror inside the window
        while t[i + p[i] + 1] = t[i - p[i] - 1]
            p[i] ← p[i] + 1              ▸ expand outwards
        if i + p[i] > r
            c ← i
            r ← i + p[i]                 ▸ new rightmost window
        end if
        if p[i] > best then best ← p[i]
    end for
    return best                          ▸ half-length of the longest
end function`,
      },
    ],
  },
  {
    slug: "math",
    name: "Math / Number Theory",
    tagline: "Primes, GCD & modular arithmetic",
    icon: Sigma,
    algorithms: [
      {
        slug: "sieve-of-eratosthenes",
        name: "Sieve of Eratosthenes",
        summary:
          "Finds every prime up to n by crossing out the multiples of each prime, starting from its square.",
        time: "O(n log log n)",
        space: "O(n)",
        code: `void sieve(int n) {
    int prime[n + 1];
    for (int i = 0; i <= n; i++) prime[i] = 1;
    prime[0] = prime[1] = 0;

    for (int p = 2; p * p <= n; p++) {
        if (!prime[p]) continue;
        for (int m = p * p; m <= n; m += p)
            prime[m] = 0;      /* cross out multiple */
    }

    for (int i = 2; i <= n; i++)
        if (prime[i]) printf("%d ", i);
}`,
        pseudo: `procedure Sieve(n)
    let prime[0 .. n]
    for i ← 0 to n: prime[i] ← true      ▸ innocent until crossed
    prime[0] ← prime[1] ← false

    for p ← 2 while p·p ≤ n              ▸ p > √n cannot be least
        if prime[p] is false then continue
        for m ← p·p to n step p           ▸ smaller multiples are done
            prime[m] ← false             ▸ cross out multiple
    end for

    for i ← 2 to n
        if prime[i] then output i        ▸ every survivor is prime
end procedure`,
      },
      {
        slug: "euclidean-gcd",
        name: "Euclidean Algorithm (GCD)",
        summary:
          "Computes the greatest common divisor by replacing the pair (a, b) with (b, a mod b) until the remainder is zero.",
        time: "O(log min(a, b))",
        space: "O(1)",
        code: `int gcd(int a, int b) {
    while (b != 0) {
        int r = a % b;    /* a = q*b + r */
        a = b;
        b = r;
    }
    return a;
}`,
        pseudo: `function GCD(a, b)
    while b ≠ 0
        r ← a mod b                      ▸ a = q·b + r
        a ← b
        b ← r                            ▸ gcd(a,b) = gcd(b,r)
    end while
    return a                             ▸ last non-zero remainder
end function`,
      },
      {
        slug: "extended-euclidean",
        name: "Extended Euclidean Algorithm",
        summary:
          "Runs Euclid while tracking Bézout coefficients, so it ends with gcd(a, b) = x·a + y·b — the key to modular inverses.",
        time: "O(log min(a, b))",
        space: "O(1)",
        code: `void extendedGcd(int a, int b) {
    int old_r = a, r = b;
    int old_s = 1, s = 0;     /* coeff of a */
    int old_t = 0, t = 1;     /* coeff of b */
    while (r != 0) {
        int q = old_r / r;
        int tmp;
        tmp = old_r - q*r; old_r = r; r = tmp;
        tmp = old_s - q*s; old_s = s; s = tmp;
        tmp = old_t - q*t; old_t = t; t = tmp;
    }
    printf("gcd = %d = %d*a + %d*b\\n",
           old_r, old_s, old_t);
}`,
        pseudo: `procedure ExtendedGCD(a, b)                ▸ also finds x, y
    old_r ← a, r ← b
    old_s ← 1, s ← 0                     ▸ coefficient of a
    old_t ← 0, t ← 1                     ▸ coefficient of b
    while r ≠ 0                          ▸ every row keeps r = s·a + t·b
        q ← ⌊old_r / r⌋
        ▸ step each pair forward by q
        (old_r, r) ← (r, old_r - q·r)
        (old_s, s) ← (s, old_s - q·s)
        (old_t, t) ← (t, old_t - q·t)
    end while
    output gcd = old_r
         = old_s·a + old_t·b             ▸ Bézout's identity
end procedure`,
      },
      {
        slug: "fast-exponentiation",
        name: "Fast Exponentiation",
        summary:
          "Computes baseᵉˣᵖ mod m in O(log exp) by squaring the base and multiplying it in only where the exponent has a 1-bit.",
        time: "O(log exp)",
        space: "O(1)",
        code: `long long power(long long b, long long e, long long m) {
    long long result = 1;
    b %= m;
    while (e > 0) {
        if (e & 1)                /* low bit set? */
            result = result * b % m;
        b = b * b % m;            /* square */
        e >>= 1;                  /* shift right */
    }
    return result;
}`,
        pseudo: `function Power(b, e, m)                    ▸ b^e mod m
    result ← 1
    b ← b mod m                          ▸ keep numbers small
    while e > 0
        if e is odd                      ▸ low bit set?
            result ← result·b mod m      ▸ fold this power in
        b ← b·b mod m                    ▸ square for the next bit
        e ← ⌊e / 2⌋                      ▸ shift right
    end while
    return result                        ▸ O(log e) multiplications
end function`,
      },
    ],
  },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getAlgorithm(
  categorySlug: string,
  algorithmSlug: string
): { category: Category; algorithm: Algorithm } | undefined {
  const category = getCategory(categorySlug);
  const algorithm = category?.algorithms.find(
    (a) => a.slug === algorithmSlug
  );
  if (!category || !algorithm) return undefined;
  return { category, algorithm };
}
