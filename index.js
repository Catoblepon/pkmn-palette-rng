import { prominent } from "./color.js";

let c = document.getElementById('pkmn-img');
let ctx = c.getContext('2d', { willReadFrequently: true });
const image = new Image();
let img_src;
let img_data;
let data;
let primary_colours;
let pkmn_data;

document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("loader").style.display = "none";
    document.getElementById("pkmn-btn").disabled = true;
    document.getElementById("colour-btn").disabled = true;
    try {
        const response = await fetch("./pokemon-info.json");
        pkmn_data = await response.json().then(data => {
            document.getElementById("pkmn-btn").disabled = false;
            return data;
    });
    } catch (error) {
        console.error("Error loading JSON:", error);
    }
});

function randomNumber(max) {
    return Math.floor(Math.random() * max) + 1;
}

function createImage() {
    if (!img_src) return;
    image.src = img_src;
    ctx.clearRect(0, 0, 40, 30);
    document.getElementById("loader").style.display = "block";
    document.getElementById("pkmn-btn").disabled = true;
    image.onload = function() {
        setTimeout(() => {
            document.getElementById("loader").style.display = "none";
            ctx.drawImage(image, 0, 0, 40, 30);
            document.getElementById("colour-btn").disabled = false;
            document.getElementById("pkmn-btn").disabled = false;
        }, 450);
    };
}

function getNames(id) {
    document.getElementById("name-en").innerHTML = pkmn_data[id].name.en;
    document.getElementById("name-jp").innerHTML = pkmn_data[id].name.jp;
    if(pkmn_data[id].type) document.getElementById("typing").innerHTML = "( " + pkmn_data[id].type + " )";
    else document.getElementById("typing").innerHTML = "";
}

function checkIfSimilar(info, SecondaryColor, i, j) {
    return Math.abs(info[i]-SecondaryColor[j][0]) +
           Math.abs(info[i+1]-SecondaryColor[j][1]) +
           Math.abs(info[i+2]-SecondaryColor[j][2]) < 50;
}

document.getElementById("pkmn-btn").addEventListener("click", async function () {
    let id = randomNumber(Object.keys(pkmn_data).length);
    img_src = './pokemon/' + id + '.png';
    createImage();
    getNames(id);
    primary_colours = await prominent(img_src, { amount: 16 });
});

document.getElementById("colour-btn").addEventListener("click", async function () {
    ctx.drawImage(image, 0, 0, 40, 30);
    img_data = ctx.getImageData(0, 0, 40, 30, { colorSpace: 'srgb' });
    const secondary_colours = new Array(primary_colours.length).fill(0).map(() => [
        randomNumber(255), randomNumber(255), randomNumber(255)
    ]);

    for (let i = 0; i < img_data.data.length; i += 4) {

        if (img_data.data[i] == 32 && img_data.data[i+1] == 32 && img_data.data[i+2] == 32) {
            continue;
        }

        if (img_data.data[i+3] == 0) {
            continue;
        }

        for (let j = 0; j < primary_colours.length; j++) {
            if(checkIfSimilar(img_data.data, primary_colours, i, j)) {
                img_data.data[i] = secondary_colours[j][0];
                img_data.data[i + 1] = secondary_colours[j][1];
                img_data.data[i + 2] = secondary_colours[j][2];
                img_data.data[i + 3] = 255;
                break;
            }
        }

    }
    ctx.putImageData(img_data, 0, 0);
});
