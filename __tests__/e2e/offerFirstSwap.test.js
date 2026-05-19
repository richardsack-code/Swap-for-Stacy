import { test, expect } from '@playwright/test';
import {deleteItem} from "../../src/services/itemServices.js";
import {deleteSwapperById, findSwapperByMail} from "../../src/services/swapperServices.js";
import connectDB from "../../src/config/db.js";
import mongoose from "mongoose";

test.beforeAll(async () => {
    await connectDB();
});

test.afterAll(async () => {
    await mongoose.disconnect();
});

test.afterEach(async () => {
    const swapper = await findSwapperByMail("sir@testalot.com");
    if (swapper){
        await deleteItem("An Item", swapper._id);
        await deleteSwapperById(swapper._id);
    }
});


test('test', async ({ page }) => {

    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'Wanna swap?' }).click();
    await page.locator('input[name="itemName"]').click();
    await page.locator('input[name="itemName"]').fill('An Item');
    await page.locator('input[name="itemDescription"]').click();
    await page.locator('input[name="itemDescription"]').fill('It is a really cool Item. You will definitely want it.');
    await page.locator('input[name="name"]').click();
    await page.locator('input[name="name"]').fill('Sir Testalot');
    await page.locator('input[name="email"]').click();
    await page.locator('input[name="email"]').fill('sir@testalot.com');
    await page.locator('input[name="password"]').click();
    await page.locator('input[name="password"]').fill('password');

    const [response] = await Promise.all([
        page.waitForResponse("http://localhost:3000/wanna-swap"),
        page.getByRole("button", {name: "Propose Swap"}).click()
    ]);

    const body = await response.text();
    expect(response.status()).toBe(200);
    expect(body).toEqual("Thank you for your swap! I bet it'll be awesome!");
});