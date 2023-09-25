import { test } from '@playwright/test';
import { CheckersGamePage } from '../pages/checkers-game.page';

test.describe('Checker Game', async () => {

    test('Checker Game', async ({ page }) => {
        let checkersGamePage = new CheckersGamePage(page);
        await checkersGamePage.startGame();
        let [captured, lost] = [0, 0];
        [captured, lost] = await checkersGamePage.move("space62", "space53", [captured, lost]);
        [captured, lost] = await checkersGamePage.move("space22", "space33", [captured, lost]);
        [captured, lost] = await checkersGamePage.move("space02", "space24", [captured, lost]);
        [captured, lost] = await checkersGamePage.move("space11", "space02", [captured, lost]);
        [captured, lost] = await checkersGamePage.move("space31", "space13", [captured, lost]);
        console.log('Captured Piece Count: ' + captured);
        console.log('Lost Piece Count: ' + lost);
        await checkersGamePage.restart();
    })

})