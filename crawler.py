import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin # For making relative URLs absolute
import csv # Import the csv module

def fetch_page_html(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    try:
        response = requests.get(url, headers=headers, timeout=20)
        response.raise_for_status()
        return response.text
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred for {url}: {http_err} - Status code: {response.status_code if 'response' in locals() else 'N/A'}")
    except requests.exceptions.ConnectionError as conn_err:
        print(f"Connection error occurred for {url}: {conn_err}")
    except requests.exceptions.Timeout as timeout_err:
        print(f"Timeout error occurred for {url}: {timeout_err}")
    except requests.exceptions.RequestException as req_err:
        print(f"An unexpected error occurred for {url}: {req_err}")
    return None

def extract_product_detail_page_links(page_soup, base_url):
    product_links = []
    link_tags = page_soup.find_all('a', href=lambda href: href and 'pd.jsp' in href)

    for tag in link_tags:
        href = tag.get('href')
        if href:
            absolute_url = urljoin(base_url, href)
            if absolute_url not in product_links:
                 product_links.append(absolute_url)
    return product_links

def translate_to_korean(text_to_translate):
    if text_to_translate and text_to_translate.strip():
        return f"{text_to_translate} - KOREAN TRANSLATED"
    return text_to_translate

def extract_product_details(product_detail_url, base_url):
    product_info = {'image_url': None, 'specifications': None, 'translated_specifications': None}
    html_content = fetch_page_html(product_detail_url)

    if not html_content:
        # Error message already printed by fetch_page_html
        return product_info, None

    soup = BeautifulSoup(html_content, 'html.parser')

    main_image_url = None
    zoom_pad_img = soup.find('img', id='zoomPad_img')
    if zoom_pad_img:
        image_src = zoom_pad_img.get('data-original') or zoom_pad_img.get('src') or zoom_pad_img.get('loadoriginal')
        if image_src:
            main_image_url = urljoin(base_url, image_src)

    if not main_image_url:
        image_module = soup.find('div', id='module538')
        if not image_module:
            image_module = soup.find('div', id='module14')

        if image_module:
            img_tag_in_module = image_module.find('img', src=lambda s: s and 'faiusr.com' in s)
            if img_tag_in_module:
                image_src = img_tag_in_module.get('data-original') or img_tag_in_module.get('src')
                if image_src:
                    main_image_url = urljoin(base_url, image_src)
    product_info['image_url'] = main_image_url

    specifications_text = None
    texts_collected = []

    specs_container_module = soup.find('div', id='module538')
    if not specs_container_module:
        specs_container_module = soup.find('div', id='module14')

    if specs_container_module:
        product_name_el = specs_container_module.find('div', class_='productName')
        if product_name_el:
            texts_collected.append(product_name_el.get_text(strip=True))

        form_value_divs = specs_container_module.find_all('div', class_='formValue')
        temp_spec_texts = []
        for div in form_value_divs:
            text = div.get_text(strip=True)
            if "分享到" in text or "马上咨询" in text or "立即购买" in text:
                continue
            label_el = div.find_previous_sibling('div', class_='formName')
            if not label_el:
                 label_el = div.parent.find('div', class_='formName')

            if label_el:
                temp_spec_texts.append(f"{label_el.get_text(strip=True)} {text}")
            else:
                temp_spec_texts.append(text)

        rich_text_content = specs_container_module.find('div', class_='richText')
        if rich_text_content:
            temp_spec_texts.append(rich_text_content.get_text(separator='\n', strip=True))

        if temp_spec_texts: # Check if temp_spec_texts has content before extending
            texts_collected.extend(temp_spec_texts)
        elif not product_name_el and texts_collected: # Only if product_name was not found AND some texts were already collected (edge case)
            pass # Avoid adding all module text if specific parts were already found.
        elif not product_name_el : # If no specific parts found at all (productName or formValues/richText)
            all_module_text = specs_container_module.get_text(separator=' ', strip=True)
            all_module_text = all_module_text.replace("分享到：", "").replace("马上咨询", "").replace("立即购买", "")
            texts_collected.append(all_module_text)
    else:
        # Fallback if specific modules not found
        general_spec_divs = soup.find_all('div', class_lambda=lambda x: x and any(c in x for c in ['property', 'richText', 'productParameters', 'specDetail']))
        if general_spec_divs:
            for div in general_spec_divs:
                if len(div.get_text(strip=True)) < 5000:
                    texts_collected.append(div.get_text(separator=' ', strip=True))

    if texts_collected:
        unique_texts = []
        seen_texts = set()
        for text_item in texts_collected:
            if text_item and text_item not in seen_texts: # Ensure text_item is not None or empty before adding
                unique_texts.append(text_item)
                seen_texts.add(text_item)
        if unique_texts: # Ensure unique_texts is not empty before join
             specifications_text = " | ".join(unique_texts)

    product_info['specifications'] = specifications_text
    product_info['translated_specifications'] = translate_to_korean(specifications_text)

    return product_info, soup

if __name__ == '__main__':
    base_url = "http://www.jpcaster.cn"

    user_urls = [
        "http://www.jpcaster.cn/col.jsp?id=106", "http://www.jpcaster.cn/pr.jsp?_jcp=3_223",
        "http://www.jpcaster.cn/pr.jsp?_jcp=3_225", "http://www.jpcaster.cn/pr.jsp?_jcp=3_3",
        "http://www.jpcaster.cn/pr.jsp?_jcp=3_4", "http://www.jpcaster.cn/pr.jsp?_jcp=3_5",
        "http://www.jpcaster.cn/pr.jsp?_jcp=3_81", "http://www.jpcaster.cn/pr.jsp?_jcp=3_82",
        "http://www.jpcaster.cn/pr.jsp?_jcp=3_83", "http://www.jpcaster.cn/pr.jsp?_jcp=3_251",
        "http://www.jpcaster.cn/pr.jsp?_jcp=3_179", "http://www.jpcaster.cn/pr.jsp?_jcp=3_237",
        "http://www.jpcaster.cn/pr.jsp?_jcp=3_182", "http://www.jpcaster.cn/pr.jsp?_jcp=3_180",
        "http://www.jpcaster.cn/pr.jsp?_jcp=3_228", "http://www.jpcaster.cn/pr.jsp?_jcp=3_236",
        "http://www.jpcaster.cn/pr.jsp?_jcp=3_183", "http://www.jpcaster.cn/pr.jsp?_jcp=3_184",
        "http://www.jpcaster.cn/pr.jsp?_jcp=3_185", "http://www.jpcaster.cn/pr.jsp?_jcp=3_157",
        "http://www.jpcaster.cn/pr.jsp?_jcp=3_159", "http://www.jpcaster.cn/pr.jsp?_jcp=3_161",
        "http://www.jpcaster.cn/pr.jsp?_jcp=3_165", "http://www.jpcaster.cn/pr.jsp?_jcp=3_167",
        "http://www.jpcaster.cn/pr.jsp?_jcp=3_168", "http://www.jpcaster.cn/pr.jsp?_jcp=3_169",
        "http://www.jpcaster.cn/pr.jsp?_jcp=3_173", "http://www.jpcaster.cn/pr.jsp?_jcp=3_176",
        "http://www.jpcaster.cn/pr.jsp?_jcp=3_178", "http://www.jpcaster.cn/pr.jsp?_jcp=3_212"
    ]

    all_product_detail_links = set()
    print("--- Step 1: Collecting Product Detail Page Links ---")
    for idx, category_url in enumerate(user_urls):
        print(f"Processing category URL ({idx+1}/{len(user_urls)}): {category_url}")
        html_content = fetch_page_html(category_url)
        if html_content:
            soup = BeautifulSoup(html_content, 'html.parser')
            links_from_category = extract_product_detail_page_links(soup, base_url)
            if links_from_category:
                print(f"  Found {len(links_from_category)} pd.jsp link(s) on this page.")
                all_product_detail_links.update(links_from_category)
            else:
                print(f"  No pd.jsp links found on {category_url}")
        # else: # fetch_page_html already prints error
            # print(f"  Failed to fetch HTML for {category_url}") # Redundant

    print(f"\n--- Total unique product detail page links found: {len(all_product_detail_links)} ---")
    print("----------------------------------------------------")

    all_product_data = []
    print("\n--- Step 2: Extracting and Aggregating Product Data ---")
    if not all_product_detail_links:
        print("No product detail links to process.")
    else:
        for i, product_url in enumerate(all_product_detail_links):
            print(f"Processing product detail URL ({i+1}/{len(all_product_detail_links)}): {product_url}")
            extracted_info, _ = extract_product_details(product_url, base_url)

            img_url = extracted_info.get('image_url')
            trans_specs = extracted_info.get('translated_specifications')

            if img_url and trans_specs:
                all_product_data.append({
                    'image_url': img_url,
                    'translated_specifications': trans_specs
                })
            else:
                print(f"  Failed to extract complete details (image/specs) for {product_url}, skipping.")

    print("--- Aggregation Complete ---")

    # --- CSV File Generation ---
    if all_product_data:
        csv_file_name = 'jpcaster.csv'
        csv_headers = ['image_url', 'korean_specifications']

        try:
            with open(csv_file_name, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=csv_headers)
                writer.writeheader()
                for product_dict in all_product_data:
                    row_to_write = {
                        'image_url': product_dict['image_url'],
                        'korean_specifications': product_dict['translated_specifications']
                    }
                    writer.writerow(row_to_write)
            print(f"\nSuccessfully generated {csv_file_name} with {len(all_product_data)} products.")
        except IOError as e:
            print(f"IOError: Could not write to CSV file {csv_file_name}. Error: {e}")
    else:
        print("\nNo product data was successfully extracted, so no CSV file generated.")

    print(f"\nTotal products successfully extracted and aggregated: {len(all_product_data)}")
    print("---------------------------------------------------")
