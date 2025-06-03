# IMPORTANT: USER GUIDE AND WARNINGS - READ BEFORE USE!
#
# This script is a CONCEPTUAL TEMPLATE for automating interactions with Naver Cafe.
# It uses Selenium and requires significant setup and customization by the user.
# SUCCESS IS NOT GUARANTEED, AND USING THIS SCRIPT CARRIES RISKS.
#
# --- PREREQUISITES ---
# 1. Python 3.x: Ensure you have Python installed. (https://www.python.org/downloads/)
# 2. Selenium Package: Install using pip: `pip install selenium`
# 3. WebDriver:
#    - Download ChromeDriver specific to your Google Chrome browser version.
#      (https://chromedriver.chromium.org/downloads)
#    - Place `chromedriver.exe` (or `chromedriver` on Linux/macOS) in a known directory.
#    - You'll need to provide the path to this executable in the `setup_driver()` function
#      or ensure it's in your system's PATH.
#
# --- CONFIGURATION (CRITICAL) ---
# You MUST edit the following variables in this script:
#   - `NAVER_ID`: Your Naver username.
#   - `NAVER_PW`: Your Naver password.
#     SECURITY WARNING: Hardcoding credentials is a risk. For advanced use, consider
#     environment variables, a configuration file, or runtime prompts.
#   - `CAFE_URL`: The FULL URL of the Naver Cafe's main page where new posts appear.
#   - `TARGET_LAT`, `TARGET_LON`: Accurate latitude and longitude for your target address
#     (e.g., "경기도 수원시 장안구 하률로30번길 22"). Use a geocoding tool to find these.
#   - `CAMPSITE_DB`: A Python dictionary of campsite names (EXACTLY as they appear in posts)
#     and their accurate latitude/longitude coordinates. Example:
#     `CAMPSITE_DB = { "행복캠핑장": {"lat": 37.12345, "lon": 127.54321}, ... }`
#   - `MAX_DISTANCE_KM`: Maximum allowed distance from your target address to a campsite.
#   - (Optional) `webdriver_path` in `setup_driver()`: Update if your chromedriver is not in PATH.
#
# --- CUSTOMIZATION (ESSENTIAL FOR FUNCTIONALITY) ---
# The core challenge of this script is that Naver Cafe's website structure can change,
# and the HTML element selectors used by Selenium will need constant updates.
# YOU MUST LEARN TO USE BROWSER DEVELOPER TOOLS to find the correct selectors:
#   1. Open Naver Cafe in Chrome.
#   2. Right-click on an element you want the script to interact with (e.g., login ID field,
#      a post title, the comment box, the comment submit button).
#   3. Select "Inspect" or "Inspect Element".
#   4. The Developer Tools window will open, highlighting the HTML for that element.
#   5. Find unique and stable attributes (like `id`, `name`, `class`, or a combination)
#      to create CSS SELECTORS or XPATH expressions.
#
# You WILL LIKELY NEED TO UPDATE THE FOLLOWING SELECTORS in the script:
#   - `login_to_naver()`:
#     - ID/Password fields, Login button.
#     - Error message elements if login fails.
#   - `scrape_cafe_posts()`:
#     - Cafe content iframe ID (e.g., `cafe_main`).
#     - Selectors for individual post containers/elements.
#     - Selectors for links within posts.
#   - `post_comment()`:
#     - Comment section iframe ID (if different or nested, e.g., `CommentFrame`).
#     - Comment textarea/input field.
#     - Comment submit button.
#
# --- RISKS AND WARNINGS ---
# 1. TERMS OF SERVICE VIOLATION: Automating access to Naver Cafe is likely
#    AGAINST NAVER'S TERMS OF SERVICE. This can lead to:
#      - Temporary or permanent suspension of your Naver account.
#      - IP address blocking.
# 2. DETECTION: Naver employs anti-bot measures. While this script includes basic
#    random delays, it is NOT guaranteed to evade detection. More sophisticated
#    techniques (proxies, advanced fingerprinting evasion) are beyond this script's scope
#    and still not foolproof.
# 3. SCRIPT MAINTENANCE: Website structures change. This script WILL break eventually
#    and will require you to update selectors and logic. This is not a "set and forget" solution.
# 4. NO GUARANTEE OF "FIRST COMMENT": Speed depends on many factors (your internet,
#    PC speed, script efficiency, Naver's server response). Being first is not guaranteed.
# 5. ETHICAL CONSIDERATIONS: Consider the fairness to other cafe users.
#
# USE THIS SCRIPT RESPONSIBLY AND AT YOUR OWN RISK.
# THE CREATORS/PROVIDERS OF THIS SCRIPT ARE NOT RESPONSIBLE FOR ANY CONSEQUENCES
# ARISING FROM ITS USE.
#
# --- End of USER GUIDE AND WARNINGS ---

