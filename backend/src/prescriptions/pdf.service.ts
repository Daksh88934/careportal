import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class PdfService {
  constructor(private configService: ConfigService) {}

  async generatePrescriptionPdf(prescription: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });

        // Header with clinic/hospital info
        this.addHeader(doc);

        // Doctor and patient information
        this.addDoctorPatientInfo(doc, prescription);

        // Prescription details
        this.addPrescriptionDetails(doc, prescription);

        // Medicines table
        this.addMedicinesTable(doc, prescription);

        // Instructions and notes
        this.addInstructionsAndNotes(doc, prescription);

        // Footer with digital signature and verification
        this.addFooter(doc, prescription);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private addHeader(doc: PDFKit.PDFDocument) {
    // Clinic/Hospital Header
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .fillColor('#0F62FE')
      .text('TeleMed Healthcare Platform', 50, 50);

    doc
      .fontSize(12)
      .font('Helvetica')
      .fillColor('#333333')
      .text('Digital Prescription', 50, 75);

    // Add logo placeholder (in production, you'd add actual logo)
    doc.rect(450, 45, 80, 40).stroke('#0F62FE');

    doc.fontSize(10).text('LOGO', 480, 60);

    // Prescription ID and date
    doc
      .fontSize(10)
      .text(`Prescription ID: ${prescription.id}`, 50, 110)
      .text(
        `Date: ${new Date(prescription.createdAt).toLocaleDateString()}`,
        50,
        125
      );

    // Add a line separator
    doc.moveTo(50, 150).lineTo(550, 150).stroke('#CCCCCC');
  }

  private addDoctorPatientInfo(doc: PDFKit.PDFDocument, prescription: any) {
    const startY = 170;

    // Doctor Information
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#0F62FE')
      .text('Doctor Information', 50, startY);

    doc
      .fontSize(11)
      .font('Helvetica')
      .fillColor('#333333')
      .text(`Dr. ${prescription.appointment.doctor.user.name}`, 50, startY + 20)
      .text(
        `Specialization: ${prescription.appointment.doctor.specialization}`,
        50,
        startY + 35
      )
      .text(
        `License: ${prescription.appointment.doctor.licenseNumber}`,
        50,
        startY + 50
      )
      .text(
        `Email: ${prescription.appointment.doctor.user.email}`,
        50,
        startY + 65
      );

    // Patient Information
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#0F62FE')
      .text('Patient Information', 300, startY);

    doc
      .fontSize(11)
      .font('Helvetica')
      .fillColor('#333333')
      .text(
        `Name: ${prescription.appointment.patient.user.name}`,
        300,
        startY + 20
      )
      .text(
        `Age: ${this.calculateAge(prescription.appointment.patient.dateOfBirth)} years`,
        300,
        startY + 35
      )
      .text(
        `Gender: ${prescription.appointment.patient.gender}`,
        300,
        startY + 50
      )
      .text(
        `Phone: ${prescription.appointment.patient.user.phone}`,
        300,
        startY + 65
      );

    // Add separator line
    doc
      .moveTo(50, startY + 90)
      .lineTo(550, startY + 90)
      .stroke('#CCCCCC');
  }

  private addPrescriptionDetails(doc: PDFKit.PDFDocument, prescription: any) {
    const startY = 280;

    // Diagnosis
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#0F62FE')
      .text('Diagnosis', 50, startY);

    doc
      .fontSize(11)
      .font('Helvetica')
      .fillColor('#333333')
      .text(prescription.diagnosis, 50, startY + 20, { width: 500 });

    // Symptoms
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#0F62FE')
      .text('Symptoms', 50, startY + 60);

    doc
      .fontSize(11)
      .font('Helvetica')
      .fillColor('#333333')
      .text(prescription.symptoms, 50, startY + 80, { width: 500 });
  }

  private addMedicinesTable(doc: PDFKit.PDFDocument, prescription: any) {
    const startY = 420;

    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#0F62FE')
      .text('Prescribed Medicines', 50, startY);

    // Table headers
    const tableTop = startY + 30;
    const tableHeaders = [
      'Medicine',
      'Dosage',
      'Frequency',
      'Duration',
      'Instructions',
    ];
    const columnWidths = [120, 80, 80, 80, 140];
    let currentX = 50;

    // Draw table header
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#FFFFFF');

    // Header background
    doc.rect(50, tableTop, 500, 20).fill('#0F62FE');

    // Header text
    tableHeaders.forEach((header, index) => {
      doc.text(header, currentX + 5, tableTop + 5, {
        width: columnWidths[index] - 10,
      });
      currentX += columnWidths[index];
    });

    // Table rows
    let currentY = tableTop + 25;
    doc.fillColor('#333333').font('Helvetica');

    prescription.prescriptionMedicines.forEach(
      (prescMed: any, index: number) => {
        const rowHeight = 25;

        // Alternate row colors
        if (index % 2 === 0) {
          doc.rect(50, currentY - 2, 500, rowHeight).fill('#F8F9FA');
        }

        currentX = 50;
        const rowData = [
          prescMed.medicine.name,
          prescMed.dosage,
          prescMed.frequency,
          prescMed.duration,
          prescMed.instructions || '-',
        ];

        rowData.forEach((data, colIndex) => {
          doc.fillColor('#333333').text(data, currentX + 5, currentY + 5, {
            width: columnWidths[colIndex] - 10,
            height: rowHeight - 10,
          });
          currentX += columnWidths[colIndex];
        });

        currentY += rowHeight;
      }
    );

    // Table border
    doc.rect(50, tableTop, 500, currentY - tableTop).stroke('#CCCCCC');

    // Vertical lines
    currentX = 50;
    tableHeaders.forEach((_, index) => {
      if (index > 0) {
        doc
          .moveTo(currentX, tableTop)
          .lineTo(currentX, currentY)
          .stroke('#CCCCCC');
      }
      currentX += columnWidths[index];
    });
  }

  private addInstructionsAndNotes(doc: PDFKit.PDFDocument, prescription: any) {
    const startY = 600;

    // General Instructions
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#0F62FE')
      .text('General Instructions', 50, startY);

    doc
      .fontSize(11)
      .font('Helvetica')
      .fillColor('#333333')
      .text(prescription.instructions, 50, startY + 20, { width: 500 });

    // Follow-up date
    if (prescription.followUpDate) {
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#D4AF37')
        .text(
          `Follow-up Date: ${new Date(prescription.followUpDate).toLocaleDateString()}`,
          50,
          startY + 60
        );
    }

    // Additional Notes
    if (prescription.notes) {
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#0F62FE')
        .text('Additional Notes', 50, startY + 90);

      doc
        .fontSize(11)
        .font('Helvetica')
        .fillColor('#333333')
        .text(prescription.notes, 50, startY + 110, { width: 500 });
    }
  }

  private addFooter(doc: PDFKit.PDFDocument, prescription: any) {
    const pageHeight = doc.page.height;
    const footerY = pageHeight - 120;

    // Digital signature section
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#0F62FE')
      .text('Digital Signature', 50, footerY);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#333333')
      .text(
        `Digitally signed by: Dr. ${prescription.appointment.doctor.user.name}`,
        50,
        footerY + 20
      )
      .text(
        `Date & Time: ${new Date(prescription.createdAt).toLocaleString()}`,
        50,
        footerY + 35
      )
      .text(`Prescription ID: ${prescription.id}`, 50, footerY + 50);

    // Verification QR code placeholder
    doc.rect(400, footerY, 60, 60).stroke('#CCCCCC');

    doc
      .fontSize(8)
      .text('QR Code for', 405, footerY + 20)
      .text('Verification', 405, footerY + 30);

    // Legal disclaimer
    doc
      .fontSize(8)
      .fillColor('#666666')
      .text(
        'This is a digitally generated prescription. For verification, scan the QR code or visit our portal.',
        50,
        footerY + 75
      )
      .text(
        'This prescription is valid for 30 days from the date of issue.',
        50,
        footerY + 85
      );

    // Platform branding
    doc
      .fontSize(8)
      .fillColor('#0F62FE')
      .text(
        'Generated by TeleMed Healthcare Platform - Secure Digital Prescriptions',
        50,
        footerY + 100
      );
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  async generatePrescriptionSummaryPdf(prescriptions: any[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });

        // Header
        doc
          .fontSize(18)
          .font('Helvetica-Bold')
          .fillColor('#0F62FE')
          .text('Prescription Summary Report', 50, 50);

        doc
          .fontSize(12)
          .font('Helvetica')
          .fillColor('#333333')
          .text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 80);

        // Summary table
        let currentY = 120;
        prescriptions.forEach((prescription, index) => {
          if (currentY > 700) {
            doc.addPage();
            currentY = 50;
          }

          doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .text(
              `${index + 1}. Prescription ID: ${prescription.id}`,
              50,
              currentY
            );

          doc
            .fontSize(10)
            .font('Helvetica')
            .text(
              `Date: ${new Date(prescription.createdAt).toLocaleDateString()}`,
              70,
              currentY + 15
            )
            .text(
              `Patient: ${prescription.appointment.patient.user.name}`,
              70,
              currentY + 30
            )
            .text(`Diagnosis: ${prescription.diagnosis}`, 70, currentY + 45);

          currentY += 70;
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
