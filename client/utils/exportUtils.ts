// utils/exportUtils.ts
import * as XLSX from "xlsx";

export function exportToCsv(data: any[], fileName: string) {
  if (!data?.length) {
    console.warn("No data to export");
    return;
  }

  const csvRows: string[] = [];

  // Headers
  const headers = Object.keys(data[0]);
  csvRows.push(headers.join(","));

  // Rows
  for (const row of data) {
    const values = headers.map((h) => {
      let val = row[h];

      // Handle null/undefined
      if (val === null || val === undefined) {
        return "";
      }

      // Handle dates
      if (val instanceof Date) {
        val = val.toISOString();
      }

      // Handle objects/arrays
      if (typeof val === "object") {
        val = JSON.stringify(val);
      }

      // Escape strings
      if (typeof val === "string") {
        val = `"${val.replace(/"/g, '""')}"`;
      }

      return val;
    });
    csvRows.push(values.join(","));
  }

  // Blob & download
  const blob = new Blob([csvRows.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url); // Clean up
}

export function exportToExcel(data: any[], fileName: string) {
  if (!data?.length) {
    console.warn("No data to export");
    return;
  }

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Get range of worksheet
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");

  // Style configuration
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "4472C4" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } },
    },
  };

  const cellStyle = {
    alignment: { horizontal: "left", vertical: "center", wrapText: true },
    border: {
      top: { style: "thin", color: { rgb: "D3D3D3" } },
      bottom: { style: "thin", color: { rgb: "D3D3D3" } },
      left: { style: "thin", color: { rgb: "D3D3D3" } },
      right: { style: "thin", color: { rgb: "D3D3D3" } },
    },
  };

  // Apply header styles
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellAddress]) continue;
    worksheet[cellAddress].s = headerStyle;
  }

  // Apply cell styles
  for (let row = 1; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = cellStyle;
    }
  }

  // Calculate column widths
  const colWidths: { wch: number }[] = [];
  const headers = Object.keys(data[0]);

  headers.forEach((header, index) => {
    let maxWidth = header.length;

    // Check all rows for max width
    data.forEach((row) => {
      const cellValue = row[header];
      if (cellValue) {
        const cellLength = String(cellValue).length;
        maxWidth = Math.max(maxWidth, cellLength);
      }
    });

    // Set width with some padding (min: 10, max: 50)
    colWidths[index] = { wch: Math.min(Math.max(maxWidth + 2, 10), 50) };
  });

  worksheet["!cols"] = colWidths;

  // Set row height for header
  worksheet["!rows"] = [{ hpt: 25 }]; // 25 points height for header row

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Write file
  XLSX.writeFile(workbook, `${fileName}.xlsx`, {
    bookType: "xlsx",
    bookSST: true,
    type: "binary",
  });
}

// Optional: Helper function to format data before export
export function prepareDataForExport(
  data: any[],
  columnMapping?: Record<string, string>,
) {
  if (!data?.length) return [];

  return data.map((row) => {
    const newRow: any = {};

    Object.entries(row).forEach(([key, value]) => {
      // Use column mapping if provided (e.g., { firstName: "First Name" })
      const columnName = columnMapping?.[key] || key;

      // Format values
      if (value instanceof Date) {
        newRow[columnName] = value.toLocaleDateString();
      } else if (typeof value === "boolean") {
        newRow[columnName] = value ? "Yes" : "No";
      } else if (value === null || value === undefined) {
        newRow[columnName] = "";
      } else {
        newRow[columnName] = value;
      }
    });

    return newRow;
  });
}
