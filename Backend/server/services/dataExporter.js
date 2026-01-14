const ExcelJS = require('exceljs');
const { createObjectCsvWriter } = require('csv-writer');
const fs = require('fs');
const path = require('path');

class DataExporter {
    constructor() {
        this.reportsDir = process.env.REPORTS_DIR || path.join(__dirname, '../reports');
        if (!fs.existsSync(this.reportsDir)) {
            fs.mkdirSync(this.reportsDir, { recursive: true });
        }
    }

    async exportToCSV(reportType, data) {
        const filename = `${reportType}-${Date.now()}.csv`;
        const filepath = path.join(this.reportsDir, filename);
        const products = data.products || [];

        if (products.length === 0) {
            // Create empty file with headers
            fs.writeFileSync(filepath, 'SKU,Name,Category,Stock,Reorder Point,Supplier,Price,Status\n');
            return { filepath, filename, fileSize: 0 };
        }

        const csvWriter = createObjectCsvWriter({
            path: filepath,
            header: [
                { id: 'sku', title: 'SKU' },
                { id: 'name', title: 'Name' },
                { id: 'category', title: 'Category' },
                { id: 'stock', title: 'Stock' },
                { id: 'reorderPoint', title: 'Reorder Point' },
                { id: 'supplier', title: 'Supplier' },
                { id: 'price', title: 'Price' },
                { id: 'status', title: 'Status' }
            ]
        });

        const records = products.map(p => ({
            sku: p.sku || 'N/A',
            name: p.name || 'N/A',
            category: p.category || 'N/A',
            stock: p.stock || 0,
            reorderPoint: p.reorderPoint || 0,
            supplier: p.supplier || 'N/A',
            price: p.price || 0,
            status: p.status || 'N/A'
        }));

        await csvWriter.writeRecords(records);
        const stats = fs.statSync(filepath);

        return {
            filepath,
            filename,
            fileSize: stats.size
        };
    }

    async exportToExcel(reportType, data) {
        const filename = `${reportType}-${Date.now()}.xlsx`;
        const filepath = path.join(this.reportsDir, filename);
        const products = data.products || [];

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Inventory Data');

        worksheet.columns = [
            { header: 'SKU', key: 'sku', width: 15 },
            { header: 'Name', key: 'name', width: 30 },
            { header: 'Category', key: 'category', width: 20 },
            { header: 'Stock', key: 'stock', width: 10 },
            { header: 'Reorder Point', key: 'reorderPoint', width: 15 },
            { header: 'Supplier', key: 'supplier', width: 25 },
            { header: 'Price', key: 'price', width: 12 },
            { header: 'Status', key: 'status', width: 15 }
        ];

        products.forEach(p => {
            worksheet.addRow({
                sku: p.sku || 'N/A',
                name: p.name || 'N/A',
                category: p.category || 'N/A',
                stock: p.stock || 0,
                reorderPoint: p.reorderPoint || 0,
                supplier: p.supplier || 'N/A',
                price: p.price || 0,
                status: p.status || 'N/A'
            });
        });

        // Style the header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        await workbook.xlsx.writeFile(filepath);
        const stats = fs.statSync(filepath);

        return {
            filepath,
            filename,
            fileSize: stats.size
        };
    }
}

module.exports = new DataExporter();
