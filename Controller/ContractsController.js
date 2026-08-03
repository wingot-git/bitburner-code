// Completes Coding Contracts
// 
// Explores all servers, finds all coding contracts, and attempts to solve them using known algorithms.

/** @param {NS} ns */
export async function main(ns) {
  ns.ui.openTail();
  const hostQueue = ["home"];
  const seen = new Set();
  const contracts = [];

  while (hostQueue.length > 0) {
    const host = hostQueue.shift();
    if (seen.has(host)) continue;
    seen.add(host);

    const files = ns.ls(host, ".cct");
    for (const file of files) {
      const type = ns.codingcontract.getContractType(file, host);
      ns.print(file + "is of type " + type);
      if (type) {
        contracts.push({ host, file, type });
      }
    }

    const neighbors = ns.scan(host);
    for (const neighbor of neighbors) {
      if (!seen.has(neighbor)) hostQueue.push(neighbor);
    }
  }

  for (const contract of contracts) {
    const data = ns.codingcontract.getData(contract.file, contract.host);
    const answer = solveContract(contract.type, data);

    if (answer === null || answer === undefined) {
      ns.tprint(`Unable to solve ${contract.type} on ${contract.host}/${contract.file}`);
      continue;
    }

    const result = ns.codingcontract.attempt(answer, contract.file, contract.host);
    if (result === "") {
      ns.tprint(`Failed ${contract.type} on ${contract.host}/${contract.file}`);
    } else {
      ns.tprint(`Solved ${contract.type} on ${contract.host}/${contract.file}: ${result}`);
    }

    await ns.sleep(10); // Sleep to avoid spamming the server with requests and hanging the game
  }
}

function solveContract(type, data) {
  switch (type) {
    case "Find Largest Prime Factor":
      return largestPrimeFactor(data);
    case "Subarray with Maximum Sum":
      return maximumSubarraySum(data);
    case "Total Ways to Sum":
      return totalWaysToSum(data);
    case "Unique Paths in a Grid I":
      return uniquePathsGrid1(data);
    // case "Unique Paths in a Grid II":
    //   return uniquePathsGrid2(data);
    case "Minimum Path Sum in a Triangle":
      return minimumPathSumTriangle(data);
    case "Array Jumping Game I":
      return arrayJumpingGame1(data);
    // case "Array Jumping Game II":
    //   return arrayJumpingGame2(data);
    case "Merge Overlapping Intervals":
      return mergeOverlappingIntervals(data);
    // case "Spiralize Matrix":
    //   return spiralizeMatrix(data);
    // case "HammingCodes: Integer to Encoded Binary":
    //   return hammingCodesIntegerToEncodedBinary(data);
    // case "HammingCodes: Encoded Binary to Integer":
    //   return hammingCodesEncodedBinaryToInteger(data);
    // case "Shortest Path in a Grid":
    //   return shortestPathInGrid(data);
    default:
      return null;
  }
}

function largestPrimeFactor(n) {
  let value = n;
  let factor = 2;
  while (factor * factor <= value) {
    while (value % factor === 0) {
      value /= factor;
    }
    factor += factor === 2 ? 1 : 2;
  }
  return value > 1 ? value : factor;
}

function maximumSubarraySum(arr) {
  let best = -Infinity;
  let current = -Infinity;
  for (const value of arr) {
    current = Math.max(value, current + value);
    best = Math.max(best, current);
  }
  return best;
}

function totalWaysToSum(n) {
  const dp = Array(n + 1).fill(0);
  dp[0] = 1;
  for (let part = 1; part < n; part++) {
    for (let sum = part; sum <= n; sum++) {
      dp[sum] += dp[sum - part];
    }
  }
  return dp[n];
}

function uniquePathsGrid1(data) {
  const [m, n] = data;
  return binomial(m + n - 2, Math.min(m - 1, n - 1));
}

function uniquePathsGrid2(data) {
  const [grid] = data;
  const rows = grid.length;
  const cols = grid[0].length;
  const dp = Array.from({ length: rows }, () => Array(cols).fill(0));
  dp[0][0] = grid[0][0] === 1 ? 0 : 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1) {
        dp[r][c] = 0;
      } else if (r === 0 && c === 0) {
        dp[r][c] = 1;
      } else if (r === 0) {
        dp[r][c] = dp[r][c - 1];
      } else if (c === 0) {
        dp[r][c] = dp[r - 1][c];
      } else {
        dp[r][c] = dp[r - 1][c] + dp[r][c - 1];
      }
    }
  }
  return dp[rows - 1][cols - 1] || 0;
}

function minimumPathSumTriangle(data) {
  const triangle = data;
  const dp = triangle.map((row) => row.slice());
  for (let r = triangle.length - 2; r >= 0; r--) {
    for (let c = 0; c < triangle[r].length; c++) {
      dp[r][c] += Math.min(dp[r + 1][c], dp[r + 1][c + 1]);
    }
  }
  return dp[0][0];
}