# Standard library imports
import time
import random
import math
import re # For functions previously in post_analyzer.py

# Selenium imports
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# --- Configuration Variables (User must fill these) ---
NAVER_ID = ""  # IMPORTANT: Fill in your Naver ID
NAVER_PW = ""  # IMPORTANT: Fill in your Naver Password
# WARNING: Hardcoding credentials is a security risk. Consider environment variables or input prompts for real use.

CAFE_URL = "https_cafe_naver_com_chocammall" # Replace with the actual full URL, e.g., "https://cafe.naver.com/chocammall"
# Note: The provided URL in the issue "https://cafe.naver.com/chocammall" seems to be the correct one.
# User should verify and ensure this is the main page for new posts.

# Target location (경기도 수원시 장안구 하률로30번길 22)
# User needs to provide accurate latitude and longitude for this.
# Using placeholder from previous script for now.
TARGET_LAT = 37.291938  # Placeholder - User must replace
TARGET_LON = 126.990794  # Placeholder - User must replace

# Campsite Database
# User needs to populate this with campsite names (as they appear in posts) and their coordinates.
# Format: { "campsite_name_in_post": {"lat": latitude, "lon": longitude}, ... }
CAMPSITE_DB = {
    "해피캠핑장": {"lat": 37.3000, "lon": 127.0000}, # Example, within 150km of Suwon placeholder
    "먼곳캠핑장": {"lat": 38.5000, "lon": 128.0000}, # Example, likely outside 150km
    # Add more campsites here
}
MAX_DISTANCE_KM = 150

# --- WebDriver Setup and Teardown ---
def setup_driver(webdriver_path="chromedriver"): # User might need to provide path to chromedriver
    """Initializes and returns a Selenium WebDriver instance."""
    # --- Chromedriver setup ---
    # Option 1: WebDriverManager (recommended for easier setup if user can install it)
    # from webdriver_manager.chrome import ChromeDriverManager
    # service = ChromeService(ChromeDriverManager().install())
    # driver = webdriver.Chrome(service=service)

    # Option 2: Manual path to chromedriver
    # User needs to download chromedriver matching their Chrome version and provide its path.
    # Example: webdriver_path = "/path/to/your/chromedriver" 
    # If chromedriver is in PATH, you might just need: driver = webdriver.Chrome()
    try:
        # Attempt to use WebDriverManager if available (conceptual, not installing it here)
        # For this subtask, assume manual path or chromedriver in PATH for simplicity
        # If webdriver_path is just "chromedriver", it implies it's in the system PATH.
        service = ChromeService(executable_path=webdriver_path)
        driver = webdriver.Chrome(service=service)
        print("WebDriver setup successful.")
    except Exception as e:
        print(f"Error setting up WebDriver: {e}")
        print("Please ensure you have ChromeDriver installed and it's in your PATH, or provide the correct path.")
        print("You can download ChromeDriver from: https://chromedriver.chromium.org/downloads")
        return None
    return driver

def teardown_driver(driver):
    """Quits the WebDriver instance."""
    if driver:
        print("Quitting WebDriver.")
        driver.quit()

# --- Text Analysis Functions (Previously from post_analyzer.py) ---

