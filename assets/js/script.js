import { loadWasm, runProgram } from "./helpers.js";


const WIDTH = 300;
const HEIGHT = 300;

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

    console.log(regExports);

    // clear canvas
    runProgram(aldrinExports, canvas, "aldrin_fill(ac, 0xffffff)", 1, 0);
}


let xCoords = [];
let yCoords = [];
let n;


// data points added by click


const canvas = document.querySelector("canvas#c");
canvas.onclick = e => {

    // store points

    xCoords.push(e.offsetX);
    yCoords.push(e.offsetY);

    n = xCoords.length;

    console.log(xCoords);
    console.log(yCoords);

    // minimum 2 point wanted for the algorithm
    if (n >= 2) {
        calculate();
        display();
        calculateRSquared();
    }
}



// data file uploaded 
const datasetInput = document.querySelector("input#upload-dataset");
const datasetControlsCont = document.querySelector("#upload-dataset-controls-cont");
const datasetControlsX = datasetControlsCont.querySelector("#upload-dataset-controls-x");
const datasetControlsY = datasetControlsCont.querySelector("#upload-dataset-controls-y");

let datasetRows = [];

datasetInput.onchange = e => {
    const file = e.target.files[0];

    if (!file) { return };

    const reader = new FileReader();
    reader.onload = e => {

        datasetControlsX.innerHTML = `<option value=""></option>`;
        datasetControlsY.innerHTML = `<option value=""></option>`;

        const text = e.target.result;
        const rows = text.split("\n");

        const cols = rows[0].split(",");

        // parse col names
        for (let i = 0; i < cols.length; ++i) {

            const col = cols[i];

            // add option to X and Y controls
            const optionX = document.createElement("option");
            optionX.innerText = col;
            optionX.value = i;
            datasetControlsX.appendChild(optionX);

            const optionY = document.createElement("option");
            optionY.innerText = col;
            optionY.value = i;
            datasetControlsY.appendChild(optionY);
        }


        // parse row values
        for (let i = 1; i < rows.length; ++i) {

            const row = rows[i];

            datasetRows.push(row.split(","));
        }
    }

    reader.readAsText(file);

    datasetControlsCont.style.display = "flex";
} 

let xValue, yValue;


datasetControlsX.onchange = e => {
    xValue = datasetControlsX.value;

    if (datasetControlsX.value && yValue) {
        displayDataset();
    }
}

datasetControlsY.onchange = e => {
    yValue = datasetControlsY.value;

    if (datasetControlsY.value && xValue) {
        displayDataset();
    }
}


const normalizeCoord = (c, oldMin, oldMax, newMin, newMax) => {
    return (c-oldMin)*(newMax-newMin)/(oldMax-oldMin)+newMin;
}


const displayDataset = () => {

    xCoords = datasetRows.map(r => parseInt(r[parseInt(xValue)]));
    xCoords = xCoords.map(c => normalizeCoord(c,
        Math.min(...xCoords), Math.max(...xCoords), 0, WIDTH));

    yCoords = datasetRows.map(r => parseInt(r[parseInt(yValue)]));
    yCoords = yCoords.map(c => HEIGHT - normalizeCoord(c,
        Math.min(...yCoords), Math.max(...yCoords), 0, HEIGHT));
    
    n = xCoords.length;

    // minimum 2 point wanted for the algorithm
    if (n >= 2) {
        calculate();
        display();
        calculateRSquared();
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

    const program = `aldrin_draw_line(ac, ${x1}, ${y1}, ${x2}, ${y2}, 0x00ff00, 3)`;
    runProgram(aldrinExports, canvas, program, 0, 0);
}



// calculate R-Squared score

const rSquaredScoreHolder = document.querySelector("#rsquared-score");

const calculateRSquared = () => {
    // set arg pointers to pass C function
    const xPtr = 0; // 0 by default -not sure if its a good idea
    const yPtr = xPtr + n*8;

    // write function arguments to memory to pass C
    const xMemory = new Float64Array(regExports.memory.buffer, xPtr, n);
    xMemory.set(xCoords);

    const yMemory = new Float64Array(regExports.memory.buffer, yPtr, n);
    yMemory.set(yCoords);

    const score = regExports.calculateRSquared(xPtr, yPtr, n, m, b);
    rSquaredScoreHolder.innerText = score;
}