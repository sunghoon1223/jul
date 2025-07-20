import fs from 'fs';
import path from 'path';

const productsPath = path.join(process.cwd(), 'lovable', 'src', 'data', 'products.json');
const imagesDir = path.join(process.cwd(), 'lovable', 'public', 'images');

fs.readFile(productsPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading products.json:', err);
    return;
  }

  const products = JSON.parse(data);
  fs.readdir(imagesDir, (err, files) => {
    if (err) {
      console.error('Error reading images directory:', err);
      return;
    }

    const imageFiles = files.filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.gif'));

    const updatedProducts = products.map((product, index) => {
      const imageName = imageFiles[index % imageFiles.length];
      const newImageUrl = `/images/${imageName}`;
      return {
        ...product,
        main_image_url: newImageUrl,
        image_urls: [newImageUrl],
      };
    });

    fs.writeFile(productsPath, JSON.stringify(updatedProducts, null, 2), 'utf8', (err) => {
      if (err) {
        console.error('Error writing updated products.json:', err);
        return;
      }
      console.log('Successfully updated image paths in products.json');
    });
  });
});