def haversine(lat1, lon1, lat2, lon2):
    """Calculate the great circle distance between two points on the earth (specified in decimal degrees)."""
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.asin(math.sqrt(a))
    r = 6371  # Radius of earth in kilometers. Use 3956 for miles
    return c * r

def check_dates(post_text):
    """
    Checks for specific June 6-8 date patterns (2 nights, 3 days).
    Examples: "6월 6일 ~ 6월 8일", "6/6 ~ 6/8", "6월 6,7,8일", 
              "6월 6일부터 6월 8일까지", "6월 6일부터 8일까지".
    More complex NLP might be needed for wider variations.
    """
    # Patterns for "June 6 to June 8" (월 일, 월/일, etc.)
    # Ensuring 2 nights, 3 days: June 6, 7, 8.
    patterns = [
        r"6월\s*6일\s*~\s*6월\s*8일",
        r"6/6\s*~\s*6/8",
        r"June\s*6(th)?\s*to\s*June\s*8(th)?",
        r"6월\s*6일\s*,\s*7일\s*,\s*8일",
        r"6월\s*6,\s*7,\s*8일",
        r"6월\s*6일에서\s*8일까지", # "from 6th to 8th"
        r"6월\s*6일부터\s*6월\s*8일까지",
        r"6월\s*6일부터\s*8일까지",
    ]
    for pattern in patterns:
        if re.search(pattern, post_text, re.IGNORECASE):
            return True
    
    # Check for "2박 3일" explicitly mentioned alongside a "6월 6일" start or "6월 8일" end
    # This is a simpler check and might need refinement.
    if ("2박 3일" in post_text or "2박3일" in post_text):
        if (re.search(r"6월\s*6일", post_text) or \
            re.search(r"6/6", post_text) or \
            re.search(r"June\s*6", post_text, re.IGNORECASE)):
            # If "2박 3일" and a start date of June 6 is mentioned, it implies June 6, 7, 8
            return True
        # It's harder to be sure if only the end date is mentioned with "2박 3일"
        # For now, primarily relying on explicit ranges or start date + "2박 3일".

    return False

def check_keyword(post_text):
    """
    Checks if the post text indicates an OFFER of transfer ("양도")
    and not a REQUEST for transfer.
    - Must contain "양도".
    - Must NOT contain "구합니다" or "구해요" (strong exclusion).
    - If "양도" is present, it must NOT be accompanied by specific seeking phrases
      like "받아요", "해주세요", "해주실 분".
    """
    # Condition 1: "양도" must be present.
    if "양도" not in post_text:
        return False

    # Condition 2: Strong exclusion keywords - if these exist, always filter out.
    strong_seeking_keywords = ["구합니다", "구해요"]
    for keyword in strong_seeking_keywords:
        if keyword in post_text:
            return False # Filter out if "구합니다" or "구해요" is present

    # Condition 3: "양도" is present, but check for accompanying seeking phrases.
    # These phrases only lead to exclusion if "양도" is also present,
    # implying a request for a transfer someone else is making.
    accompanying_seeking_phrases = [
        "받아요",    # e.g., "양도 받아요"
        "해주세요",  # e.g., "양도 해주세요"
        "해주실 분"  # e.g., "양도 해주실 분"
    ]
    # This check is relevant only if "양도" is already confirmed to be in the post_text.
    for phrase in accompanying_seeking_phrases:
        if phrase in post_text:
            # To be more precise, one might check proximity of "양도" and phrase,
            # but for now, presence of both is enough to filter.
            # Example: "양도 ... 받고 싶어요"
            return False # Filter out if "양도" is present with these seeking phrases

    # If "양도" is present and none of the exclusion conditions were met
    return True

