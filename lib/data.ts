import {
  BarChart3,
  Boxes,
  Layers,
  Puzzle,
  Search,
  Share2,
  type LucideIcon,
} from "lucide-react";

export interface Algorithm {
  slug: string;
  name: string;
  summary: string;
  time: string;
  space: string;
  code: string;
  /** Code language shown in the viewer. Defaults to "c". */
  language?: "c" | "java";
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

void bellmanFord(int graph[V][V], int src, int dist[V]) {
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
    int count = 0;
    for (int col = 0; col < n; col++) {
        if (safe(board, row, col)) {
            board[row] = col;
            count += solve(board, row + 1, n);
            /* board[row] is overwritten next try */
        }
    }
    return count;
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
