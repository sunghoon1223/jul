document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

async function loadProducts() {
    // 사용자가 GitHub에 올린 CSV 파일 경로를 정확히 지정해야 합니다.
    // 예시: const csvFilePath = '../data/jpcaster_validated_20250620_234526.csv';
    // 우선은 로컬 테스트를 위해 제가 만들었던 샘플 CSV 경로를 사용하거나,
    // 또는 사용자님이 알려주신 파일명을 사용합니다.
    // 여기서는 사용자님이 제공해주신 파일명을 사용한다고 가정합니다.
    const csvFilePath = '../data/jpcaster_validated_20250620_234526.csv';

    try {
        const response = await fetch(csvFilePath);
        if (!response.ok) {
            // 파일을 찾지 못하거나 접근 권한이 없는 경우 등
            let userMessage = `<p>제품 정보를 불러오는 데 실패했습니다. (오류 코드: ${response.status})</p>`;
            if (response.status === 404) {
                userMessage += `<p>CSV 파일 경로를 확인해주세요: <code>${csvFilePath}</code></p>`;
                userMessage += `<p>GitHub 저장소의 'data' 폴더에 'jpcaster_validated_20250620_234526.csv' 파일이 정확히 있는지 확인해주세요.</p>`;
            }
            throw new Error(userMessage); // 사용자에게 보여줄 메시지를 오류로 전달
        }
        const csvText = await response.text();
        if (!csvText.trim()) {
            throw new Error("<p>CSV 파일이 비어있습니다.</p>");
        }
        const products = parseCSV(csvText);
        displayProducts(products);
    } catch (error) {
        console.error('Error loading or parsing CSV:', error.message || error);
        const productGrid = document.getElementById('product-grid');
        if (productGrid) {
            // 오류 메시지가 HTML을 포함할 수 있으므로 innerHTML 사용
            productGrid.innerHTML = error.message || '<p>제품 정보를 처리하는 중 알 수 없는 오류가 발생했습니다.</p>';
        }
    }
}

function parseCSV(csvText) {
    const lines = csvText.trim().split('\\n');
    if (lines.length < 2) {
        console.warn("CSV must have a header row and at least one data row.");
        return [];
    }

    const headers = lines[0].split(',').map(header => header.trim().replace(/^"|"$/g, '')); // 따옴표 제거
    const products = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        // 간단한 CSV 값 분리: 쉼표로 구분하되, 따옴표로 묶인 필드 내 쉼표는 무시하지 않음 (한계점)
        // 좀 더 정교한 파싱이 필요하면 PapaParse 같은 라이브러리 사용.
        // 현재는 specifications 필드에 복잡한 문자열이 들어갈 수 있으므로, 단순 split(',')은 위험.
        // 하지만 제공된 데이터는 각 필드가 따옴표로 묶여있지 않고, specifications도 마지막 필드이므로 일단 진행.
        const values = line.split(',');

        if (values.length >= headers.length) { // specifications 필드가 쉼표를 포함할 수 있으므로 >= 로 변경
            const product = {};
            headers.forEach((header, index) => {
                if (header === 'specifications' && index < values.length -1) {
                    // specifications 필드는 마지막 필드이거나, 이후 필드들을 모두 합쳐야 할 수 있음.
                    // 여기서는 마지막 필드라고 가정하고, 그 이전까지의 값들을 먼저 할당.
                    // 만약 specifications가 마지막이 아니라면, 이 로직은 수정되어야 함.
                    // 현재 제공된 데이터에서는 specifications가 마지막에서 두 번째 필드임.
                    // product_url이 마지막 필드.
                    if (index === headers.indexOf('specifications')) {
                         // specifications는 values[index] 부터 values[values.length - 2] 까지 join
                         // product_url이 마지막이므로, specifications는 그 앞까지.
                         // values.slice(index, values.length -1).join(',') -> 이렇게 하면 specifications 필드만 가져옴
                         // 하지만, specifications 필드 자체가 JSON과 유사한 문자열이므로 쉼표를 포함할 수 있음.
                         // 가장 안전한 방법은 specifications 컬럼을 마지막으로 옮기거나, 정규표현식 기반 파서를 사용하는 것.
                         // 현재는 제공된 데이터에서 specifications가 중간에 복잡한 문자열을 포함하는 것으로 보임.
                         // 임시방편: specifications는 그대로 받고, parseSpecifications에서 처리 시도
                         product[header] = values.slice(index, values.length - headers.indexOf('product_url') + index).join(',').trim().replace(/^"|"$/g, '');
                    } else {
                         product[header] = values[index] ? values[index].trim().replace(/^"|"$/g, '') : '';
                    }
                } else if (header === 'product_url' && index === headers.length -1) { // product_url은 확실히 마지막
                    product[header] = values[values.length-1] ? values[values.length-1].trim().replace(/^"|"$/g, '') : '';
                }
                 else if (index < values.length) { // 일반적인 경우
                    product[header] = values[index] ? values[index].trim().replace(/^"|"$/g, '') : '';
                } else {
                    product[header] = ''; // 값이 없는 경우
                }
            });
            // specifications 필드 재조립 (위 로직에서 문제가 있을 수 있어, 여기서 다시 한번 시도)
            // product_id 부터 dimensions 까지는 정상적으로 파싱되었다고 가정.
            // image_url, image_gallery, specifications, product_url 순서.
            // specifications는 쉼표를 포함할 수 있으므로, values 배열에서 해당 부분을 잘라내어 합쳐야 함.
            const specStartIndex = headers.indexOf('specifications');
            const productUrlIndex = headers.indexOf('product_url');
            if (specStartIndex !== -1 && productUrlIndex !== -1 && specStartIndex < productUrlIndex) {
                product['specifications'] = values.slice(specStartIndex, productUrlIndex).join(',').trim().replace(/^"|"$/g, '');
            }


            products.push(product);
        } else {
            // console.warn(`Skipping line ${i+1} due to mismatched column count. Expected ${headers.length}, got ${values.length}. Line: ${line}`);
        }
    }
    return products;
}

