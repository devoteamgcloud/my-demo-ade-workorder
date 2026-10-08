import os
import sys
from playwright.sync_api import sync_playwright, expect

BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:3001")

def main():
    screenshots_dir = os.path.abspath("screenshots")
    os.makedirs(screenshots_dir, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(viewport={"width": 1280, "height": 900})
        page = context.new_page()

        print(f"Navigating to {BASE_URL}/work-orders/WO-1042...")
        page.goto(f"{BASE_URL}/work-orders/WO-1042")
        page.wait_for_load_state("networkidle")

        # Step 1: Verify Initial State (Open tasks exist: TC-3, TC-4)
        print("Verifying initial state with outstanding task cards...")
        close_btn = page.locator("button:has-text('Close work order')")
        expect(close_btn).to_be_visible()
        expect(close_btn).to_be_disabled()

        # Check title attribute
        title_attr = close_btn.get_attribute("title")
        print(f"Close button title: {title_attr}")
        assert "Cannot close: task cards still outstanding (TC-3, TC-4)" in title_attr

        # Check outstanding tasks caption
        outstanding_caption = page.locator('[data-testid="outstanding-tasks"]')
        expect(outstanding_caption).to_be_visible()
        caption_text = outstanding_caption.inner_text()
        print(f"Outstanding tasks text: {caption_text}")
        assert "Outstanding: TC-3, TC-4" in caption_text

        # Take screenshot of outstanding state
        outstanding_path = os.path.join(screenshots_dir, "wo-1042-outstanding.png")
        page.screenshot(path=outstanding_path, full_page=True)
        print(f"Saved screenshot: {outstanding_path}")

        # Step 2: Complete TC-3 -> Set to DONE
        print("Updating TC-3 to DONE...")
        tc3_select = page.locator('select[aria-label="Status for TC-3"]')
        tc3_select.select_option("DONE")
        tc3_row = page.locator("tr:has-text('TC-3')")
        tc3_row.locator("button:has-text('Save')").click()
        page.wait_for_load_state("networkidle")

        # Verify TC-3 is done and outstanding caption now shows only TC-4
        expect(outstanding_caption).to_be_visible()
        assert "Outstanding: TC-4" in outstanding_caption.inner_text()
        expect(close_btn).to_be_disabled()

        # Step 3: Complete TC-4 -> Set to DEFERRED
        print("Updating TC-4 to DEFERRED...")
        tc4_select = page.locator('select[aria-label="Status for TC-4"]')
        tc4_select.select_option("DEFERRED")
        tc4_row = page.locator("tr:has-text('TC-4')")
        tc4_row.locator("button:has-text('Save')").click()
        page.wait_for_load_state("networkidle")

        # Step 4: Verify Close Button is now enabled and caption disappeared
        print("Verifying close button is enabled...")
        expect(close_btn).to_be_enabled()
        expect(outstanding_caption).to_have_count(0)

        # Step 5: Close the work order
        print("Clicking 'Close work order'...")
        close_btn.click()
        page.wait_for_load_state("networkidle")

        # Step 6: Verify Work Order is now CLOSED
        print("Verifying work order is closed...")
        # In header, status badge shows Closed
        status_badge = page.locator("span:has-text('Closed')").first
        expect(status_badge).to_be_visible()

        # Close button should no longer exist since !isClosed guard hides it
        expect(page.locator("button:has-text('Close work order')")).to_have_count(0)

        # Take screenshot of closed state
        closed_path = os.path.join(screenshots_dir, "wo-1042-closed.png")
        page.screenshot(path=closed_path, full_page=True)
        print(f"Saved screenshot: {closed_path}")

        browser.close()
        print("All Playwright E2E verification steps passed successfully!")

if __name__ == "__main__":
    main()