def analyze_post(post_text, target_lat, target_lon, campsite_db, max_distance_km):
    """
    Analyzes the post text based on date, keyword, and location criteria.
    """
    if not check_dates(post_text):
        print("Post analysis: Date criteria not met.")
        return False
    print("Post analysis: Date criteria MET.")

    if not check_keyword(post_text):
        print("Post analysis: Keyword criteria not met.")
        return False
    print("Post analysis: Keyword criteria MET.")

    # Location check (simplified: iterates through known campsite names)
    found_matching_campsite = False
    for campsite_name, coords in campsite_db.items():
        if campsite_name in post_text:
            print(f"Post analysis: Found mention of campsite '{campsite_name}'.")
            distance = haversine(target_lat, target_lon, coords["lat"], coords["lon"])
            print(f"Post analysis: Distance to '{campsite_name}' is {distance:.2f} km.")
            if distance <= max_distance_km:
                print(f"Post analysis: Campsite '{campsite_name}' is within {max_distance_km} km.")
                found_matching_campsite = True
                break 
            else:
                print(f"Post analysis: Campsite '{campsite_name}' is too far.")
    
    if not found_matching_campsite:
        print(f"Post analysis: No mentioned campsites in database found within {max_distance_km} km, or no known campsites mentioned.")
        return False
    print("Post analysis: Location criteria MET.")
    
    return True # All criteria met

# --- Automation Functions ---

def login_to_naver(driver, username, password):
    """
    Attempts to log into Naver.
    IMPORTANT: Selectors are placeholders and WILL likely need to be updated by the user
               after inspecting the actual Naver login page.
               This function does not handle CAPTCHAs or 2FA.
    """
    login_url = "https://nid.naver.com/nidlogin.login" # Common Naver login page
    
    try:
        print(f"Navigating to Naver login page: {login_url}")
        driver.get(login_url)
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "id"))) # Wait for ID field
        
        print("Entering username...")
        id_field = driver.find_element(By.ID, "id")
        for char in username:
            id_field.send_keys(char)
            time.sleep(random.uniform(0.05, 0.2)) # Simulate human typing
            
        print("Entering password...")
        pw_field = driver.find_element(By.ID, "pw")
        for char in password:
            pw_field.send_keys(char)
            time.sleep(random.uniform(0.05, 0.2)) # Simulate human typing
            
        # Optional: Brief pause before clicking login
        time.sleep(random.uniform(0.5, 1.0))
        
        print("Clicking login button...")
        # Naver's login button ID is often 'log.login' but can change.
        login_button = driver.find_element(By.ID, "log.login") 
        login_button.click()
        
        # Wait for a moment to allow page to process login (e.g., redirect)
        # A more robust check would be to wait for a specific element on the post-login page.
        print("Login submitted. Waiting briefly for page load...")
        time.sleep(random.uniform(3, 5)) 

        # Check if login was successful (very basic check: are we still on a login page?)
        # A more reliable check would be to look for an element specific to a logged-in state
        # or check if the URL changed to what's expected after login.
        if "login" in driver.current_url.lower() or "nidlogin" in driver.current_url.lower():
            # Check for common error messages (these selectors are also placeholders)
            try:
                error_message_element = driver.find_element(By.CSS_SELECTOR, ".error_message, .error, #err_common") # Common error selectors
                if error_message_element.is_displayed():
                    print(f"Login may have failed. Error message found: {error_message_element.text}")
                    return False
            except NoSuchElementException:
                # No obvious error message, but still on login page - could be other issues
                print("Login may have failed. Still on a login-related page without obvious error message.")
                return False
        
        print("Login appears to be successful (or at least, not obviously failed on the login page).")
        return True
        
    except TimeoutException:
        print("Login failed: Timeout waiting for login page elements.")
        print("Possible reasons: incorrect URL, slow network, or Naver page structure changed.")
        return False
    except NoSuchElementException as e:
        print(f"Login failed: Could not find an element (e.g., ID/PW field or login button). Selector needs update: {e}")
        return False
    except Exception as e:
        print(f"An unexpected error occurred during login: {e}")
        return False

