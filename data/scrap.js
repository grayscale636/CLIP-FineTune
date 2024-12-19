// Menggunakan Puppeteer untuk scraping
const puppeteer = require('puppeteer');

async function scrapeImageDescriptions() {
    try {
        // Launch browser
        const browser = await puppeteer.launch({
            headless: "new"  // Menggunakan mode headless baru
        });

        // Buka tab baru
        const page = await browser.newPage();

        // Kunjungi URL
        await page.goto('https://popsy.co/illustrations', {
            waitUntil: 'networkidle0'
        });

        // Tunggu sampai elemen gambar dimuat
        await page.waitForSelector('img');

        // Ekstrak semua deskripsi gambar
        const descriptions = await page.evaluate(() => {
            const images = document.querySelectorAll('img');
            return Array.from(images).map(img => ({
                alt: img.alt || '',
                title: img.title || '',
                src: img.src
            }));
        });

        // Tutup browser
        await browser.close();

        // Filter dan format hasil
        const formattedDescriptions = descriptions
            .filter(desc => desc.alt || desc.title)
            .map(desc => ({
                description: (desc.alt || desc.title).toLowerCase(),
                imageUrl: desc.src
            }));

        return formattedDescriptions;

    } catch (error) {
        console.error('Terjadi kesalahan:', error);
        return [];
    }
}

// Fungsi untuk menjalankan scraper
async function main() {
    console.log('Memulai scraping...');
    const results = await scrapeImageDescriptions();
    
    console.log('Hasil scraping:');
    results.forEach((item, index) => {
        console.log(`\nGambar ${index + 1}:`);
        console.log('Deskripsi:', item.description);
        console.log('URL Gambar:', item.imageUrl);
    });
}

// Jalankan script
main();