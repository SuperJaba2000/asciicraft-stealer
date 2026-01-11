import chalk from 'chalk';
import fs from 'fs';

import { fileURLToPath } from 'url';
import { basename } from 'path';

const __filename = fileURLToPath(import.meta.url);
const moduleName = basename(__filename);

let run_as_utility = false;

if (process.argv[1] && process.argv[1].includes(moduleName)) {
    run_as_utility = true;
}

function parse(art_path, allow_strange_lines = false) {
    let lines;

    try{
        lines = JSON.parse(fs.readFileSync(art_path, 'utf-8'));
    }catch(error) {
        if(error instanceof SyntaxError) {
            throw new Error(`JSON parse error: ${error.message} in ${art_path}`);
        }

        throw error;
    }

    if(!Array.isArray(lines) || lines.length == 0) {
        throw new Error(`Ascii art parse error: ${art_path} has no array of lines!`);
    }

    const first_line_length = lines[0].length;

    for(let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if(!Array.isArray(line) && !allow_strange_lines) {
            throw new Error(`Ascii art parse error: Line ${i} is not an array!`);
        }

        if(line.length != first_line_length && !allow_strange_lines) {
            throw new Error(`Ascii art parse error: Line ${i} has different length!`);
        }
    }

    return lines;
}

export function info(art_path) {
    const lines = parse(art_path);

    const height = lines.length;
    const width = lines[0].length;
    const max_width = Math.max(...lines.map(line => line.length));
    
    const colors = new Set();
    const symbols = new Set();

    for(let i = 0; i < lines.length; i++) {
        const line = lines[i];

        for(let j = 0; j < line.length; j++) {
            const pixel = line[j];

            colors.add([pixel[0], pixel[1], pixel[2]]);
            colors.add([pixel[3], pixel[4], pixel[5]]);
            symbols.add(pixel[6]);
        }
    }

    return {
        height,
        width,
        max_width,
        colors: Array.from(colors),
        symbols: Array.from(symbols)
    }
}

export function draw(art_path, options) {
    const lines = parse(art_path, options.allow_strange_lines);

    const draw_bg = options.draw_bg || true;
    const draw_fg = options.draw_fg || true;
    const no_color = options.no_color || false;

    for(let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let line_string = '';

        for(let j = 0; j < line.length; j++) {
            let pixel = line[j];

            if(no_color) {
                line_string += pixel[6];
                continue;
            }

            if(draw_bg && draw_fg) {
                line_string += chalk.bgRgb(pixel[3], pixel[4], pixel[5]).rgb(pixel[0], pixel[1], pixel[2]).bold(pixel[6]);
                continue;
            }else if(draw_bg && !draw_fg) {
                line_string += chalk.bgRgb(pixel[3], pixel[4], pixel[5]).bold(pixel[6]);
                continue;
            }else if(!draw_bg && draw_fg) {
                line_string += chalk.rgb(pixel[0], pixel[1], pixel[2]).bold(pixel[6]);
                continue;
            }
        }

        process.stdout.write(line_string + '\n');
    }
}

if(run_as_utility) {
    const art_path = process.argv[2] || 'art.json';
    const options = {
        allow_strange_lines: process.argv.includes('-allow-strange-lines'),
        draw_bg: !process.argv.includes('-no-bg'),
        draw_fg: !process.argv.includes('-no-fg'),
        no_color: process.argv.includes('-no-color'),
        info: process.argv.includes('-info')
    };

    if(info) {
        console.log(info(art_path));
        return;
    }

    draw(art_path, options);
}
