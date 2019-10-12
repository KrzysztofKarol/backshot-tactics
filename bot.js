(async () => {
    const me = 'A';
    const opponent = 'B';

    /*@import 'src/shared.js'*/
    /*@import 'src/game.js'*/

    window.timer = setInterval(async () => {
        if (document.body.className.includes("initial")) {
            document.querySelectorAll('[type="submit"]')[0].click();
            return;
        }

        if (document.body.dataset.state === "wait") {
            document.getElementsByClassName("bot")[0].click();
            return;
        }

        if (document.body.dataset.state === "pick") {
            await pickChars();
        }


        if (document.body.dataset.state === "play") {
            runTurn();
        }

        if (document.body.dataset.state === "game-over") {
            document.getElementsByTagName('main')[0].innerHTML = '';
            delete document.body.dataset.state;
            document.body.className = "initial"
        }
    }, 1000);

    function runTurn(toggleMine = false) {
        if (document.body.dataset.state === "play" && document.body.dataset.turn !== "me") {
            return;
        }

        const game = createNewGame(toggleMine);

        let bestCid = -1;
        let bestDamage = 0;

        for (let char of game.getPlayerChars(me)) {
            const cid = char.id;

            const tempGame = createNewGame(toggleMine);
            const damage = tempGame.move(me, cid);

            if (damage >= bestDamage) {
                bestCid = cid;
                bestDamage = damage;
            }
        }

        // console.log(bestDamage, bestCid, game.getChar(bestCid));

        game.getChar(bestCid).element.click();
    }

    function getChars() {
        const {children} = document.getElementsByClassName('field')[0];

        return [...children]
            .map(element => {
                const [, x, y] = element.attributes.style.value.match(/--x:(\d+); --y:(\d+);/);
                const char = new Char({
                    pos: {
                        x: Number(x),
                        y: Number(y)
                    },
                });

                char.id = element.tabIndex;
                char.owner = element.className.includes('own')
                    ? me
                    : element.className.includes('nope')
                        ? opponent
                        : null;

                char.hp = 100; // TODO

                const dirsRe = `(${DIRS.join('|')})`;
                const dirsElement = element.children[/*dirs*/2];
                const [, ...directions] = dirsElement.innerHTML.match(
                    dirsRe + '.*' + dirsRe + '.*' + dirsRe + '.*' + dirsRe
                );

                char.directions = directions.map(dir => ({dir, size: 4}));
                char.nextDir = [...dirsElement.children]
                    .findIndex(child => child.className.includes('next'));

                char.dir = element.dataset.dir;

                char.element = element;

                return char;
            })
    }

    function createNewGame(toggleMine = false) {
        const game = new Game({
            participants: 2,
            onevent: e => {
                // console.log(e)
            }
        });
        game.addPlayer(me);
        game.addPlayer(opponent);

        game.chars = getChars();

        if (toggleMine) {
            game.chars = game.chars.map(char => ({
                ...char,
                owner: char.owner === me ? null : char.owner || me
            }));
        }

        return game;
    }

    function pickRandom(num = 4) {
        shuffle(createNewGame().chars)
            .filter(char => char.owner === null)
            .slice(0, num)
            .forEach(char => {
                char.element.click();
            });
    }

    async function pickNewBestChar(num = 4) {

        console.log('b', createNewGame().getPlayerChars(opponent).length, createNewGame().getPlayerChars(me).length)
        // while (createNewGame().getPlayerChars(opponent).length <= createNewGame().getPlayerChars(me).length) {
        while (createNewGame().getPlayerChars(opponent).length < createNewGame().getPlayerChars(me).length) {
            await sleep(1)
        }

        if (createNewGame().getPlayerChars(opponent).length === 0) {
            pickRandom(1);
        } else {
            runTurn(true);
        }

    }

    async function pickChars() {
        while (createNewGame().getPlayerChars(me).length < 4) {
            await pickNewBestChar();
            await sleep(1);
        }
    }
})();
