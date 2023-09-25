import { test, request } from '@playwright/test';
import { CardGamePage } from '../pages/card-game.page';

test.describe('Card Game', async () => {

    test('Blackjack', async ({ page }) => {
        let apiContext = await request.newContext()
        let cardGamePage = new CardGamePage(page);
        await cardGamePage.confirmSiteIsUpByApi(apiContext);
        await cardGamePage.confirmSiteIsUpByUI();
        let deckId = await cardGamePage.getNewDeck(apiContext);
        await cardGamePage.shuffleDeck(apiContext, deckId);
        let results = await cardGamePage.dealCards(apiContext, 2, 3, deckId);
        cardGamePage.gameResult(results);
    })

})