function arrayJumpingGame1(data) {
  const arr = data;
  let index = 0;
  while (index < arr.length - 1) {
    const maxReach = index + arr[index];
    if (maxReach <= index) return 0;
    let best = -1;
    let bestIndex = -1;
    for (let i = index + 1; i <= maxReach && i < arr.length; i++) {
      if (arr[i] + i > best) {
        best = arr[i] + i;
        bestIndex = i;
      }
    }
    if (bestIndex === -1) return 0;
    index = bestIndex;
  }
  return 1;
}

function arrayJumpingGame2(data) {
  const [arr] = data;
  let jumps = 0;
  let left = 0;
  let right = 0;
  if (arr.length === 1) return 0;

  while (right < arr.length - 1) {
    let farthest = right;
    for (let i = left; i <= right; i++) {
      farthest = Math.max(farthest, i + arr[i]);
    }
    left = right + 1;
    right = farthest;
    jumps++;
  }
  return jumps;
}

function mergeOverlappingIntervals(data) {
  const intervals = data.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const merged = [intervals[0]];
  for (const interval of intervals.slice(1)) {
    const last = merged[merged.length - 1];
    if (interval[0] <= last[1]) {
      last[1] = Math.max(last[1], interval[1]);
    } else {
      merged.push(interval);
    }
  }
  return JSON.stringify(merged);
}

function spiralizeMatrix(data) {
  const matrix = data.slice();
  const result = [];
  while (matrix.length > 0 && matrix[0].length > 0) {
    for (let c = 0; c < matrix[0].length; c++) result.push(matrix[0][c]);
    matrix.shift();
    for (let r = 0; r < matrix.length; r++) result.push(matrix[r][matrix[r].length - 1]);
    for (let c = matrix[0] ? matrix[0].length - 1 : -1; c >= 0; c--) {
      if (matrix.length > 0) result.push(matrix[matrix.length - 1][c]);
    }
    matrix.pop();
    for (let r = matrix.length - 1; r >= 0; r--) {
      if (matrix[r] && matrix[r].length > 0) result.push(matrix[r][0]);
    }
    for (let r = 0; r < matrix.length; r++) {
      matrix[r].shift();
    }
  }
  return result.join(",");
}

function hammingCodesIntegerToEncodedBinary(data) {
  const value = Number(data);
  if (!Number.isInteger(value) || value < 0) return null;

  const messageBits = value.toString(2).split("");
  const messageLength = messageBits.length;
  let parityBits = 0;
  while ((1 << parityBits) < messageLength + parityBits + 1) {
    parityBits++;
  }

  const totalLength = messageLength + parityBits;
  const codeword = Array(totalLength).fill("0");
  let messageIndex = 0;

  for (let position = 1; position <= totalLength; position++) {
    if ((position & (position - 1)) !== 0) {
      codeword[position - 1] = messageBits[messageIndex++];
    }
  }

  for (let parity = 0; parity < parityBits; parity++) {
    const parityPosition = 1 << parity;
    let parityValue = 0;

    for (let position = 1; position <= totalLength; position++) {
      if ((position & parityPosition) !== 0) {
        parityValue ^= Number(codeword[position - 1]);
      }
    }

    codeword[parityPosition - 1] = String(parityValue);
  }

  return codeword.join("");
}

function hammingCodesEncodedBinaryToInteger(data) {
  const codeword = String(data).split("").map((bit) => Number(bit));
  if (!codeword.length || codeword.some((bit) => bit !== 0 && bit !== 1)) {
    return null;
  }

  let parityBits = 0;
  while ((1 << parityBits) - 1 < codeword.length) {
    parityBits++;
  }

  let errorPosition = 0;
  for (let parity = 0; parity < parityBits; parity++) {
    const parityPosition = 1 << parity;
    let parityValue = 0;

    for (let position = 1; position <= codeword.length; position++) {
      if ((position & parityPosition) !== 0) {
        parityValue ^= codeword[position - 1];
      }
    }

    if (parityValue === 1) {
      errorPosition += parityPosition;
    }
  }

  if (errorPosition > 0 && errorPosition <= codeword.length) {
    codeword[errorPosition - 1] ^= 1;
  }

  const messageBits = [];
  for (let position = 1; position <= codeword.length; position++) {
    if ((position & (position - 1)) !== 0) {
      messageBits.push(codeword[position - 1]);
    }
  }

  return Number.parseInt(messageBits.join(""), 2);
}

function shortestPathInGrid(data) {
  const [grid] = data;
  const rows = grid.length;
  const cols = grid[0].length;
  const queue = [[0, 0, 0]];
  const seen = new Set(["0,0"]);

  while (queue.length > 0) {
    const [r, c, dist] = queue.shift();
    if (r === rows - 1 && c === cols - 1) return dist;

    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] === 1) continue;

      const key = `${nr},${nc}`;
      if (seen.has(key)) continue;

      seen.add(key);
      queue.push([nr, nc, dist + 1]);
    }
  }

  return -1;
}

function binomial(n, k) {
  if (k < 0 || k > n) return 0;
  if (k > n - k) k = n - k;
  let result = 1n;
  for (let i = 1; i <= k; i++) {
    result = (result * BigInt(n - k + i)) / BigInt(i);
  }
  return Number(result);
}

