import math
import re

def haversine(lat1, lon1, lat2, lon2):
    """
    Calculates the distance in kilometers between two points given their
    latitudes and longitudes using the Haversine formula.
    """
    R = 6371  # Radius of Earth in kilometers

    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad

    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    distance = R * c
    return distance

def check_dates(post_text):
    """
    Searches for dates like "6월 6일", "6/6", "June 6" etc. and checks for a
    2-night, 3-day pattern (e.g., "6월 6일 ~ 6월 8일", "6/6 ~ 6/8", "6월 6,7,8일").
    Specifically looks for the range June 6th to June 8th.
    Returns: True if the specific 2-night, 3-day (June 6-8) pattern is found, False otherwise.
    """
    # Pattern for "6월 6일 ~ 6월 8일" or "6월 6일~6월 8일" (with or without space around ~)
    pattern1 = r"6월\s*6일\s*~\s*6월\s*8일"
    # Pattern for "6/6 ~ 6/8" or "6/6~6/8"
    pattern2 = r"6/6\s*~\s*6/8"
    # Pattern for "June 6 ~ June 8" or "June 6~June 8" (case-insensitive)
    pattern3 = r"June\s*6\s*~\s*June\s*8"
    # Pattern for "6월 6,7,8일" or "6월 6, 7, 8일"
    pattern4 = r"6월\s*6\s*,\s*7\s*,\s*8\s*일"
    # Pattern for "June 6,7,8" or "June 6, 7, 8" (case-insensitive)
    pattern5 = r"June\s*6\s*,\s*7\s*,\s*8"
    # Pattern for "6/6,7,8" or "6/6, 7, 8"
    pattern6 = r"6/6\s*,\s*7\s*,\s*8"
    # Pattern for "6월 6일 부터 6월 8일 까지" (with or without space around 부터/까지)
    pattern7 = r"6월\s*6일\s*부터\s*6월\s*8일\s*까지"
    # Pattern for "6월 6일 부터 8일 까지" (short end date)
    pattern8 = r"6월\s*6일\s*부터\s*8일\s*까지"


    if re.search(pattern1, post_text) or \
       re.search(pattern2, post_text) or \
       re.search(pattern3, post_text, re.IGNORECASE) or \
       re.search(pattern4, post_text) or \
       re.search(pattern5, post_text, re.IGNORECASE) or \
       re.search(pattern6, post_text) or \
       re.search(pattern7, post_text) or \
       re.search(pattern8, post_text):
        return True
    return False

def check_keyword(post_text):
    """
    Checks if the post text contains the keyword "양도" (offering a transfer)
    and does NOT contain keywords indicating seeking a transfer (e.g., "구합니다", "구해요").

    Args:
        post_text (str): The text content of the post.

    Returns:
        bool: True if "양도" is present and "구합니다"/"구해요" are absent, False otherwise.
    """
    has_offer_keyword = "양도" in post_text
    has_seeking_keyword1 = "구합니다" in post_text
    has_seeking_keyword2 = "구해요" in post_text

    if has_offer_keyword and not has_seeking_keyword1 and not has_seeking_keyword2:
        return True
    return False

def check_location(post_text, target_lat, target_lon, campsite_db):
    """
    Extracts potential campsite names from post_text.
    For each found campsite name, retrieves its lat/lon from campsite_db.
    Calculates the distance to target_lat, target_lon using haversine.
    Returns: True if any mentioned campsite is within 150km, False otherwise.
    """
    for campsite_name, details in campsite_db.items():
        if campsite_name in post_text:
            distance = haversine(target_lat, target_lon, details['lat'], details['lon'])
            if distance <= 150:
                return True
    return False

def analyze_post(post_text, target_lat, target_lon, campsite_db):
    """
    Calls check_dates, check_keyword, and check_location.
    Returns: True if all checks pass, False otherwise.
    """
    dates_ok = check_dates(post_text)
    keyword_ok = check_keyword(post_text)
    location_ok = check_location(post_text, target_lat, target_lon, campsite_db)

    return dates_ok and keyword_ok and location_ok


def post_comment_stub(post_identifier, comment_text):
    """
    Placeholder function to simulate posting a comment.
    In a real implementation, this function would interact with Naver Cafe
    (e.g., via browser automation) to post the comment.

    Args:
        post_identifier (str): An identifier for the post (e.g., URL or ID).
        comment_text (str): The comment to be posted.
    """
    print(f"Attempting to post comment on post '{post_identifier}': '{comment_text}'")
    print("This is a stub function. Actual commenting logic needs to be implemented externally.")
    # In a real scenario, this function would return True on success, False on failure.
    # For this stub, we'll just assume it 'succeeded' for conceptual flow.
    return True

