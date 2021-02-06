import chessboard from '../src/ChessBoard';

import * as puppeteer from 'puppeteer-debug';
import launchPuppeteer from './utils';

const options = {
    headless: false,
};

// Test constants
const username:string = 'tomsmith';
const password:string = 'SuperSecretPassword!';
const incorrectUsername:string = 'timsmith';
const incorrectPassword:string = 'qwerty100';
const usernameErrorMessage:string = 'Your username is invalid!';
const passwordErrorMessage:string = 'Your password is invalid!';

describe('Authentication test: ', () => {

    let browser;
    let page;
    let loginPage;

    before(async () => {
        browser = await launchPuppeteer();
        page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 1024 });
        const navMenu = new NavigationMenu(page);
        await navMenu.loadNavigationMenu();
        loginPage = await navMenu.loadFormAuthenticationPage();
    });

    after(async () => {
        await browser.close();
    });

    it('Login test', async () => {
        expect(await loginPage.getPageHeader()).to.equal('Login Page');
        expect(await loginPage.getPageSubHeader()).to.equal(messages.loginSubheader);
        expect(await loginPage.getFooterText()).to.equal(messages.poweredByMessage);

        const securedPage = await loginPage.login(username, password);
        expect(await securedPage.getPageMessage()).to.equal('You logged into a secure area!');
        expect(await securedPage.getPageHeader()).to.equal('Secure Area');
        expect(await securedPage.getFooterText()).to.equal(messages.poweredByMessage);
        await securedPage.logout();

        expect(await loginPage.getPageMessage()).to.equal('You logged out of the secure area!');
        expect(await loginPage.getPageHeader()).to.not.equal('Secure Area');
    });

    it('Validation Message Test', async() => {
        // username field validation
        await loginPage.loginWithIncorrectInput(incorrectUsername, '');
        expect(await loginPage.getPageMessage()).to.equal(usernameErrorMessage);

        // password field validation
        await loginPage.loginWithIncorrectInput(username, incorrectPassword);
        expect(await loginPage.getPageMessage()).to.equal(passwordErrorMessage);

        // Submit blank form
        await loginPage.loginWithIncorrectInput('', '');
        expect(await loginPage.getPageMessage()).to.equal(usernameErrorMessage);
    });

    it('Close Validation Message Test', async() => {
        await loginPage.loginWithIncorrectInput(incorrectUsername, incorrectPassword);
        expect(await loginPage.getPageMessage()).to.equal(usernameErrorMessage);
        await loginPage.closePageMessage();
        let isCloseButtonClicked : boolean = false;
        try {
            await loginPage.closePageMessage();
            isCloseButtonClicked = true;
        } catch (err) {
            expect(isCloseButtonClicked).to.equal(false);
        }
    });
});