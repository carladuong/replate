// server/concepts/reporting.ts

import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

/**
 * Interface representing a Report document.
 */
export interface ReportDoc extends BaseDoc {
  reporter: ObjectId;
  subject: ObjectId;
  message?: string;
}

/**
 * Class representing the Reporting system.
 */
export default class ReportingConcept {
  public readonly reports: DocCollection<ReportDoc>;
  private readonly REPORT_THRESHOLD: number = 2;

  /**
   * Create an instance of ReportingConcept.
   * @param reportsCollectionName - Name of the reports collection.
   */
  constructor(reportsCollectionName: string = "reports") {
    this.reports = new DocCollection<ReportDoc>(reportsCollectionName);
  }

  /**
   * Report an entity for misbehavior.
   * @param reporter - The ObjectId of the reporting entity.
   * @param subject - The ObjectId of the subject entity.
   * @param message - Optional message describing the report.
   * @returns The created report and status.
   */
  async report(reporter: ObjectId, subject: ObjectId, message?: string): Promise<{ msg: string; isReported: boolean; report?: ReportDoc }> {
    if (reporter.equals(subject)) {
      throw new NotAllowedError("You cannot report yourself.");
    }

    const existingReport = await this.reports.readOne({ reporter, subject });
    if (existingReport) {
      throw new NotAllowedError("You have already reported this entity.");
    }

    const _id = await this.reports.createOne({
      reporter,
      subject,
      message,
    });
    const newReport = await this.reports.readOne({ _id });
    if (!newReport) {
      throw new NotFoundError("Failed to create report.");
    }

    const numberOfReports = await this.getNumberOfReports(subject);
    const isReported = numberOfReports >= this.REPORT_THRESHOLD;

    return { msg: "Report successfully created!", isReported, report: newReport };
  }

  /**
   * Check if a subject is reported.
   * @param subject - The ObjectId of the subject entity.
   * @returns True if reported, false otherwise.
   */
  async checkIfUserReported(subject: ObjectId): Promise<boolean> {
    const count = await this.getNumberOfReports(subject);
    return count >= this.REPORT_THRESHOLD;
  }

  /**
   * Get the number of reports for a subject.
   * @param subject - The ObjectId of the subject entity.
   * @returns The number of reports.
   */
  async getNumberOfReports(subject: ObjectId): Promise<number> {
    const reports = await this.reports.readMany({ subject });
    return reports.length;
  }

  /**
   * Get all reports for a subject.
   * @param subject - The ObjectId of the subject entity.
   * @returns An array of ReportDoc.
   */
  async getReportsForSubject(subject: ObjectId): Promise<ReportDoc[]> {
    return await this.reports.readMany({ subject });
  }

  /**
   * Get all reports made by a reporter.
   * @param reporter - The ObjectId of the reporter entity.
   * @returns An array of ReportDoc.
   */
  async getReportsByReporter(reporter: ObjectId): Promise<ReportDoc[]> {
    return await this.reports.readMany({ reporter });
  }

  /**
   * Remove a report.
   * @param reportId - The ObjectId of the report to remove.
   * @returns Success message.
   */
  async removeReport(reportId: ObjectId): Promise<{ msg: string }> {
    const report = await this.reports.readOne({ _id: reportId });
    if (!report) {
      throw new NotFoundError("Report not found.");
    }
    await this.reports.deleteOne({ _id: reportId });
    return { msg: "Report successfully removed." };
  }
}
