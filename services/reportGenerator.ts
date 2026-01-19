import { jsPDF } from 'jspdf';
import { TimelineEntry } from '../types';

interface ExportOptions {
    title: string;
    includeImages: boolean;
}

const LETTERHEAD_URL = '/letterhead_template.jpg';

// Helper to load image as base64
const loadImage = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = url;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg'));
        };
        img.onerror = (e) => reject(e);
    });
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

        // 2. Header Content (Adjust Y based on template headers if known)
        // Assuming the template has a header, we start content a bit lower.
        // Let's guess 50mm down.
        let cursorY = 50;

        // Title
        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0); // Black
        doc.setFont('helvetica', 'bold');

        // Handle long titles wrapping
        const titleLines = doc.splitTextToSize(entry.title, contentWidth);
        doc.text(titleLines, margin, cursorY);
        cursorY += (titleLines.length * 8) + 5;

        // Date & Category
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100); // Grey
        const dateStr = new Date(entry.date).toLocaleDateString();
        doc.text(`${dateStr} | ${entry.category}`, margin, cursorY);
        cursorY += 10;

        // Description
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        const descLines = doc.splitTextToSize(entry.description, contentWidth);
        doc.text(descLines, margin, cursorY);
        cursorY += (descLines.length * 6) + 10;

        // Images
        if (options.includeImages) {
            const imagesToLoad = entry.mediaUrls || (entry.mediaUrl ? [entry.mediaUrl] : []);

            if (imagesToLoad.length > 0) {
                // Check space remaining
                if (cursorY > pageHeight - 60) {
                    doc.addPage();
                    if (templateBase64) doc.addImage(templateBase64, 'JPEG', 0, 0, pageWidth, pageHeight);
                    cursorY = 50;
                }

                // Load first 2 images max to fit? Or all? User said "photos".
                // Let's try to fit them.
                for (const imgUrl of imagesToLoad) {
                    try {
                        const imgBase64 = await loadImage(imgUrl);
                        // Fit image to width
                        const imgProps = doc.getImageProperties(imgBase64);
                        const imgHeight = (imgProps.height * contentWidth) / imgProps.width;

                        // Check if it fits on page
                        if (cursorY + imgHeight > pageHeight - 20) {
                            doc.addPage();
                            if (templateBase64) doc.addImage(templateBase64, 'JPEG', 0, 0, pageWidth, pageHeight);
                            cursorY = 50;
                        }

                        doc.addImage(imgBase64, 'JPEG', margin, cursorY, contentWidth, imgHeight);
                        cursorY += imgHeight + 10;
                    } catch (e) {
                        console.error("Failed to load image for report", imgUrl, e);
                        doc.setFontSize(8);
                        doc.setTextColor(255, 0, 0);
                        doc.text(`[Image Load Failed: ${imgUrl}]`, margin, cursorY);
                        cursorY += 10;
                    }
                }
            }
        }
    }

    doc.save(`Dept_Timeline_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};
