import { CronJob } from "cron";
import { appendFileSync } from "fs";

export default class NHLCronManager {
  private jobs: { [key: string]: CronJob } = {};

  constructor() {
    this.addJob("monitorSchedule", "* * * * * *", this.monitorSchedule);
  }

  async monitorSchedule() {
    appendFileSync("output.log", new Date().toISOString(), "utf-8");
  }

  async ingestGame(id: string) {}

  private addJob(name: string, schedule: string, callback: () => void): void {
    const job = new CronJob(schedule, callback);
    this.jobs[name] = job;
  }

  private removeJob(name: string): void {
    const job: CronJob = this.jobs[name];
    if (job) {
      job.stop();
      delete this.jobs[name];
    }
  }

  public listJobs(): { name: string; schedule: string }[] {
    const jobs = [];
    for (const name in this.jobs) {
      const job = this.jobs[name];
      jobs.push({ name, schedule: job.nextDate() });
    }
    return jobs;
  }

  public start(): void {
    this.jobs["monitorSchedule"].start();
  }

  public stop(): void {
    for (const name in this.jobs) {
      this.jobs[name].stop();
    }
  }
}
