const fs = require('fs');

let content = fs.readFileSync('./bot.js', 'utf-8');
content = content.replace(/\/\*@import '(.*?)'\*\//g,
    (_, path) => fs.readFileSync(path, 'utf-8')
);

pbcopy(content);

function pbcopy(data) {
    const proc = require('child_process').spawn('pbcopy');
    proc.stdin.write(data);
    proc.stdin.end();
}
