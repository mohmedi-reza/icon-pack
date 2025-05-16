/**
 * Processes SVG content to create a clean, minified version on a single line
 */
export function processSvg(svgContent: string): string {
  try {
    // Extract the viewBox attribute
    const viewBoxMatch = svgContent.match(/viewBox=["']([^"']*)["']/);
    let viewBox = viewBoxMatch ? viewBoxMatch[1] : null;
    
    // If no viewBox, try to create one from width and height
    if (!viewBox) {
      const widthMatch = svgContent.match(/width=["']([^"']*)["']/);
      const heightMatch = svgContent.match(/height=["']([^"']*)["']/);
      
      if (widthMatch && heightMatch) {
        viewBox = `0 0 ${widthMatch[1]} ${heightMatch[1]}`;
      }
    }

    // Clean and minify the inner content
    const cleanedContent = svgContent
      .replace(/<\?xml.*?\?>/g, '') // Remove XML declaration
      .replace(/<!--.*?-->/g, '') // Remove comments
      .replace(/<svg.*?>/g, '') // Remove opening svg tag
      .replace(/<\/svg>/g, '') // Remove closing svg tag
      .replace(/\n/g, ' ') // Replace new lines with spaces
      .replace(/\s{2,}/g, ' ') // Replace multiple spaces with one space
      .replace(/>\s+</g, '><') // Remove whitespace between tags
      .replace(/\s+>/g, '>') // Remove whitespace before closing bracket
      .replace(/<\s+/g, '<') // Remove whitespace after opening bracket
      .replace(/\s+\/>/g, '/>') // Remove whitespace before self-closing tags
      .replace(/\s+=/g, '=') // Remove whitespace before equals sign
      .replace(/=\s+/g, '=') // Remove whitespace after equals sign
      .replace(/\s+:/g, ':') // Remove whitespace before colon
      .replace(/:\s+/g, ':') // Remove whitespace after colon
      .replace(/;\s+/g, ';') // Remove whitespace after semicolon
      .replace(/,\s+/g, ',') // Remove whitespace after comma
      .trim();

    return cleanedContent;
  } catch (error) {
    console.error('Error processing SVG:', error);
    return svgContent;
  }
}

/**
 * Generates a normalized name from a filename
 */
export function normalizeName(filename: string): string {
  return filename
    .replace(/\.svg$/, '') // Remove .svg extension
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s-]+/g, '-') // Replace spaces and multiple hyphens with a single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading and trailing hyphens
    .toLowerCase(); // Convert to lowercase
}

/**
 * Creates a typed object of SVG icons with minified SVG content on a single line
 */
export function createIconPack(icons: { [key: string]: string }, viewBox: string = "0 0 24 24"): string {
  const iconEntries = Object.entries(icons)
    .map(([name, content]) => `  ${name}: \`<svg viewBox="${viewBox}">${content}</svg>\``)
    .join(',\n');
  
  return `export const iconPack = {\n${iconEntries}\n};\n\nexport type IconName = keyof typeof iconPack;\n`;
}

/**
 * Creates a one-line SVG string with the given content and viewBox
 */
export function createSvgString(content: string, viewBox: string = "0 0 24 24"): string {
  return `<svg viewBox="${viewBox}">${content}</svg>`;
}

/**
 * Exports the icon pack to a JavaScript/TypeScript file with minified SVGs
 */
export async function exportIconPack(icons: { [key: string]: string }, format: 'js' | 'ts' = 'ts'): Promise<Blob> {
  const iconPackCode = createIconPack(icons);
  return new Blob([iconPackCode], { type: format === 'ts' ? 'text/typescript' : 'text/javascript' });
} 