function parseSpecifications(specString) {
    const specs = {};
    if (!specString || typeof specString !== 'string' || !(specString.startsWith('{') && specString.endsWith('}'))) {
        return {Error: 'Invalid specifications format'};
    }

    try {
        // 작은따옴표를 큰따옴표로 변경
        let jsonCompliantString = specString.replace(/'/g, '"');
        // 키 내부의 콜론 처리 (예: 'Wheel diameter：' -> 'Wheel diameter：')
        // JSON 키는 문자열이어야 하므로, 이미 큰따옴표로 감싸져야 함.
        // 이스케이프된 문자 (\xa0, \u200d 등) 처리 -> JSON.parse가 처리할 수 있도록 그대로 둠.

        // 예시 데이터의 키에 콜론이 포함되어 있음 'Wheel diameter：'
        // 올바른 JSON 형태가 되도록 수정해야 함.
        // ex: "{ \"Wheel diameter：\": \"75~200mm\", ... }"
        // 정규식으로 키를 찾아 따옴표로 감싸는 작업이 필요할 수 있음
        // 'key：': 'value' -> "key：": "value"

        // 가장 간단한 방법은 python dict 문자열을 json.loads 하듯이 하는 것인데, JS에서는 직접 안됨.
        // eval()은 보안 위험. new Function()도 유사.

        // 임시로 매우 단순한 키-값 추출 (콜론 기준으로)
        // 더 나은 방법: 정규식으로 {'key': 'value', ...} 패턴을 찾아 분리
        jsonCompliantString = jsonCompliantString.substring(1, jsonCompliantString.length - 1); // 중괄호 제거
        const entries = jsonCompliantString.split('", "'); // ", " 로 분리 시도 (키와 값 사이의 구분자)
                                                       // 이 방식은 값 내에 ", " 가 있으면 깨짐.
                                                       // 제공된 데이터는 'key': 'value' 형태이므로, ':' 로 분리.

        // 정규식으로 각 'key': 'value' 쌍을 추출
        const regex = /"([^"]+)":\s*"([^"]*(\\"[^"]*)*)"/g; // 키와 문자열 값을 추출하는 정규식
                                                        // 값에 이스케이프된 따옴표가 있을 수 있음.
                                                        // 또는 /"([^"]+)":\s*('([^']*)'|"([^"]*)"|[\w\d.-]+)/g
        let match;
        const tempSpecs = {};
        // JSON.parse를 사용하기 위해 문자열을 재구성하는 대신, 직접 파싱
        // 'Wheel diameter：': '75~200mm' 같은 형태
        const specParts = specString.slice(1, -1).split(/',\s*'/); // {'A':'B', 'C':'D'} -> A':'B , C':'D
        specParts.forEach(part => {
            const [keyCandidate, ...valueParts] = part.split("': '"); // A, B
            let key = keyCandidate.replace(/^'|'$/g, "").trim(); // 키에서 따옴표 제거
            let value = valueParts.join("': '").replace(/^'|'$/g, "").trim(); // 값에서 따옴표 제거

            // 키 이름에서 마지막 콜론 제거 (있는 경우)
            if (key.endsWith('：')) key = key.slice(0, -1);

            // 주요 스펙 항목만 선택 (사용자 피드백 반영 필요)
            if (['Wheel diameter', 'Loading capacity', 'Tread material', 'Wheel width', 'Tread hardness', 'Tread color', 'Fork material', 'Wheel core', 'Rolling speed', 'Temperature', 'Model'].includes(key)) {
                 // HTML 엔티티 디코드 (예: &nbsp; -> 공백) - 간단히 \xa0 만 처리
                specs[key.trim()] = value.replace(/\xa0/g, ' ').trim();
            }
        });


    } catch (e) {
        // console.error('Error parsing specifications string:', specString, e);
        return { Error: "Spezifikationen konnten nicht geparst werden" };
    }
    return specs;
}


function displayProducts(products) {
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) {
        console.error('Product grid container not found!');
        return;
    }
    productGrid.innerHTML = '';

    if (!products || products.length === 0) {
        productGrid.innerHTML = '<p>표시할 제품이 없습니다. CSV 파일 내용을 확인해주세요.</p>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        // image_url이 실제 파일명이라고 가정. (예: 'JP-354_image_1.gif')
        const imageName = product.image_url || 'placeholder.png';
        const imagePath = `../public/images/${imageName}`; // index.html 기준 상대 경로

        const price = product.sale_price || product.regular_price;
        // 가격이 비어있거나 0일 경우 "가격 문의" 등으로 표시
        const displayPrice = (price && parseFloat(price) > 0) ? `₩${parseFloat(price).toLocaleString()}` : '가격 문의';

        const specsObject = parseSpecifications(product.specifications);
        let specsHTML = '<ul class="specs-list">';
        let specCount = 0;
        for (const key in specsObject) {
            if (specsObject.hasOwnProperty(key) && specsObject[key] && key !== 'Error') {
                specsHTML += `<li><strong>${key}:</strong> ${specsObject[key]}</li>`;
                specCount++;
            }
        }
        specsHTML += '</ul>';
        if (specCount === 0) {
            specsHTML = '<p class="specs-unavailable">주요 스펙 정보 없음</p>';
        }

        card.innerHTML = `
            <div class="product-image-wrapper">
                <img src="${imagePath}" alt="${product.product_name || 'Product Image'}" onerror="this.onerror=null; this.src='../public/images/placeholder.png'; this.alt='이미지를 찾을 수 없습니다: ${imageName}';">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.product_name || '제품명 없음'}</h3>
                <p class="product-sku">SKU: ${product.sku || 'N/A'}</p>
                <p class="product-price">${displayPrice}</p>
                <div class="product-specs">
                    <h4>주요 스펙:</h4>
                    ${specsHTML}
                </div>
                ${product.short_description ? `<p class="product-short-desc">${product.short_description}</p>` : ''}
            </div>
        `;

        if (product.product_url) {
            const detailLink = document.createElement('a');
            detailLink.href = product.product_url;
            detailLink.textContent = '제품 상세 보기';
            detailLink.className = 'product-detail-link';
            detailLink.target = '_blank';

            const linkWrapper = document.createElement('div');
            linkWrapper.className = 'detail-link-wrapper';
            linkWrapper.appendChild(detailLink);
            card.appendChild(linkWrapper);
        }

        productGrid.appendChild(card);
    });
}
