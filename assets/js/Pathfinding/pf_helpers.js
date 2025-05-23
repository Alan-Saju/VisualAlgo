/** @module PathfindingHelperFunctions */

/**
 * Gets all nodes bordering the current node.
 * @param {Object[][]} grid - 2d array of nodes
 * @param {Object} v - The current node
 * @returns {Object[]} - A list of nodes adjacent to v
 */
function getNeighbours(grid, v) {
  var nbs = [];

  if (v.col - 1 >= 0 && grid[v.row][v.col - 1]) {
    if (grid[v.row][v.col - 1].type != "wall")
      // push left neighbour
      nbs.push(grid[v.row][v.col - 1]);
  }
  if (v.col + 1 < grid[0].length && grid[v.row][v.col + 1]) {
    if (grid[v.row][v.col + 1].type != "wall")
      // push right neighbour
      nbs.push(grid[v.row][v.col + 1]);
  }
  if (v.row - 1 >= 0 && grid[v.row - 1][v.col]) {
    if (grid[v.row - 1][v.col].type != "wall")
      // push upper neighbour
      nbs.push(grid[v.row - 1][v.col]);
  }
  if (v.row + 1 < grid.length && grid[v.row + 1][v.col]) {
    if (grid[v.row + 1][v.col].type != "wall")
      // push lower neighbour
      nbs.push(grid[v.row + 1][v.col]);
  }

  return nbs;
}

/**
 * Resets the grid and every node to their initial state.
 * @param {Object[][]} grid - 2d array of objects representing the grid
 */
function resetGrid(grid) {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      // reset distances, fScores, predecessors and visited status of every node
      grid[y][x].dist = Infinity;
      grid[y][x].fScore = Infinity;
      grid[y][x].predecessor = undefined;
      grid[y][x].visited = false;

      // color cell white if it's a floor tile or grey if it's a weight
      if (grid[y][x].type != "wall" && grid[y][x].type != "weight") {
        d3.select("#node-" + y + "-" + x).attr("fill", "#FFF");
      } else if (grid[y][x].type == "weight") {
        d3.select("#node-" + y + "-" + x).attr("fill", "#B0B0B0");
      }
    }
  }
}

/**
 * Animates the stick figure to move from start to target.
 * @param {Object[]} list - List of nodes in the path
 */
async function makeHimRun(list) {
  // loop over the path list
  // and adjust the position of the stick figure
  for (let i in list) {
    d3.select("#start")
      .transition()
      .duration(50)
      .attr("x", list[i].x)
      .attr("y", list[i].y);
    await timeout(50);
  }
  await timeout(200);
  // teleport the stick figure back to the start
  var x = gridData[startPos.y][startPos.x].x;
  var y = gridData[startPos.y][startPos.x].y;
  d3.select("#start").attr("x", x).attr("y", y);
}

/**
 * Reads predecessors starting from the target node and colors the path.
 * @param {Object[][]} grid - 2d array of nodes representing the grid
 * @param {Object} end - Row and column of the target node
 */
async function makePath(grid, end) {
  await timeout(500);
  var list = [];
  var v = grid[end.y][end.x];
  list.unshift(v);
  // step through the predecessors until We  hit the start node.
  // color every node on the way and save the path in a list.
  while (v.predecessor != undefined) {
    await colorBlock("#node-" + v.row + "-" + v.col, "#cc1616", 250, 15);
    v = grid[v.predecessor.row][v.predecessor.col];
    list.unshift(v);
  }

  list.unshift(v);
  // animate the stick figure
  makeHimRun(list);
}

/**
 * Creates a list of all nodes in a grid.
 * @param {Object[][]} grid - 2d array of nodes representing the grid
 * @returns {Object} - List of all the nodes in the grid
 */
function makeQueueFromGrid(grid) {
  let q = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      q.push(grid[y][x]);
    }
  }
  return q;
}

/**
 * Function for finding the index of a given node in the queue.
 * @param {Object[]} q - List of unvisited nodes
 * @param {Object[]} neighbours - List of neighbours of the current node
 * @param {number} n - The index of the currently selected neighbouring node
 * @returns {number} - The index of the currently selected neighbouring node in the queue
 */
function findIndex(q, neighbours, n) {
  return q.findIndex(
    (elem) => elem.x == neighbours[n].x && elem.y == neighbours[n].y
  );
}

/**
 * Updates the minimum distance and predecessor of the given node.
 * @param {Object} node - The node which should be updated
 * @param {Object} v - The new predecessor
 * @param {Object} newDist - The new minimum distance
 */
function updateNode(node, v, newDist) {
  node.dist = newDist;
  node.predecessor = { row: v.row, col: v.col };
}

/**
 * Finds the node with the lowest distance value.
 * @param {Object[]} q - Queue of all unvisited nodes
 * @param {Object} closest - Node with currently has the lowest distance value
 * @param {number} ind - Index of closest within q
 * @returns {Object} - The node with the lowest distance value
 */
function getClosestNode(q, closest, ind) {
  // gradually find node with lowest distance
  // by looping through q and updating 'closest'
  // when needed
  for (let i = 0; i < q.length; i++) {
    if (closest.dist > q[i].dist) {
      closest = q[i];
      ind = i;
    }
  }
  // remove the closest node from q
  // and return it
  q.splice(ind, 1);
  return closest;
}

/**
 * Colors visited nodes a light red.
 * @param {Object} node - The node which should be colored.
 */
async function colorVisited(node) {
  await colorBlock(
    "#node-" + node.row + "-" + node.col,
    "#FF8B84",
    500,
    30,
    "fill"
  );
}