def scrape_cafe_posts(driver, cafe_url):
    """
    Attempts to navigate to the cafe and extract text from posts.
    VERY CONCEPTUAL AND LIKELY TO FAIL WITHOUT USER MODIFICATION.
    User MUST inspect the Naver Cafe's HTML structure and update selectors
    for post containers, iframes, and content elements.
    """
    try:
        print(f"Navigating to Cafe URL: {cafe_url}")
        driver.get(cafe_url)
        # Wait for page to load - a more specific wait for a known element is better
        time.sleep(random.uniform(3, 5)) 

        # --- Attempt to switch to the main content iframe (VERY COMMON IN NAVER CAFES) ---
        # User MUST find the correct iframe ID or name if one is used.
        # Common iframe IDs include 'cafe_main', 'main-area', etc.
        # If no iframe, this part should be removed.
        iframe_id_placeholder = "cafe_main" # Placeholder - user must verify
        try:
            print(f"Attempting to switch to iframe: {iframe_id_placeholder}...")
            WebDriverWait(driver, 10).until(EC.frame_to_be_available_and_switch_to_it((By.ID, iframe_id_placeholder)))
            print("Successfully switched to iframe.")
            # If you need to switch back to default content later: driver.switch_to.default_content()
        except TimeoutException:
            print(f"Could not switch to iframe '{iframe_id_placeholder}'. Assuming content is not in an iframe, or iframe ID is incorrect.")
            # Continue, hoping content is in the main document

        # --- Placeholder selectors for post elements ---
        # User MUST replace these with actual selectors from the target cafe.
        # Examples: 'li.article', 'div.post_item', 'tr.board_row'
        # It's often better to find a list of posts first.
        post_element_selector = "div.article" # Placeholder for individual post containers
        
        print(f"Looking for post elements using selector: '{post_element_selector}'")
        # It's good practice to wait for at least one post element to be present
        try:
            WebDriverWait(driver, 15).until(
                EC.presence_of_all_elements_located((By.CSS_SELECTOR, post_element_selector))
            )
            post_elements = driver.find_elements(By.CSS_SELECTOR, post_element_selector)
            print(f"Found {len(post_elements)} potential post element(s).")
        except TimeoutException:
            print(f"No post elements found using selector '{post_element_selector}' after waiting.")
            print("Please check the Cafe page structure and update the selector.")
            # If switched to iframe, switch back before returning
            try:
                driver.switch_to.default_content() # Switch back if you were in an iframe
            except Exception: # Catch if not in iframe or other issues
                pass
            return [] # Return empty list if no posts found

        scraped_posts_data = []
        for index, post_el in enumerate(post_elements):
            # This is a very basic text extraction. User might need to find specific
            # sub-elements for title, body, author, date, etc.
            try:
                # Try to get the full text of the post element.
                # This might include more than just the desired post content.
                post_text = post_el.text 
                
                # Conceptual: try to get a link to the post if available
                post_link = ""
                try:
                    # Posts often have an <a> tag with a link. This is a common pattern.
                    link_element = post_el.find_element(By.CSS_SELECTOR, "a.article_link, a.item_title, a[href*='articleid=']") # Placeholder
                    post_link = link_element.get_attribute('href')
                except NoSuchElementException:
                    post_link = f"No link found for post {index+1} with common selectors"

                print(f"--- Post {index + 1} ---")
                print(f"Link (conceptual): {post_link}")
                # print(f"Raw Text: {post_text[:200]}...") # Print a snippet
                
                scraped_posts_data.append({"text": post_text, "link": post_link, "id": post_link or f"post_index_{index}"})

                # Add a small delay to mimic human reading/browsing
                time.sleep(random.uniform(0.5, 1.5))

            except Exception as e:
                print(f"Error processing post element {index + 1}: {e}")
        
        # Switch back to default content if you were in an iframe
        # This is important if further actions need to be taken on the main page
        try:
            print("Switching back to default content from iframe (if applicable).")
            driver.switch_to.default_content()
        except Exception as e:
            # Might fail if never switched, or already switched. Not critical here.
            # print(f"Note: Could not switch to default_content: {e}")
            pass

        return scraped_posts_data

    except TimeoutException:
        print("General timeout while trying to navigate cafe or find initial elements.")
        return []
    except Exception as e:
        print(f"An unexpected error occurred during cafe scraping: {e}")
        return []

