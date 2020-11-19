const { Engine, Render, Runner, World, Bodies } = Matter;
const engine = Engine.create();
const { world } = engine;

const cells = 10;
const width = 900;
const height = 900;
const wallSize = 1;
const unitLength = width / cells;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: true,
        width,
        height }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
const walls = [
    Bodies.rectangle(width / 2, 0, width, 40, { isStatic: true}),
    Bodies.rectangle(width / 2, height, width, 40, { isStatic: true}),
    Bodies.rectangle(0, height / 2, 40, height, { isStatic: true}),
    Bodies.rectangle(width, height/2, 40, height, { isStatic: true})
]
// World.add(world, walls);

//Maze generation

const shuffle = (arr) => {
    let counter = arr.length;
    while (counter>0) {
        const index = Math.floor(Math.random() * counter);
        counter--;

        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }

    return arr;
}


const grid = Array(cells)
    .fill(null)
    .map(() => Array(cells).fill(false));

const verticals = Array(cells)
    .fill(null)
    .map(() => Array(cells-1).fill(false));

const horizontals = Array(cells-1)
    .fill(null)
    .map(() => Array(cells).fill(false));


const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);

const stepThroughCell = (row, column) => {
    // If I have visited the cell at [row, column], then return
    if (grid[row][column]) {
        return;
    }

    // Mark this cell as being visited
    grid[row][column] = true;

    // Assemble randomly-ordered list of neighbors
    const neighbors = shuffle([
        [row - 1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row, column - 1, 'left']
    ]);

    // For each neighbor..
    for (let neighbor of neighbors) {
        const [nextRow, nextColumn, direction] = neighbor;

        // See if that neighbor is out bounds
        if (nextRow < 0 ||
            nextRow >= cells ||
            nextColumn < 0 ||
            nextColumn >= cells) {
            continue; // skip the rest of the code and go to next neighbor
        }
        // If we have visited that neighbor, continue to next neighbor
        if (grid[nextRow][nextColumn]) {
            continue;
        }

        // Remove a wall from either horizontals or verticals
        if (direction === 'left') {
            verticals[row][column-1] = true;
        } else if (direction === 'right') {
            verticals[row][column] = true;
        } else if (direction === 'up') {
            horizontals[row-1][column] = true;
        } else if (direction === 'down') {
            horizontals[row][column] = true;
        }

        stepThroughCell(nextRow, nextColumn);
    }
    // Visit that next cell
}
stepThroughCell(startRow, startColumn);

horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }
        let x = columnIndex * unitLength + unitLength / 2;
        let y = rowIndex * unitLength + unitLength;
        const wall = Bodies.rectangle(x, y, unitLength, wallSize, {
            isStatic: true
        })
       World.add(world, wall);
    });
});
verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }
        let x = columnIndex * unitLength + unitLength;
        let y = rowIndex * unitLength + unitLength / 2;
        const wall = Bodies.rectangle(x, y, wallSize, unitLength, {
            isStatic: true
        })
        World.add(world, wall);
    });
});
