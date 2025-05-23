//https://github.com/luukdv/color.js/blob/master/src/color.ts
//By luukdv
//Modified by Catoblepon
//Edits: make it JS, took out average function (only needed prominent); changed "new gap = 4 * args.sample" to "new gap = 4"

const getSrc = (item) => 
    typeof item === 'string' ? item : item.src;

const getArgs = ({
    amount = 3,
    format = 'array',
    group = 20,
    sample = 10,
} = {}) => ({ amount, format, group, sample });

const format = (input, args) => {
    const list = input.map((val) => {
        const rgb = Array.isArray(val) ? val : val.split(',').map(Number);
        return args.format === 'hex' ? rgbToHex(rgb) : rgb;
    });

    return args.amount === 1 || list.length === 1 ? list[0] : list;
};

const group = (number, grouping) => {
    const grouped = Math.round(number / grouping) * grouping;
    return Math.min(grouped, 255);
};

const rgbToHex = (rgb) => 
    '#' + rgb.map((val) => {
        const hex = val.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');

const getImageData = (src) => 
    new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.height = img.height;
            canvas.width = img.width;
            context.drawImage(img, 0, 0);

            const data = context.getImageData(0, 0, img.width, img.height).data;
            resolve(data);
        };

        img.onerror = () => reject(new Error('Image loading failed.'));
        img.crossOrigin = '';
        img.src = src;
    });

const getProminent = (data, args) => {
    const gap = 4;
    const colors = {};

    for (let i = 0; i < data.length; i += gap) {
        const rgb = [
            group(data[i], args.group),
            group(data[i + 1], args.group),
            group(data[i + 2], args.group),
        ].join();

        colors[rgb] = colors[rgb] ? colors[rgb] + 1 : 1;
    }

    return format(
        Object.entries(colors)
            .sort(([_keyA, valA], [_keyB, valB]) => valA > valB ? -1 : 1)
            .slice(0, args.amount)
            .map(([rgb]) => rgb),
        args
    );
};

const process = (handler, item, args) => 
    new Promise((resolve, reject) => 
        getImageData(getSrc(item))
            .then((data) => resolve(handler(data, getArgs(args))))
            .catch((error) => reject(error))
    );

const prominent = (item, args) => process(getProminent, item, args);

export { prominent };