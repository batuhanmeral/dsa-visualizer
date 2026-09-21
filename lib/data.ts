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
    if (r == N - 1 && c == N - 1) {
        sol[r][c] = 1;
        return 1;
    }
    if (r < 0 || c < 0 || r >= N || c >= N ||
        maze[r][c] == 0 || sol[r][c] == 1)
        return 0;

    sol[r][c] = 1;
    if (solve(maze, r + 1, c, sol)) return 1;   /* down  */
    if (solve(maze, r, c + 1, sol)) return 1;   /* right */
    if (solve(maze, r - 1, c, sol)) return 1;   /* up    */
    if (solve(maze, r, c - 1, sol)) return 1;   /* left  */
    sol[r][c] = 0;   /* backtrack */
    return 0;
}`,
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
