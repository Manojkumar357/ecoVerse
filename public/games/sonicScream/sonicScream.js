// CONSTANTS
const SHIPOFFSET = 120;
const SHIPSPEED = 2;
const BARRIERSPACE = 100;
const SHIPPROJECTILECOUNTDOWN = 100;
const SHIPPROJECTILESPEED = 10;
const SONICSCREAMCOOLDOWN = 5;

const maxSpeed = {
  x: 5,
  y: 5,
};

const healthTxt = document.getElementById("health");
const enemyHealthTxt = document.getElementById("enemyHealth");

// VARIABLES
var gameStats = {
  playerHealth: 100,
  enemyHealth: 100,
};

var boatMovement = {
  left: false,
  speed: SHIPSPEED,
};

var shipProjectileTimer = 0;
var sonicScreamTimer = SONICSCREAMCOOLDOWN;

var audio = new Audio('../Assets/sounds/scream.mp3');


// MATTER JS

// define constants for matter.js
var Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Body = Matter.Body,
  Composite = Matter.Composite,
  Composites = Matter.Composites,
  Constraint = Matter.Constraint,
  Common = Matter.Common,
  MouseConstraint = Matter.MouseConstraint,
  Mouse = Matter.Mouse,
  Vector = Matter.Vector,
  // Svg = Matter.Svg,
  Events = Matter.Events;