def post_comment(driver, post_identifier, comment_text="저요"):
    """
    Attempts to post a comment on a given post.
    VERY CONCEPTUAL. User MUST update selectors for comment iframe, input field, and submit button.
    Assumes 'post_identifier' might be a URL to navigate to, or that driver is already on the post page.
    """
    try:
        # If post_identifier is a URL and we are not already on it:
        if isinstance(post_identifier, str) and post_identifier.startswith("http"):
            if driver.current_url != post_identifier:
                print(f"Navigating to post page: {post_identifier}")
                driver.get(post_identifier)
                time.sleep(random.uniform(2, 4)) # Wait for post page to load
            else:
                print(f"Already on post page: {post_identifier}")
        else:
            # If post_identifier is not a URL, we assume driver is already on the correct page,
            # or it's an ID that needs to be handled differently (e.g. clicking a link first).
            # This part might need more sophisticated handling by the user.
            print(f"Assuming driver is on the correct post page for identifier: {post_identifier}")

        # --- Attempt to switch to a comment iframe (VERY COMMON) ---
        # User MUST find the correct iframe ID or name if one is used for comments.
        # Common iframe IDs: 'CommentFrame', 'comment_iframe', etc.
        comment_iframe_id_placeholder = "CommentFrame" # Placeholder - user must verify
        try:
            print(f"Attempting to switch to comment iframe: {comment_iframe_id_placeholder}...")
            WebDriverWait(driver, 10).until(
                EC.frame_to_be_available_and_switch_to_it((By.ID, comment_iframe_id_placeholder))
            )
            print("Successfully switched to comment iframe.")
        except TimeoutException:
            print(f"Could not switch to comment iframe '{comment_iframe_id_placeholder}'. Assuming comment area is not in a separate iframe, or ID is incorrect.")
            # Continue, hoping comment area is in the current document context (main or cafe_main iframe)

        # --- Placeholder selectors for comment elements ---
        # User MUST replace these with actual selectors.
        comment_textarea_selector = "textarea.comment_textarea, textarea[name='comment'], #comment_editor_textarea" # Placeholder
        comment_submit_button_selector = "button.btn_register, a.btn_comment_submit, input[type='submit'][value='등록']" # Placeholder
        
        print("Looking for comment textarea...")
        comment_field = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, comment_textarea_selector))
        )
        
        print(f"Entering comment: '{comment_text}'")
        # comment_field.click() # Sometimes helpful to focus
        # comment_field.clear() # Clear if there's any default text
        for char in comment_text:
            comment_field.send_keys(char)
            time.sleep(random.uniform(0.05, 0.15))
            
        time.sleep(random.uniform(0.5, 1.0)) # Pause before submitting
        
        print("Looking for comment submit button...")
        submit_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, comment_submit_button_selector))
        )
        
        print("Clicking comment submit button...")
        submit_button.click()
        
        print("Comment submitted. Waiting briefly...")
        time.sleep(random.uniform(2, 4)) # Wait for comment to process / page to update

        # Switch back to the previous context (e.g., default content or 'cafe_main' iframe)
        # If coming from 'cafe_main', we might need to switch to default_content, then back to 'cafe_main'.
        # For simplicity, this stub switches to default_content. User needs to manage iframe context.
        try:
            print("Switching back to default content from comment iframe (if applicable).")
            driver.switch_to.default_content()
            # If the main post content was in 'cafe_main', you might need to re-enter it here
            # if further actions on the post list are needed.
            # Example: driver.switch_to.frame("cafe_main")
        except Exception as e:
            print(f"Note: Could not switch to default_content: {e}")

        print("Comment posting attempt finished.")
        return True

    except TimeoutException:
        print("Comment posting failed: Timeout waiting for comment elements.")
        print("Possible reasons: incorrect URL, page not loaded, or selectors for comment elements need update.")
        # Attempt to switch out of iframe in case of error
        try: driver.switch_to.default_content()
        except: pass
        return False
    except NoSuchElementException as e:
        print(f"Comment posting failed: Could not find an element. Selector needs update: {e}")
        try: driver.switch_to.default_content()
        except: pass
        return False
    except Exception as e:
        print(f"An unexpected error occurred during comment posting: {e}")
        try: driver.switch_to.default_content()
        except: pass
        return False

