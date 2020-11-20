const { Engine, Render, Runner, World, Bodies, Body ,Events } = Matter;
const engine = Engine.create();
const { world } = engine;
engine.world.gravity.y = 0;



const cellsHorizontal = 10;
const cellsVertical = 6;

const width = window.innerWidth - 6;
const height = window.innerHeight - 8;

const wallSize = 3;

const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width,
        height }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
const walls = [
    Bodies.rectangle(   width/2,      0,        width,         wallSize,     {label: 'border', isStatic: true}),
    Bodies.rectangle(   width/2,    height,     width,         wallSize,     {label: 'border', isStatic: true}),
    Bodies.rectangle(   0,          height/2,   wallSize,      height,       {label: 'border', isStatic: true}),
    Bodies.rectangle(   width,      height/2,   wallSize,      height,       {label: 'border', isStatic: true})
]
World.add(world, walls);

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


const grid = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

const verticals = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal-1).fill(false));

const horizontals = Array(cellsHorizontal-1)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));


const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

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
            nextRow >= cellsVertical ||
            nextColumn < 0 ||
            nextColumn >= cellsHorizontal) {
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
        let x = columnIndex * unitLengthX + unitLengthX / 2;
        let y = rowIndex * unitLengthY + unitLengthY;
        const wall = Bodies.rectangle(x, y, unitLengthX, wallSize, {
            label: 'wall',
            isStatic: true,
            render: {
                fillStyle: 'lavenderblush'
            }
        })
        World.add(world, wall);
    });
});
verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }
        let x = columnIndex * unitLengthX + unitLengthX;
        let y = rowIndex * unitLengthY + unitLengthY / 2;
        const wall = Bodies.rectangle(x, y, wallSize, unitLengthY, {
            label: 'wall',
            isStatic: true,
            render: {
                fillStyle: 'lavenderblush'
            }
        })
        World.add(world, wall);
    });
});

// Goal
const goal = Bodies.rectangle(width - unitLengthX/2, height - unitLengthY/2, unitLengthX * 0.7, unitLengthY * 0.7, {
    label: 'goal',
    isStatic: true,
    render: {
        fillStyle: 'lawngreen',
    }
});
World.add(world, goal);

// Boal
let xBall = unitLengthX / 2;
let yBall = unitLengthY / 2;
let ballRadius = Math.min(unitLengthX, unitLengthY) / 2 * 0.7;
const ball = Bodies.circle(xBall, yBall, ballRadius, {
        label: 'ball',
        isStatic: false,
        render: {
            fillStyle: 'deepPink'
        }
    }
);
World.add(world, ball);
document.addEventListener('keydown', (event) => {
    const {x, y} = ball.velocity;
    if (event.keyCode === 87) {
        Body.setVelocity(ball, { x, y : y - 3})
    }
    if (event.keyCode === 68) {
        Body.setVelocity(ball, { x: x + 3, y})
    }
    if (event.keyCode === 83) {
        Body.setVelocity(ball, { x, y : y + 3})
    }
    if (event.keyCode === 65) {
        Body.setVelocity(ball, { x: x - 3, y})

    }
})

// Win condition

Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach((collision) => {
        const labels = ['ball', 'goal'];
        if (labels.includes(collision.bodyA.label) &&
            labels.includes(collision.bodyB.label)) {
            document.querySelector('.winner').classList.remove('hidden');
            world.gravity.y = 1;
            world.bodies.forEach((body => {
                if (body.label === 'wall') {
                    Body.setStatic(body, false);
                }
            }));
        }
    });
});