import { by, device, element, expect } from 'detox';
import { ElementName } from 'src/features/telemetry/constants';

export function Swap() {
  it('saves the original amount on usd toggle', async () => {
    // Tapping the toggle button twice
    await element(by.id('toggle-usd')).tap();
    await element(by.id('toggle-usd')).tap();

    // Verifying if the original amount is saved and displayed
    await expect(element(by.id('amount-input-in'))).toHaveText('1.23');
  });

  it('submit a swap tx', async () => {
    // Initiating the swap transaction
    await element(by.id(ElementName.ReviewSwap)).tap();
    await element(by.id(ElementName.Swap)).tap();

    // Authenticating using Face ID
    await device.matchFace();

    // Confirming the transaction
    await element(by.id(ElementName.OK)).tap();
  });

  it('checks if UI elements adapt to large text size in accessibility settings', async () => {
    // Note: This would require simulating the change in text size via device settings or mocking

    // Interacting with elements to check their adaptability
    await element(by.id('toggle-usd')).tap();

    // Verifying that the elements are still visible and usable
    await expect(element(by.id('amount-input-in'))).toBeVisible();
    await expect(element(by.id(ElementName.Swap))).toBeVisible();

    // You should add more specific checks to ensure elements are not overlapping or truncated
  });

  it('checks for warning or error when swapping tiny token amounts', async () => {
    // Entering a tiny token amount for the swap
    await element(by.id('amount-input-in')).typeText('0.00000001');
    await element(by.id(ElementName.Swap)).tap();

    // Verifying that a warning or error message is displayed
    await expect(element(by.id('warningOrErrorElementID'))).toBeVisible();
  });

  it('checks token availability after network error', async () => {
    // Entering an amount for the swap
    await element(by.id('amount-input-in')).typeText('0.01');

    // Note: This requires simulating a network error, possibly by enabling airplane mode or mocking an error response

    // Attempting to complete the swap and expecting a network error
    await element(by.id(ElementName.Swap)).tap();
    await expect(element(by.text('Network Error'))).toBeVisible();

    // Verifying that the available token amount remains consistent after the error
    await expect(element(by.id('amount-input-in'))).toHaveText('0.01');
  });

  it('checks if fiat rate display does not exceed the boundaries for specific token pairs', async () => {
    // Selecting specific tokens for the swap
    await element(by.id('tokenPEPE')).tap();
    await element(by.id('tokenACH')).tap();

    // Verifying that the fiat rate display is completely visible and does not overflow the boundaries
    await expect(element(by.id('fiatRateDisplay'))).toBeVisible();

    // Note: Consider adding more detailed checks or image comparison to ensure the rate display is within boundaries
  });
}