if __name__ == "__main__":
    # Placeholder for Suwon (경기도 수원시 장안구 하률로30번길 22)
    # Actual coordinates should be looked up.
    # For example, using a geocoding service, Suwon City Hall is approx:
    # Lat: 37.2636, Lon: 127.0286
    # Using a placeholder for the specific address given:
    target_lat_suwon = 37.280 # Placeholder
    target_lon_suwon = 126.980 # Placeholder

    campsite_database = {
        "용인 자연휴양림": {'lat': 37.2387, 'lon': 127.2045}, # Actual coords for example
        "자라섬 캠핑장": {'lat': 37.7777, 'lon': 127.5555}, # Placeholder
        "망상오토캠핑리조트": {'lat': 37.4300, 'lon': 129.0450}, # Placeholder, quite far
        "서울대공원 캠핑장": {'lat': 37.427, 'lon': 127.016 }, # Relatively close to Suwon
        "해피캠핑장": {'lat': 37.30, 'lon': 127.00} # Close to Suwon placeholder
    }

    # Define some post texts to be used in the loop
    post1_text = "6월 6일 ~ 6월 8일 용인 자연휴양림 양도합니다. 좋은 자리입니다." # analyze_post: True
    post3_text = "망상오토캠핑리조트 양도합니다. 6월 6,7,8일 일정입니다." # analyze_post: False (Far location)
    post5_text = "양도) 용인 자연휴양림 6월5일~6월7일 일정입니다." # analyze_post: False (Wrong dates)
    sample_post_matching_all = "6월 6일 부터 6월 8일 까지 양도합니다. 좋은 캠핑장이에요. 위치는 해피캠핑장이고요." # analyze_post: True
    post_양도_구함 = "6월 6일~8일 캠핑 양도 받고 싶어요 또는 양도 구합니다! 연락주세요. 장소는 어디든." # analyze_post: False (keyword "구합니다")


    # --- Direct Function Tests (kept for unit verification) ---
    print("--- Direct Function Tests ---")
    # Test haversine
    # Suwon City Hall to Yongin Recreational Forest (approx)
    dist_suwon_yongin = haversine(37.2636, 127.0286, 37.2387, 127.2045)
    print(f"Distance Suwon City Hall to Yongin Recreational Forest: {dist_suwon_yongin:.2f} km")

    # Suwon City Hall to Mangsang Auto Camping Resort (approx)
    dist_suwon_mangsang = haversine(37.2636, 127.0286, 37.4300, 129.0450)
    print(f"Distance Suwon City Hall to Mangsang Auto Camping Resort: {dist_suwon_mangsang:.2f} km")

    # Test date check variations
    print(f"\nDate check '6월6일~6월8일': {check_dates('6월6일~6월8일')}") # True
    print(f"Date check 'June 6,7,8': {check_dates('June 6,7,8')}") # True
    print(f"Date check '6/6, 7, 8': {check_dates('6/6, 7, 8')}") # True
    print(f"Date check '6월 6일 부터 8일까지': {check_dates('6월 6일 부터 8일까지')}") # Should be True now
    print(f"Date check '6월 6일 부터 6월 8일 까지': {check_dates('6월 6일 부터 6월 8일 까지')}") # Should be True now

    # Test keyword check (Updated tests)
    print(f"\ncheck_keyword('양도합니다'): {check_keyword('양도합니다')}") # Expected: True
    print(f"check_keyword('양도 구해요'): {check_keyword('양도 구해요')}") # Expected: False
    print(f"check_keyword('양도 구합니다'): {check_keyword('양도 구합니다')}") # Expected: False
    print(f"check_keyword('양도 원해요 하지만 구합니다'): {check_keyword('양도 원해요 하지만 구합니다')}") # Expected: False
    print(f"check_keyword('그냥 양도'): {check_keyword('그냥 양도')}") # Expected: True
    print(f"check_keyword('구해요 그리고 양도'): {check_keyword('구해요 그리고 양도')}") # Expected: False
    print(f"check_keyword('이양합니다'): {check_keyword('이양합니다')}") # Expected: False (No "양도")
    print("--- End of Direct Function Tests ---\n")

    # --- Processing a list of manual posts ---
    print("--- Processing List of Manual Posts ---")
    manual_posts = [
        sample_post_matching_all, # Expected: True (all conditions met)
        post_양도_구함,           # Expected: False (due to "구합니다" in keyword check)
        post3_text,               # Expected: False (Far location)
        post5_text,               # Expected: False (Wrong dates)
        post1_text                # Expected: True (all conditions met)
    ]

    for index, post_text_item in enumerate(manual_posts):
        print(f"\nProcessing post {index + 1}/{len(manual_posts)}: '{post_text_item[:50]}...'")
        analysis_result = analyze_post(post_text_item, target_lat_suwon, target_lon_suwon, campsite_database)
        print(f"Analysis result: {analysis_result}")

        if analysis_result:
            post_comment_stub(f"manual_post_id_{index}", "저요")
    print("--- End of Processing List ---")
