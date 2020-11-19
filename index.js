const { Engine, Render, Runner, World, Bodies, MouseConstraint, Mouse } = Matter;
const engine = Engine.create();
const { world } = engine;

const width = 800;
const height = 600;
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
World.add(world, MouseConstraint.create(engine, {
    mouse: Mouse.create(render.canvas)
}));

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const shapes = [];
for (let i = 0; i < 50; i++) {
    let x = getRandomIntInclusive(0 + 50, width - 50);
    let y = getRandomIntInclusive(0 + 50, height - 50);
    let shape;
    let rand = Math.random();
        if (rand > 0.75)    {shape = Bodies.rectangle(x, y, 50, 50)}    else
        if (rand > 0.5)     {shape = Bodies.circle(x, y, 30)}           else
        if (rand > 0.25)    {shape = Bodies.polygon(x, y, 5, 30)}       else
                            {shape = Bodies.trapezoid(x, y, 50, 50, 1)}

    shapes.push(shape);
}

World.add(world, shapes);

// Walls
const walls = [
    Bodies.rectangle(400, 0, 800, 40, { isStatic: true}),
    Bodies.rectangle(400, 600, 800, 40, { isStatic: true}),
    Bodies.rectangle(0, 300, 40,600, { isStatic: true}),
    Bodies.rectangle(800, 300, 40, 600, { isStatic: true})
]
World.add(world, walls);