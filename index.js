import { prominent } from "./color.js";

let c = document.getElementById('pkmn-img');
let ctx = c.getContext('2d', { willReadFrequently: true });
const image = new Image();
let img_src;
let img_data;
let primary_colours;

function randomNumber(max) {
    return Math.floor(Math.random() * max) + 1;
}

function createImage() {
    if (!img_src) return;
    image.src = img_src;
    image.onload = function() {
        ctx.clearRect(0, 0, 40, 30);
        ctx.drawImage(image, 0, 0, 40, 30);
    };
}

function checkIfSimilar(info, SecondaryColor, i, j) {
    return Math.abs(info[i]-SecondaryColor[j][0]) +
           Math.abs(info[i+1]-SecondaryColor[j][1]) +
           Math.abs(info[i+2]-SecondaryColor[j][2]) < 50;
}

document.getElementById("pkmn-btn").addEventListener("click", async function () {
    img_src = './pokemon/' + randomNumber(1076) + '.png';
    createImage();
    primary_colours = await prominent(img_src, { amount: 16 });
});

document.getElementById("colour-btn").addEventListener("click", async function () {
    img_data = ctx.getImageData(0, 0, 40, 30, { colorSpace: 'srgb' });
    const secondary_colours = new Array(primary_colours.length).fill(0).map(() => [
        randomNumber(255), randomNumber(255), randomNumber(255)
    ]);

    for (let i = 0; i < img_data.data.length; i += 4) {
        
        if (img_data[i + 3] == 0) {
            continue;
        }

        for (let j = 0; j < primary_colours.length; j++) {
            if(checkIfSimilar(img_data.data, primary_colours, i, j)) {
                img_data.data[i] = secondary_colours[j][0];
                img_data.data[i + 1] = secondary_colours[j][1];
                img_data.data[i + 2] = secondary_colours[j][2];
                break;
            }
        }

    }
    ctx.putImageData(img_data, 0, 0);
    primary_colours = secondary_colours;
});
