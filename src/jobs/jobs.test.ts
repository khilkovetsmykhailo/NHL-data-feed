import NHLCronManager from ".";
import * as sinon from "sinon";
import Axios from "axios";

describe("NHLCronManager", () => {
  let nhlCronManager: NHLCronManager;
  let monitorScheduleSpy: sinon.SinonSpy;

  beforeEach(() => {
    nhlCronManager = new NHLCronManager();
    monitorScheduleSpy = sinon.spy(nhlCronManager, "monitorSchedule");
  });

  afterEach(() => {
    nhlCronManager.stop();
    sinon.restore();
  });

  it("should start monitorSchedule job", async () => {
    nhlCronManager.start();
    await new Promise((resolve) => setTimeout(resolve, 4000));

    expect(nhlCronManager.listJobs().length).toBe(1);
    expect(nhlCronManager["jobs"]["monitorSchedule"].running).toBe(true);
  });

  it("should start ingestGame job when game goes live", async () => {
    const axiosStub = sinon.stub(Axios, "get");

    sinon
      .stub(nhlCronManager["gameController"], "getGames")
      .resolves([{ id: 1, state: "Preview", date: "2023-04-10" }]);

    axiosStub.resolves({
      data: { dates: [{ games: [{ gamePk: 1, status: { abstractGameState: "Live", gameDate: new Date() } }] }] },
    });

    nhlCronManager.start();

    await new Promise((resolve) => setTimeout(resolve, 4000));

    expect(nhlCronManager["jobs"]["ingest-1"].running).toBe(true);
  });
});
