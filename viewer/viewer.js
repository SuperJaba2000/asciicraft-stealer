import chalk from 'chalk';
import fs from 'fs';

const file_name = process.argv[2] || 'art.json';
const draw_without_background = process.argv.includes('-fg-only');

let list = JSON.parse(fs.readFileSync(file_name, 'utf-8'));

for(let i = 0; i < list.length; i++) {
    let line = list[i];
    let line_string = '';

    for(let j = 0; j < line.length; j++) {
        let pixel = line[j];
        if (draw_without_background) {
            line_string += chalk.rgb(pixel[0], pixel[1], pixel[2]).bold(pixel[6]);
            continue;
        }
        line_string += chalk.bgRgb(pixel[3], pixel[4], pixel[5]).rgb(pixel[0], pixel[1], pixel[2]).bold(pixel[6]);
    }

    process.stdout.write(line_string + '\n')
}