# --- Main Orchestration ---
def main():
    """Main orchestration function for Naver Cafe automation."""
    
    # --- Initial Setup ---
    # Critical: User must fill in NAVER_ID, NAVER_PW, CAFE_URL, TARGET_LAT, TARGET_LON, CAMPSITE_DB
    # These are checked before main() is called if script is run directly.
    
    print("Starting Naver Cafe Automation Script...")
    # Consider adding a longer initial random delay before even starting browser
    # time.sleep(random.uniform(5, 15)) 

    driver = setup_driver() # User might need to pass the path to their chromedriver executable
    
    if not driver:
        print("Failed to initialize WebDriver. Exiting.")
        return

    logged_in_successfully = False
    if NAVER_ID and NAVER_PW:
        print("\nAttempting to log into Naver...")
        time.sleep(random.uniform(1, 3)) # Short delay before navigating to login
        if login_to_naver(driver, NAVER_ID, NAVER_PW):
            print("Login concluded.") # login_to_naver prints success/failure details
            # A more robust check post-login would be to verify presence of a specific element
            # that only appears when logged in, or that the URL is no longer the login page.
            # For now, we trust the basic checks in login_to_naver.
            if "login" not in driver.current_url.lower() and "nidlogin" not in driver.current_url.lower():
                 logged_in_successfully = True
                 print("Verified: Not on a login page after login attempt. Assuming success.")
            else:
                 print("Warning: Still on a login-related page after login attempt. Assuming failure for safety.")
                 logged_in_successfully = False # Ensure it's false if basic check fails
        else:
            print("Login attempt finished with failure indication from login_to_naver.")
            logged_in_successfully = False
        
        time.sleep(random.uniform(2, 5)) # Delay after login attempt
    else:
        print("\nNaver ID or Password not provided. Proceeding without login.")
        print("Note: Scraping and commenting capabilities may be limited or impossible without login.")
        time.sleep(random.uniform(1, 3))

    # --- Main Automation Loop (conceptual - runs once in this script) ---
    # In a continuous bot, this would be inside a while True loop with longer delays between cycles.
    # For example:
    # while True:
    #     perform_cafe_check_and_actions()
    #     sleep_duration = random.uniform(300, 900) # e.g., 5 to 15 minutes
    #     print(f"Waiting for {sleep_duration/60:.2f} minutes before next check...")
    #     time.sleep(sleep_duration)

    print("\nStarting Cafe interaction cycle...")
    
    # --- Navigate to Cafe and Scrape Posts ---
    if CAFE_URL and CAFE_URL != "https_cafe_naver_com_chocammall": # Basic check for placeholder
        print(f"Preparing to scrape Cafe: {CAFE_URL}")
        time.sleep(random.uniform(2, 4)) # "Human-like" pause before navigating

        posts = scrape_cafe_posts(driver, CAFE_URL) # This function has its own internal delays
        
        if posts:
            print(f"\nScraping attempt yielded {len(posts)} post(s). Analyzing...")
            time.sleep(random.uniform(1, 3)) # Pause after scraping before analysis

            for i, p_data in enumerate(posts):
                print(f"--- Processing Post {i+1}/{len(posts)} (ID: {p_data.get('id', 'N/A')}) ---")
                # print(f"Post Text Snippet: {p_data['text'][:100]}...") # Already printed in scrape_cafe_posts conceptually
                
                time.sleep(random.uniform(0.5, 1.5)) # Small delay before analyzing each post

                if analyze_post(p_data['text'], TARGET_LAT, TARGET_LON, CAMPSITE_DB, MAX_DISTANCE_KM):
                    print(f"POST {i+1} (ID: {p_data.get('id', 'N/A')}) MATCHES ALL CRITERIA!")
                    
                    # Add a more significant "human-like" delay before commenting
                    # Simulates reading the post and deciding to comment.
                    pre_comment_delay = random.uniform(5, 15)
                    print(f"Waiting for {pre_comment_delay:.2f} seconds before attempting to comment...")
                    time.sleep(pre_comment_delay)

                    print(f"Attempting to post comment on post: {p_data.get('id', 'N/A')}")
                    if logged_in_successfully:
                        if post_comment(driver, p_data.get('link') or p_data.get('id'), "저요"):
                            print(f"Successfully attempted to comment on post {p_data.get('id', 'N/A')}.")
                            # Wait significantly after a successful comment to avoid rapid action
                            time.sleep(random.uniform(15, 30))
                        else:
                            print(f"Failed to comment on post {p_data.get('id', 'N/A')}.")
                            time.sleep(random.uniform(3, 7)) # Shorter wait after failed comment
                    else:
                        print("Skipping comment: Not logged in or login failed.")
                        print("Manual intervention would be needed here if post is desirable.")
                        time.sleep(random.uniform(2, 4))
                else:
                    print(f"Post {i+1} (ID: {p_data.get('id', 'N/A')}) does not match all criteria.")
                
                print("-" * 40) # Separator for posts
                # Delay between processing individual posts from the scraped list
                time.sleep(random.uniform(2, 5)) 
        else:
            print("No posts were scraped or returned from scrape_cafe_posts.")
            time.sleep(random.uniform(1, 3))
    else:
        print("CAFE_URL is not set correctly or is placeholder. Cannot scrape posts.")
        time.sleep(random.uniform(1, 3))

    print("\nCafe interaction cycle finished.")
    
    # --- End of Conceptual Main Automation Loop ---

    # Consider adding a longer random delay before closing browser
    # time.sleep(random.uniform(5, 15))

    teardown_driver(driver)
    print("Naver Cafe Automation Script finished.")

