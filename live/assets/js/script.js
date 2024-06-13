import { loadWasm, runProgram } from "./helpers.js";


// load wasm files

// Aldrin is a 2d computer graphics library written in C
// Aldrin also uses wasm to display graphics on js canvas
// see github.com/orhanemree/aldrin for more

// reg for linear regression (this project)
let aldrinWasm, aldrinExports, regWasm, regExports, regWasmMemory;

window.onload = async () => {

    aldrinWasm = await loadWasm("wasm/aldrin.wasm");
    aldrinExports = aldrinWasm.instance.exports;

    regWasm = await loadWasm("wasm/linear-regression.wasm");
    regExports = regWasm.instance.exports;
    regWasmMemory = new DataView(regExports.memory.buffer);

    // clear canvas
    runProgram(aldrinExports, canvas, "aldrin_fill(ac, 0xffffff)", 1, 0);
}


let xCoords = [];
let yCoords = [];
let n;

const canvas = document.querySelector("canvas#c");
canvas.onclick = e => {

    // store points

    xCoords.push(e.x);
    yCoords.push(e.y);

    n = xCoords.length;

    // minimum 2 point wanted for the algorithm
    if (n >= 2) {
        calculate();
        display();    
    }
}


let m, b;

// where the linear regression magic happens
const calculate = () => {

    // set arg pointers to pass C function
    const xPtr = 0; // 0 by default -not sure if its a good idea
    const yPtr = xPtr + n*8;

    // y = mx + b
    const mPtr = yPtr + n*8;
    const bPtr = mPtr + 8;


    // write function arguments to memory to pass C
    const xMemory = new Float64Array(regExports.memory.buffer, xPtr, n);
    xMemory.set(xCoords);

    const yMemory = new Float64Array(regExports.memory.buffer, yPtr, n);
    yMemory.set(yCoords);

    regWasmMemory.setFloat64(mPtr, 0.0, true); // 0.0 by default
    regWasmMemory.setFloat64(bPtr, 0.0, true); // 0.0 by default

    
    regExports.calculateFormula(xPtr, yPtr, n, mPtr, bPtr);
    m = regWasmMemory.getFloat64(mPtr, true);
    b = regWasmMemory.getFloat64(bPtr, true);
}


// where the Aldrin graphics magic happen
const display = () => {

    // clear canvas
    runProgram(aldrinExports, canvas, "aldrin_fill(ac, 0xffffff)", 1, 0);

    // display points
    for (let i = 0; i < n; ++i) {
        const program = `aldrin_fill_circle(ac, ${xCoords[i]}, ${yCoords[i]}, 3, 0xff0000)`;
        runProgram(aldrinExports, canvas, program, 0, 0);
    }

    // display the regression line
    
    // find two coordinates to display
    const x1 = 0;
    const y1 = m*x1+b;

    const x2 = 300;
    const y2 = m*x2+b;

    const program = `aldrin_draw_line(ac, ${x1}, ${y1}, ${x2}, ${y2}, 0x00ff00, 2)`;
    runProgram(aldrinExports, canvas, program, 0, 0);
}