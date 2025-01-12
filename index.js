const { readFileSync, writeFileSync, readdirSync, rmSync, existsSync, mkdirSync } = require('fs');
const sharp = require('sharp');
const mergeImages = require('merge-images');
const {Canvas,Image} = require('canvas');
const ImageDataURI = require('image-data-uri');
//Chupi is loca, Endri is loco
const template = `
    <svg width="1024" height="768" viewBox="0 0 1024 768" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- bg -->
        <!-- skin -->
        <!-- body -->
        <!-- blush -->
        <!-- eyes -->
        <!-- tears -->
        <!-- obj -->
        <!-- mouth -->
    </svg>
`

const takenNames = {};
const takenFaces = {};
let idx = 10;

function randInt(max) {
    return Math.floor(Math.random() * (max + 1));
}

function randElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}


function getRandomName() {
    const adjectives = 'fired trashy tubular nasty jacked swol buff ferocious firey flamin agnostic artificial bloody crazy cringey crusty dirty eccentric glutinous harry juicy simple stylish awesome creepy corny freaky shady sketchy lame sloppy hot intrepid juxtaposed killer ludicrous mangy pastey ragin rusty rockin sinful shameful stupid sterile ugly vascular wild young old zealous flamboyant super sly shifty trippy fried injured depressed anxious clinical'.split(' ');
    const names = 'aaron bart chad dale earl fred grady harry ivan jeff joe kyle lester steve tanner lucifer todd mitch hunter mike arnold norbert olaf plop quinten randy saul balzac tevin jack ulysses vince will xavier yusuf zack roger raheem rex dustin seth bronson dennis'.split(' ');
    
    const randAdj = randElement(adjectives);
    const randName = randElement(names);
    const name =  `${randAdj}-${randName}`;


    if (takenNames[name] || !name) {
        return getRandomName();
    } else {
        takenNames[name] = name;
        return name;
    }
}

function getLayerFull(name,folder, skip=0.0) {
    const svg = readFileSync(`./${folder}/${name}.svg`, 'utf-8');
    const re = /(?<=\<svg\s*[^>]*>)([\s\S]*?)(?=\<\/svg\>)/g
    const layer = svg.match(re)[0];
    return Math.random() > skip ? layer : '';
}
function getPath(folder, name){
    return `./${folder}/${name}.png`
}
function getLayer(name, skip=0.01){
    return getLayerFull(name,"download",skip)
}
async function svgToPng(name) {
    const src = `./out/${name}.svg`;
    const dest = `./out/${name}.png`;

    const img = await sharp(src);
    const resized = await img.resize(1024);
    await resized.toFile(dest);
}


async function createImage(idx) {

    const bg = randInt(11)+1;
    const tears = randInt(11)+1;
    const mouth = randInt(11)+1;
    const obj = randInt(10)+1;

    const face = [bg, tears, mouth, obj].join('');

    if (face[takenFaces]) {
        createImage();
    } else {
        const name = getRandomName()
        console.log(name)
        face[takenFaces] = face;

        let images = [];
        images.push(getPath("layers2",`BG${bg}`));
        images.push(getPath("layers2",`SKIN`));
        images.push(getPath("layers2",`BODY`));
        images.push(getPath("layers2",`BLUSH`));
        images.push(getPath("layers2",`EYES`));
        images.push(getPath("layers2",`NOSE`));
        images.push(getPath("layers2",`tears${tears}`));
        images.push(getPath("layers2",`MOUTH${mouth}`));
        images.push(getPath("layers2",`OBJ${obj}`));

        //Generating images with merge images
        generateImages(images, idx)

        const final = template
            // .replace('<!-- bg -->', getLayer(`BG${bg}`))
            // .replace('<!-- skin -->', getLayer('SKIN1'))
            .replace('<!-- body -->', getLayer('BODY'))
            .replace('<!-- blush -->', getLayer('BLUSH'))
            .replace('<!-- eyes -->', getLayer('EYES'))
            .replace('<!-- nose -->', getLayer('NOSE'))
            .replace('<!-- tears -->', getLayer(`tears${tears}`))
            // .replace('<!-- obj -->', getLayer(`OBJ${obj}`))
            // .replace('<!-- mouth -->', getLayer(`MOUTH${mouth}`))

        const meta = {
            name,
            description: `A drawing of ${name.split('-').join(' ')}`,
            image: `${idx}.png`,
            attributes: [
                { 
                    beard: '',
                    rarity: 0.5
                }
            ]
        }
        // writeFileSync(`./out/${idx}.json`, JSON.stringify(meta))
        // writeFileSync(`./out/${idx}.svg`, final)
        // svgToPng(idx)
    }


}

async function generateImages(images, idx){

    const b64 = await mergeImages(images,{Canvas: Canvas, Image: Image});

    await ImageDataURI.outputFile(b64, "./out2/" + `${idx}.png`);
}

// Create dir if not exists
if (!existsSync('./out')){
    mkdirSync('./out');
}

// Cleanup dir before each run
readdirSync('./out').forEach(f => rmSync(`./out/${f}`));


do {
    createImage(idx);
    idx--;
  } while (idx >= 0);
