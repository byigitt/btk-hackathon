const sharp = require('sharp');
const { promises: fs } = require('node:fs');
const path = require('node:path');

const SIZES = [16, 32, 48, 64, 96, 128, 192, 256, 512];
const INPUT_SVG_LIGHT = path.join(__dirname, '../public/search-icon-light.svg');
const INPUT_SVG_DARK = path.join(__dirname, '../public/search-icon-dark.svg');
const OUTPUT_DIR = path.join(__dirname, '../public/icons');

async function generateThemeIcons(theme) {
  const inputSvg = theme === 'light' ? INPUT_SVG_LIGHT : INPUT_SVG_DARK;
  const themeDir = path.join(OUTPUT_DIR, theme);

  try {
    // Create theme directory if it doesn't exist
    await fs.mkdir(themeDir, { recursive: true });

    // Read the SVG file
    const svgBuffer = await fs.readFile(inputSvg);

    // Generate PNGs for each size
    const conversions = SIZES.map(async (size) => {
      const outputPath = path.join(themeDir, `search-icon-${size}.png`);
      
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`✓ Generated ${theme} ${size}x${size} icon`);
    });

    // Generate favicon.png
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(themeDir, 'favicon.png'));
    
    console.log(`✓ Generated ${theme} favicon.png`);

    await Promise.all(conversions);
    console.log(`\n✨ All ${theme} icons generated successfully!`);

  } catch (error) {
    console.error(`Error generating ${theme} icons:`, error);
    process.exit(1);
  }
}

async function generateAllIcons() {
  await generateThemeIcons('light');
  await generateThemeIcons('dark');
}

generateAllIcons();