if __name__ == "__main__":
    # --- Direct tests for check_keyword ---
    print("--- Testing check_keyword function ---")
    test_cases_check_keyword = {
        "양도합니다 캠핑장 좋아요": True,
        "캠핑장 양도 구합니다": False, # Strong exclusion
        "캠핑장 양도 구해요": False,   # Strong exclusion
        "양도 받아요 캠핑용품": False, # "양도" + "받아요"
        "캠핑카 양도 해주세요": False, # "양도" + "해주세요"
        "글램핑 양도 해주실 분": False, # "양도" + "해주실 분"
        "양도 티켓 구합니다": False, # "구합니다" takes precedence
        "양도 받고 싶어요 구합니다": False, # "구합니다" takes precedence
        "양도만 있는 글": True,
        "그냥 구합니다": False, # No "양도" and has "구합니다"
        "그냥 받아요": False, # No "양도"
        "다른 단어들": False, # No "양도"
        "양도 라는 단어는 있지만, 구해요 라는 단어도 있다면": False # Strong exclusion
    }

    all_keyword_tests_passed = True
    for text, expected in test_cases_check_keyword.items():
        result = check_keyword(text)
        print(f"Test: '{text}' | Expected: {expected} | Got: {result} | Pass: {result == expected}")
        if result != expected:
            all_keyword_tests_passed = False
    
    if all_keyword_tests_passed:
        print("All check_keyword direct tests PASSED!")
    else:
        print("!!! Some check_keyword direct tests FAILED !!!")
    print("--- End of check_keyword tests ---\n")

    # Existing checks for NAVER_ID, NAVER_PW, CAFE_URL
    if not NAVER_ID or not NAVER_PW:
        print("CRITICAL: NAVER_ID and NAVER_PW must be set in the script for login.")
        print("You can still run the script to test scraping without login if desired (functionality might be limited).")
        # Proceeding without login if credentials are not set.
    
    if CAFE_URL == "https_cafe_naver_com_chocammall" or not CAFE_URL: # Check for placeholder or empty
        print("CRITICAL: CAFE_URL is a placeholder or not set. Please set the full correct URL in the script.")
    else:
        main()
