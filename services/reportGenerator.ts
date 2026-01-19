import { jsPDF } from 'jspdf';
import { TimelineEntry } from '../types';

interface ExportOptions {
    title: string;
    includeImages: boolean;
}

const LETTERHEAD_URL = '/letterhead_template.jpg';

// Robust image loader with CORS Proxy support
const loadImage = async (url: string): Promise<string> => {
    // 1. If it's a local file (starting with /), fetch directly.
    if (url.startsWith('/')) {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    // 2. For external images, use a CORS proxy to bypass protection (e.g., Google Drive thumbnails)
    // We use wsrv.nl which is a reliable public image proxy.
    const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=1000&output=jpg`;

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error(`Failed to fetch image via proxy: ${response.statusText}`);
        const blob = await response.blob();

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.warn("Proxy load failed, trying direct fallback...", e);
        // 3. Fallback: Direct fetch (only works if the server allows CORS)
        try {
            const response = await fetch(url, { mode: 'cors' });
            if (!response.ok) throw new Error('Direct fetch failed');
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (directError) {
            throw new Error("Image load completely failed");
        }
    }
};

export const generateReport = async (entries: TimelineEntry[], options: ExportOptions) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Load template background
    let templateBase64: string | null = null;
    try {
        templateBase64 = await loadImage(LETTERHEAD_URL);
    } catch (e) {
        console.warn("Could not load letterhead template", e);
    }

    // Process each entry
    for (const [index, entry] of entries.entries()) {
        if (index > 0) doc.addPage();

        // 1. Draw Background
        if (templateBase64) {
            doc.addImage(templateBase64, 'JPEG', 0, 0, pageWidth, pageHeight);
        }

        // 2. Content Layout
        // Start lower to clear the header logo in the template
        let cursorY = 60;

        // Title
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0); // Black
        doc.setFont('helvetica', 'bold');

        // Add Numbering
        const numberedTitle = `${index + 1}. ${entry.title}`;

        // Render title wrapping correctly
        const titleDims = doc.getTextDimensions(numberedTitle, { maxWidth: contentWidth });
        doc.text(numberedTitle, margin, cursorY, { maxWidth: contentWidth, align: 'left' });
        cursorY += titleDims.h + 8;

        // Date & Category
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80); // Dark Grey
        const dateStr = new Date(entry.date).toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        doc.text(`${dateStr} | ${entry.category}`, margin, cursorY);
        cursorY += 12;

        // Description
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);

        // Clean description text
        const cleanDesc = entry.description.replace(/\s+/g, ' ').trim();

        // Manual wrapping to ensure ABSOLUTELY NO justification artifacts
        // We split into lines and draw each one manually
        const descLines = doc.splitTextToSize(cleanDesc, contentWidth);
        const lineHeight = 6.5;

        descLines.forEach((line: string, i: number) => {
            doc.text(line, margin, cursorY + (i * lineHeight));
        });

        cursorY += (descLines.length * lineHeight) + 15;

        // Images
        if (options.includeImages) {
            const imagesToLoad = entry.mediaUrls || (entry.mediaUrl ? [entry.mediaUrl] : []);

            if (imagesToLoad.length > 0) {
                // Check pagination for images
                if (cursorY > pageHeight - 80) {
                    doc.addPage();
                    if (templateBase64) doc.addImage(templateBase64, 'JPEG', 0, 0, pageWidth, pageHeight);
                    cursorY = 60;
                }

                for (const imgUrl of imagesToLoad) {
                    try {
                        const imgBase64 = await loadImage(imgUrl);

                        // Calculate dimensions
                        const imgProps = doc.getImageProperties(imgBase64);
                        const imgHeight = (imgProps.height * contentWidth) / imgProps.width;

                        // Check if it fits on page
                        if (cursorY + imgHeight > pageHeight - margin) {
                            doc.addPage();
                            if (templateBase64) doc.addImage(templateBase64, 'JPEG', 0, 0, pageWidth, pageHeight);
                            cursorY = 60;
                        }

                        doc.addImage(imgBase64, 'JPEG', margin, cursorY, contentWidth, imgHeight);
                        cursorY += imgHeight + 10;
                    } catch (e) {
                        // Fallback Placeholder for failed images
                        doc.setFillColor(245, 245, 245); // Very light grey
                        doc.setDrawColor(200, 200, 200);
                        doc.rect(margin, cursorY, contentWidth, 50, 'FD');

                        doc.setFontSize(9);
                        doc.setTextColor(150, 150, 150);
                        doc.text("Image unavailable (Load Failed)", margin + 10, cursorY + 25);

                        cursorY += 60;
                    }
                }
            }
        }
    }

    doc.save(`Dept_Timeline_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};
