import { APIRequestContext, APIResponse, expect, Locator, Page, request } from "@playwright/test";
import { faker } from '@faker-js/faker';

export class CardGamePage {
    readonly page: Page;
    readonly baseURL = 'https://deckofcardsapi.com/';

    constructor(page: Page) {
        this.page = page;
    }

    //Helper Methods
    async confirmSiteIsUpByApi(apiContext: APIRequestContext) {
        let html = await (await apiContext.fetch(this.baseURL)).text();
        const matches = html.match(/<title>(.*?)<\/title>/);
        let title = matches![0].split('>')[1].split('<')[0]
        expect(title).toEqual('Deck of Cards API');
    }

    async confirmSiteIsUpByUI() {
        await this.page.goto(this.baseURL);
        await expect(this.page).toHaveTitle("Deck of Cards API");
    }

    async getResponseBody(response: APIResponse) {
        expect(response.ok()).toBeTruthy();
        let body = await response.json()
        return body;
    }

    async getNewDeck(apiContext: APIRequestContext) {
        let newDeck = await apiContext.get('/api/deck/new/');
        let responseBody = await this.getResponseBody(newDeck);
        let deckId = responseBody.deck_id;
        return deckId;
    }

    async suffleDeck(apiContext: APIRequestContext, deckId: string) {
        let shuffledDeck = await apiContext.get(`/api/deck/${deckId}/shuffle/`);
        let responseBody = await this.getResponseBody(shuffledDeck);
        let shuffled = responseBody.shuffled;
        expect(shuffled).toBeTruthy();
    }

    async drawCards(apiContext: APIRequestContext, cardCount: number, deckId: string) {
        let Draw = await apiContext.get(`/api/deck/${deckId}/draw/?count=${cardCount}`);
        let responseBody = await this.getResponseBody(Draw);
        let cards = responseBody.cards;
        return cards;
    }

    async dealCards(apiContext: APIRequestContext, playerCount: number, cardCount: number, deckId: string, playerNames?: string[]) {
        let results = new Map();
        for (let i = 0; i < playerCount; i++) {
            let cards = await this.drawCards(apiContext, cardCount, deckId);
            let points = this.getPoints(cards);
            let playerName: string;
            if (!playerNames || !playerNames[i]) {
                playerName = faker.person.firstName();
            } else {
                playerName = playerNames[i];
            }
            console.log(playerName + "'s points: " + points);
            results.set(playerName, points);
        }
        console.log('')
        return results;
    }

    getCardNumericValue(card) {
        switch (card.value) {
            case 'KING':
                return 10;

            case 'QUEEN':
                return 10;

            case 'JACK':
                return 10;

            case 'ACE':
                return 11;

            default:
                return Number(card.value);
        }
    }

    getPoints(cardArray) {
        let points = 0;
        for (let i = 0; i < cardArray.length; i++) {
            let card = cardArray[i];
            points += this.getCardNumericValue(card);
        }
        return points;
    }

    gameResult(results: Map<string, number>) {
        let blackJack = false;
        let maxValue = 0;
        results.forEach(function (value, key) {
            if (value === 21) {
                blackJack = true;
                console.log(key + ' has blackjack!');
            }
            if (value < 21) {
                maxValue = (!maxValue || maxValue < value) ? value : maxValue;
            }
        })
        let players: string[] = []
        if (!blackJack && maxValue) {
            for (let [key, value] of results.entries()) {
                if (value === maxValue)
                    players.push(key);
            }
            console.log(this.printNames(players) + maxValue + ' points!');
        } else if(!blackJack && !maxValue){
            console.log('No one has won the game');
        }
    }

    printNames(players: string[]) {
        let sentence = '';
        let winnerCount = players.length;
        if (winnerCount === 1) {
            sentence = players[0];
        } else if (winnerCount > 1) {
            for (let i = 0; i < winnerCount - 1; i++) {
                sentence += players[i] + ', '
            }
            sentence += 'and ' + players.slice(-1)
        }
        sentence += ' has won the game with '
        return sentence;
    }
}