window.onload = function () {
  // create an engine
  var engine = Engine.create();

  console.log(window.innerWidth, window.innerHeight);

  fishCxt = fishCanvas.getContext("2d");

  // first render variable
  var render = Render.create({
    element: document.getElementById("canvasContainer"),
    engine: engine,
    canvas: fishCanvas,
    options: {
      width: 800,
      height: 600,
      // showAngleIndicator: true,
      // showCollisions: true,
      // showVelocity: true,
      wireframes: false,
      background: "#2475bd",
    },
  });

  //////////////// COLLISION FILTERING ////////////////
  var defaultCategory = 0x0001,
    shipBodyCategory = 0x0002,
    shipBeamCategory = 0x0004,
    rozxieBodyCategory = 0x0008,
    playerCategory = 0x0010,
    waveCategory = 0x0020,
    projectileCategory = 0x0040;

  //////////////// MOUSE ////////////////

  // add mouse control
  var mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.9,
        render: {
          visible: false,
        },
      },
    });

  Composite.add(engine.world, mouseConstraint);

  // keep the mouse in sync with rendering
  render.mouse = mouse;

  /////////////// BORDERS ///////////////

  // define a static ground (the *2 for width is cause canvas width is half the actual thing apparently)
  var ground = Bodies.rectangle(
    render.canvas.width / 2 - 50,
    render.canvas.height,
    render.canvas.width,
    50,
    {
      collisionFilter: {
        category: playerCategory,
        mask: playerCategory,
      },
      isStatic: true,
      friction: 0.5,
      render: {
        fillStyle: "#36c247",
        strokeStyle: "green",
        lineWidth: 0,
        visible: false,
      },
    }
  );

  var ceiling = Bodies.rectangle(
    render.canvas.width / 2 - 50,
    100,
    render.canvas.width,
    50,
    {
      collisionFilter: {
        category: playerCategory,
        mask: playerCategory,
      },
      friction: 0.5,
      isStatic: true,
      render: {
        fillStyle: "#36c247",
        strokeStyle: "green",
        lineWidth: 0,
        visible: false,
      },
    }
  );

  var leftWall = Bodies.rectangle(
    -50,
    render.canvas.height / 2,
    50,
    render.canvas.height,
    {
      collisionFilter: {
        category: playerCategory,
        mask: playerCategory,
      },
      friction: 0.5,
      isStatic: true,
      render: {
        fillStyle: "#36c247",
        strokeStyle: "green",
        lineWidth: 0,
        visible: false,
      },
    }
  );

  var rightWall = Bodies.rectangle(
    render.canvas.width - 50,
    render.canvas.height / 2,
    50,
    render.canvas.height,
    {
      collisionFilter: {
        category: playerCategory,
        mask: playerCategory,
      },
      friction: 0.5,
      isStatic: true,
      render: {
        fillStyle: "#36c247",
        strokeStyle: "green",
        lineWidth: 0,
        visible: false,
      },
    }
  );

  /////////////// SHIP ///////////////

  var group = Body.nextGroup(true);
  var ship = Composite.create({ label: "ship" });

  var shipRigBeam = Bodies.rectangle(
    render.canvas.width / 2 - 50,
    render.canvas.height / 2 - 150 - SHIPOFFSET,
    800,
    20,
    {
      collisionFilter: {
        category: shipBeamCategory,
        mask: shipBeamCategory,
      },
      isStatic: true,
      friction: 0.8,
      render: {
        fillStyle: "#36c247",
        strokeStyle: "green",
        lineWidth: 0,
        visible: false,
      },
    }
  );

  var shipRigBeamTop = Bodies.rectangle(
    render.canvas.width / 2 - 50,
    render.canvas.height / 2 - 200 - SHIPOFFSET,
    800,
    20,
    {
      collisionFilter: {
        category: shipBeamCategory,
        mask: shipBeamCategory,
      },
      isStatic: true,
      friction: 0.8,
      render: {
        fillStyle: "#36c247",
        strokeStyle: "green",
        lineWidth: 0,
        visible: false,
      },
    }
  );

  var shipRigBeamLeft = Bodies.rectangle(
    render.canvas.width / 2 - 50 - 800 / 2,
    render.canvas.height / 2 - 200 - SHIPOFFSET,
    10,
    80,
    {
      collisionFilter: {
        category: shipBeamCategory,
        mask: shipBeamCategory,
      },
      isStatic: true,
      render: {
        fillStyle: "#36c247",
        strokeStyle: "green",
        lineWidth: 0,
        visible: false,
      },
    }
  );

  var shipRigBeamRight = Bodies.rectangle(
    render.canvas.width / 2 - 50 + 800 / 2,
    render.canvas.height / 2 - 200 - SHIPOFFSET,
    10,
    80,
    {
      collisionFilter: {
        category: shipBeamCategory,
        mask: shipBeamCategory,
      },
      isStatic: true,
      render: {
        fillStyle: "#36c247",
        strokeStyle: "green",
        lineWidth: 0,
        visible: false,
      },
    }
  );

  var shipCastor = Bodies.rectangle(
    render.canvas.width / 2 - 50,
    render.canvas.height / 2 - 170 - SHIPOFFSET,
    100,
    20,
    {
      collisionFilter: {
        category: shipBeamCategory,
        mask: shipBeamCategory,
      },
      // isStatic: true,
      render: {
        fillStyle: "#36c247",
        strokeStyle: "green",
        lineWidth: 0,
        visible: false,
      },
    }
  );

  var shipBody = Bodies.rectangle(
    render.canvas.width / 2 - 50,
    render.canvas.height / 2 - 50 - SHIPOFFSET,
    100,
    20,
    {
      collisionFilter: {
        category: shipBodyCategory,
        mask: shipBodyCategory,
      },
      render: {
        fillStyle: "#36c247",
        strokeStyle: "green",
        lineWidth: 0,
        sprite: {
          texture: "../Assets/images/sonicScream/shipRight.png",
          xScale: 0.5,
          yScale: 0.5,
          yOffset: 0.15,
        },
      },
    }
  );

  var shipLeftConstraint = Constraint.create({
    bodyA: shipCastor,
    pointA: { x: -70, y: 0 },
    bodyB: shipBody,
    pointB: { x: -40, y: 0 },
    stiffness: 0.005,
    render: {
      visible: false,
    },

  });

  var shipRightConstraint = Constraint.create({
    bodyA: shipCastor,
    pointA: { x: 70, y: 0 },
    bodyB: shipBody,
    pointB: { x: 40, y: 0 },
    stiffness: 0.005,
    render: {
      visible: false,
    },
  });

  Composite.addBody(ship, shipBody);
  Composite.addBody(ship, shipRigBeam);
  Composite.addBody(ship, shipRigBeamTop);
  Composite.addBody(ship, shipCastor);
  Composite.addBody(ship, shipRigBeamLeft);
  Composite.addBody(ship, shipRigBeamRight);

  Composite.addConstraint(ship, shipLeftConstraint);
  Composite.addConstraint(ship, shipRightConstraint);

  /////////////// WAVES ///////////////

  var group = Body.nextGroup(true);

  var waves = Bodies.rectangle(
    render.canvas.width / 2 - 50,
    render.canvas.height / 2,
    10,
    10,
    {
      collisionFilter: {
        category: waveCategory,
        mask: waveCategory,
      },
      isStatic: true,
      render: {
        fillStyle: "#36c247",
        strokeStyle: "green",
        lineWidth: 0,
        sprite: {
          texture: "../Assets/images/sonicScream/bg2.png",
          xScale: 1.6,
          yScale: 1.2,
        },
      },
    }
  );

  /////////////// ROZXIE ///////////////

  var rozxie = Bodies.rectangle(
    render.canvas.width / 2 + 150,
    render.canvas.height / 2,
    50,
    20,
    {
      collisionFilter: {
        category: rozxieBodyCategory | defaultCategory | playerCategory,
        mask: rozxieBodyCategory | defaultCategory | playerCategory,
      },
      chamfer: {
        radius: 25 * 0.5,
      },
      render: {
        fillStyle: "#36c247",
        strokeStyle: "green",
        lineWidth: 0,
        sprite: {
          texture: "../Assets/images/sonicScream/originalhair.png",
          xScale: 0.15,
          yScale: 0.15,
        },
      },
    }
  );

  /////////////// SHIP PROJECTILES ///////////////

  var group = Body.nextGroup(true);
  var shipProjectiles = Composite.create({ label: "shipProjectiles" });

  Composite.add(engine.world, shipProjectiles);

  function createShipProjectile(x, y, angle, left) {
    var spawnX = x;
    if (left) {
      spawnX += 50;
    } else {
      spawnX -= 50;
    }

    var shipProjectile = Bodies.circle(spawnX, y, 10, {
      collisionFilter: {
        category: rozxieBodyCategory,
        mask: rozxieBodyCategory,
      },
      label: "shipProjectile",
      inertia: Infinity,
      render: {
        fillStyle: "#36c247",
        strokeStyle: "green",
        lineWidth: 0,
        sprite: {
          texture: "../Assets/images/sonicScream/bubble.png",
          xScale: 0.3,
          yScale: 0.3,
        },
      },
    });

    Body.setVelocity(shipProjectile, {
      x: Math.cos(angle) * SHIPPROJECTILESPEED,
      y: Math.sin(angle) * SHIPPROJECTILESPEED,
    });

    Composite.add(shipProjectiles, shipProjectile);
  }

  /////////////// ROZXIE PROJECTILES ///////////////

  var group = Body.nextGroup(true);
  var rozxieProjectiles = Composite.create({ label: "rozxieProjectiles" });

  Composite.add(engine.world, rozxieProjectiles);

  function createRozxieProjectile(x, y) {
    var rozxieProjectile = Bodies.circle(x, y, 10, {
      collisionFilter: {
        category: shipBodyCategory,
        mask: shipBodyCategory,
      },
      // isStatic: true,
      label: "rozxieProjectile",
      inertia: Infinity,
      render: {
        fillStyle: "#36c247",
        strokeStyle: "green",
        lineWidth: 0,
        sprite: {
          texture: "../Assets/images/sonicScream/sonicScream1.png",
          xScale: 0.1,
          yScale: 0.1,
        },
      },
    });

    Body.setVelocity(rozxieProjectile, {
      x: 0,
      y: -10,
    });

    Composite.add(rozxieProjectiles, rozxieProjectile);
  }

  /////////////// PROJECTILE DESPAWN BARRIER ///////////////
  var group = Body.nextGroup(true);
  var despawnBarrier = Composite.create({ label: "despawnBarrier" });

  // define a static ground (the *2 for width is cause canvas width is half the actual thing apparently)
  var lowerBarrier = Bodies.rectangle(
    render.canvas.width / 2 - 50,
    render.canvas.height + BARRIERSPACE,
    render.canvas.width + BARRIERSPACE * 2,
    50,
    {
      collisionFilter: {
        category: rozxieBodyCategory | shipBodyCategory,
        mask: rozxieBodyCategory | shipBodyCategory,
      },
      label: "barrierBlock",
      isStatic: true,
      isSensor: true,
      render: {
        fillStyle: "#36c247",
        strokeStyle: "green",
        lineWidth: 0,
        visible: false,
      },
    }
  );

  var upperBarrier = Bodies.rectangle(
    render.canvas.width / 2 - 50,
    0 - BARRIERSPACE,
    render.canvas.width + BARRIERSPACE * 2,
    50,
    {
      collisionFilter: {
        category: rozxieBodyCategory | shipBodyCategory,
        mask: rozxieBodyCategory | shipBodyCategory,
      },
      isStatic: true,
      label: "barrierBlock",
      isSensor: true,
      render: {
        fillStyle: "#36c247",
        strokeStyle: "green",
        lineWidth: 0,
        visible: false,
      },
    }
  );

  var leftBarrier = Bodies.rectangle(
    -50 - BARRIERSPACE,
    render.canvas.height / 2,
    50,
    render.canvas.height + BARRIERSPACE * 2,
    {
      collisionFilter: {
        category: rozxieBodyCategory | shipBodyCategory,
        mask: rozxieBodyCategory | shipBodyCategory,
      },
      label: "barrierBlock",
      isStatic: true,
      isSensor: true,
      render: {
        fillStyle: "#36c247",
        strokeStyle: "green",
        lineWidth: 0,
        visible: false,
      },
    }
  );

  var rightBarrier = Bodies.rectangle(
    render.canvas.width - 50 + BARRIERSPACE,
    render.canvas.height / 2,
    50,
    render.canvas.height + BARRIERSPACE * 2,
    {
      collisionFilter: {
        category: rozxieBodyCategory | shipBodyCategory,
        mask: rozxieBodyCategory | shipBodyCategory,
      },
      isStatic: true,
      label: "barrierBlock",
      isSensor: true,
      render: {
        fillStyle: "#36c247",
        strokeStyle: "green",
        lineWidth: 0,
        visible: false,
      },
    }
  );

  Composite.addBody(despawnBarrier, lowerBarrier);
  Composite.addBody(despawnBarrier, upperBarrier);
  Composite.addBody(despawnBarrier, leftBarrier);
  Composite.addBody(despawnBarrier, rightBarrier);

  /////////////// EVENTS ///////////////

  Events.on(engine, "collisionStart", (_) => {
    // https://stackoverflow.com/questions/47207541/matter-js-how-to-remove-bodies-after-collision

    _.pairs.forEach((pair) => {
      // if the projectile is in the despawn barrier, remove it
      if (pair.bodyA.label === "barrierBlock") {
        if (pair.bodyB.label === "rozxieProjectile") {
          World.remove(rozxieProjectiles, pair.bodyB);
        } else {
          World.remove(shipProjectiles, pair.bodyB);
        }
      }
      if (pair.bodyB.label === "barrierBlock") {
        if (pair.bodyB.label === "rozxieProjectile") {
          World.remove(rozxieProjectiles, pair.bodyA);
        } else {
          World.remove(shipProjectiles, pair.bodyA);
        }
      }

      if (pair.bodyA === shipBody) {
        console.log("ship hit");
        gameStats.enemyHealth -= 25;
        enemyHealthTxt.innerHTML = gameStats.enemyHealth;
        if (gameStats.enemyHealth <= 0) {
          location.href = '../transitionPages/driftNet.html'
        }
        World.remove(rozxieProjectiles, pair.bodyB);
      }

      if (pair.bodyA === rozxie) {
        console.log("rozxie hit");
        gameStats.playerHealth -= 10;
        healthTxt.innerHTML  = gameStats.playerHealth;
        if (gameStats.playerHealth <= 0) {
          alert("You lose! Try again!");
          
        }
        World.remove(shipProjectiles, pair.bodyB);
      }
    });
  });

  // Events.on(engine, "collisionEnd", function (event) {
  //   var pairs = event.pairs;
  // });

  // Events.on(mouseConstraint, "mousedown", function (event) {});

  gravity = engine.world.gravity;

  Events.on(engine, "afterUpdate", function () {
    // Make Roxie face upright
    Body.setAngularVelocity(rozxie, rozxie.angle * -0.0001);

    // Make Roxie have lower gravity
    Body.setVelocity(rozxie, {
      x: rozxie.velocity.x,
      y: rozxie.velocity.y - 0.25 * gravity.y,
    });

    // move the boat
    if (boatMovement.left) {
      if (shipCastor.position.x < 50) {
        boatMovement.left = false;
        Body.setVelocity(shipCastor, {
          x: shipCastor.velocity.x - 0.5,
          y: shipCastor.velocity.y,
        });
        shipBody.render.sprite.texture =
          "../Assets/images/sonicScream/shipRight.png";
      } else {
        Body.setVelocity(shipCastor, {
          x: -SHIPSPEED,
          y: shipCastor.velocity.y,
        });
      }
    } else {
      if (shipCastor.position.x > render.canvas.width - 150) {
        boatMovement.left = true;
        Body.setVelocity(shipCastor, {
          x: shipCastor.velocity.x + 0.5,
          y: shipCastor.velocity.y,
        });
        shipBody.render.sprite.texture =
          "../Assets/images/sonicScream/shipLeft.png";
      } else {
        Body.setVelocity(shipCastor, {
          x: SHIPSPEED,
          y: shipCastor.velocity.y,
        });
      }
    }

    // Give the projectiles zero gravity
    rozxieProjectiles.bodies.forEach(function (projectile) {
      Body.applyForce(projectile, projectile.position, {
        x: 0,
        y: -projectile.mass * gravity.y * 0.001,
      });
    });

    shipProjectiles.bodies.forEach(function (projectile) {
      Body.applyForce(projectile, projectile.position, {
        x: 0,
        y: -projectile.mass * gravity.y * 0.001,
      });
    });

    // Ship projectile timer
    shipProjectileTimer += 1;

    if (shipProjectileTimer > SHIPPROJECTILECOUNTDOWN) {
      shipProjectileTimer = 0;

      // fire projectile
      createShipProjectile(
        shipBody.position.x,
        shipBody.position.y,
        (90 / 180) * Math.PI,
        boatMovement.left
      );
      createShipProjectile(
        shipBody.position.x,
        shipBody.position.y,
        (45 / 180) * Math.PI,
        boatMovement.left
      );

      createShipProjectile(
        shipBody.position.x,
        shipBody.position.y,
        (135 / 180) * Math.PI,
        boatMovement.left
      );

      console.log("fired ship projectile");
    }


    sonicScreamTimer += 1;

    if (sonicScreamTimer > SHIPPROJECTILECOUNTDOWN) {
      sonicScreamTimer = SHIPPROJECTILECOUNTDOWN + 1;
    }

  });

  //////////////////// CONTROLS ////////////////////

  document.addEventListener("keypress", function (e) {
    var addedVelocity = {
      x: 0,
      y: 0,
    };

    if (e.key === "w") {
      addedVelocity.y = -4;
    }

    if (e.key === "s") {
      addedVelocity.y = 4;
    }

    if (e.key === "a") {
      addedVelocity.x = -4;
    }

    if (e.key === "d") {
      addedVelocity.x = 4;
    }

    if (e.key === " ") {
      // shoot projectile
      if (sonicScreamTimer > SHIPPROJECTILECOUNTDOWN) {
        sonicScreamTimer = 0;
        audio.play();
        createRozxieProjectile(rozxie.position.x, rozxie.position.y);

      }
    }

    finalVelocity = {
      x: 0,
      y: 0,
    };

    if (rozxie.velocity.x + addedVelocity.x > maxSpeed.x) {
      finalVelocity.x = maxSpeed.x;
    } else if (rozxie.velocity.x + addedVelocity.x < -maxSpeed.x) {
      finalVelocity.x = -maxSpeed.x;
    } else {
      finalVelocity.x = rozxie.velocity.x + addedVelocity.x;
    }

    if (rozxie.velocity.y + addedVelocity.y > maxSpeed.y) {
      finalVelocity.y = maxSpeed.y;
    } else if (rozxie.velocity.y + addedVelocity.y < -maxSpeed.y) {
      finalVelocity.y = -maxSpeed.y;
    } else {
      finalVelocity.y = rozxie.velocity.y + addedVelocity.y;
    }

    Body.setVelocity(rozxie, {
      x: finalVelocity.x,
      y: finalVelocity.y,
    });
  });

  // add all of the bodies to the world
  World.add(engine.world, [
    ground,
    ceiling,
    leftWall,
    rightWall,
    waves,
    rozxie,
    ship,
    despawnBarrier,
  ]);

  // fit the render viewport to the scene
  Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: 700, y: 600 },
  });

  // run the engine
  Runner.run(engine);

  // run the renderer
  Render.run(render);

  console.log("All loaded!");
};
