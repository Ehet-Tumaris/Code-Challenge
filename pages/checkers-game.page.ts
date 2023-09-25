import { expect, Locator, Page } from "@playwright/test";

export class CheckersGamePage {
    readonly page: Page;
    readonly instruction: Locator;
    readonly restartLink: Locator;

    constructor(page: Page) {
        this.page = page;

        //Locators
        this.instruction = page.locator('#message');
        this.restartLink = page.getByText("Restart...");
    }

    //Helper Methods
    async startGame() {
        await this.page.goto('https://www.gamesforthebrain.com/game/checkers/');
        await expect(this.page).toHaveTitle('Checkers - Games for the Brain');
        await this.confirmReady();
    }

    async move(originSquareName: string, targetSquareName: string, [captured,lost]:[number,number]) {
        let originSquare = this.page.locator(`[name=${originSquareName}]`);
        //Need this try-catch block because sometimes clicking too fast will not register
        try {
            await originSquare.click();
            await expect(originSquare).toHaveAttribute('src', 'you2.gif', { timeout: 1000 });
        }
        catch {
            await originSquare.click();
            await expect(originSquare).toHaveAttribute('src', 'you2.gif', { timeout: 1000 });
        }
        let targetSquare = this.page.locator(`[name=${targetSquareName}]`);
        await targetSquare.click();

        //need this try-catch block because target square will have different attributes
        //based on whether the opponent have eaten my moved piece
        try {
            await expect(targetSquare).toHaveAttribute('src', 'you1.gif', { timeout: 2000 });
        }
        catch {
            if (await targetSquare.getAttribute('src') == 'gray.gif') {
                lost++;
            } else {
                throw ('unexpected status');
            }
        }
        await expect(this.instruction).toContainText('Make a move.');
        let originSquareNum = Number(originSquareName.match(/(\d+)/)![0]);
        let targetSquareNum = Number(targetSquareName.match(/(\d+)/)![0]);
        let diff = Math.abs(originSquareNum - targetSquareNum);
        if(diff===18||diff===22){
            captured++
        }
        return [captured, lost];
    }

    async restart() {
        await this.restartLink.click();
        await this.confirmReady();
    }

    async confirmReady() {
        await expect(this.instruction).toContainText('Select an orange piece to move.');
    }
}