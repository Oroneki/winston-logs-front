import React, { Component } from "react";
import axios from "axios";
import "./App.scss";
import { tempdata } from "./temp_data";
import { Chart } from "chart.js";

const API_ENDPOINT = "http://localhost:5000/api";

type Level = "debug" | "info" | "warn" | "error" | "verbose";

type Worker = 0 | 1 | 2 | 3;

const levels = new Set(["debug", "info", "warn", "error", "verbose"]);
const workers = new Set([0, 1, 2, 3]);

const getLevelClass = (level: Level) => {
  return `col-level-${level}`;
};

const getThreadClass = (thread: Worker) => {
  return `col-thread-${thread}`;
};

const getThreadText = (thread: Worker) => {
  switch (thread) {
    case 0:
      return <i className="far fa-eye" />;
    case 1:
      return <i className="fas fa-brain" />;
    case 2:
      return <i className="fas fa-wifi" />;

    case 3:
      return <i className="fas fa-futbol" />;
  }
};

const getOffset = (w: Worker) => {
  switch (w) {
    case 0:
      return "";
    case 1:
      return "is-offset-2";
    case 2:
      return "is-offset-4";
    case 3:
      return "is-offset-6";

    default:
      return "";
  }
};

const getbgColor = (l: Level) => {
  switch (l) {
    case "debug":
      return "has-background-grey";
    case "info":
      return "has-background-primary";
    case "error":
      return "has-background-danger";
    case "warn":
      return "has-background-warning";
    case "verbose":
      return "has-background-info";

    default:
      break;
  }
};

export interface IApiEntry {
  id: number;
  ctx?: string;
  message: string;
  w: number;
  mhu: number;
  mht: number;
  mrss: number;
  t: string;
  l: string;
  ct: number;
  cl: number;
  p?: string;
}

const apiCall = async (page: number = 1, level?: Level, worker?: Worker) => {
  return await axios.get(API_ENDPOINT, {
    params: {
      page,
      level,
      worker
    }
  });
};

const dataTransf = (
  dataArr: IApiEntry[],
  filter: Worker,
  key: keyof IApiEntry
): number[] => {
  return dataArr.map(e => (e.w === filter ? e[key] : Number.NaN)) as number[];
};

interface IAppState {
  entries: IApiEntry[];
  page: number;
  worker: Worker | undefined;
  level: Level | undefined;
  // data: number[];
}

class App extends Component<{}, IAppState> {
  public canvas: React.RefObject<HTMLCanvasElement>;

  constructor(props: {}) {
    super(props);
    this.state = {
      entries: tempdata,
      // entries: [],
      page: 1,
      worker: undefined,
      level: undefined
    };
    this.canvas = React.createRef();
  }

  apiCall = async () => {
    const res = await apiCall(
      this.state.page,
      this.state.level,
      this.state.worker
    );
    console.log("RES:", res);
    this.setState(
      {
        entries: res.data
      },
      this.updateChart
    );
  };

  updateChart() {
    console.log("didMount:", this.canvas);
    const key: keyof IApiEntry = "mhu";
    var myChart = new Chart(this.canvas.current!, {
      type: "line",
      options: {
        responsive: true,
        scales: {
          yAxes: [
            {
              stacked: true
            }
          ]
        }
      },
      data: {
        datasets: [
          // { data: this.state.entries.map(e => e.memory_rss), label: "rss" },
          // {
          //   data: this.state.entries.map(e => e.memory_heap_used),
          //   label: "hused"
          // },
          // {
          //   data: this.state.entries.map(e => e.memory_external),
          //   label: "ext"
          // },
          {
            data: dataTransf(this.state.entries, 0, key) as number[],
            label: "_main_mhu"
          },
          {
            data: dataTransf(this.state.entries, 1, key) as number[],
            label: "_1_mhu"
          },
          {
            data: dataTransf(this.state.entries, 3, key) as number[],
            label: "_3_mhu"
          }
        ]
      }
    });
  }

  render() {
    console.log("ref, ", this.canvas);
    return (
      <div className="App">
        <section>
          <div className="columns">
            <div className="column">
              <button className="button" onClick={this.apiCall}>
                {this.state.page} | {this.state.worker} | {this.state.level}
              </button>
            </div>
            <div className="column field is-one-fifth is-centered">
              <div className="control">
                <input
                  className="input"
                  type="number"
                  value={this.state.page}
                  onChange={e =>
                    this.setState({ page: parseInt(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="column field is-one-fifth is-centered">
              <div className="control">
                <div className="select">
                  <select
                    value={this.state.level}
                    onChange={e => {
                      const val = (e.nativeEvent.target as any).value;
                      const res = levels.has(val) ? val : undefined;
                      console.log(val, res);
                      this.setState({
                        level: res
                      });
                    }}
                  >
                    <option value={undefined}>-----</option>
                    <option value="debug">Debug</option>
                    <option value="info">Info</option>
                    <option value="error">Error</option>
                    <option value="verbose">Verbose</option>
                    <option value="warn">Warn</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="column field is-one-fifth is-centered">
              <div className="control">
                <div className="select">
                  <select
                    value={this.state.worker}
                    onChange={e => {
                      const val = (e.nativeEvent.target as any).value;
                      const res = workers.has(val) ? val : undefined;
                      console.log(val, res);
                      this.setState({
                        worker: res
                      });
                    }}
                  >
                    <option value={undefined}>-----</option>
                    <option value={0}>Main</option>
                    <option value={1}>Strategy</option>
                    <option value={2}>Communicator</option>
                    <option value={3}>Api</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="chart">
          <canvas
            className="canvas"
            ref={this.canvas}
            id="canvas"
            width="100"
            height="15"
          />
        </section>
        <section>
          <Listao entries={this.state.entries} />
        </section>
      </div>
    );
  }
}

class Listao extends Component<{ entries: IApiEntry[] }> {
  render() {
    return (
      <div className="container">
        {this.props.entries.map(e => (
          <LogEntryView entry={e} key={e.id} />
        ))}
      </div>
    );
  }
}

class LogEntryView extends Component<{ entry: IApiEntry }> {
  render() {
    const card = (
      <div
        className={`column is-6 has-background-info ${getbgColor(this.props
          .entry.l as Level)}`}
      >
        <div className="card has-background-light">
          <div className="card-content">
            <div className="content">
              <span className="is-size-6 has-text-weight-bold">
                {this.props.entry.ctx}
              </span>
              <br />
              <span className="is-size-6">{this.props.entry.p}</span>
              <br />
              <p className="is-size-6">{this.props.entry.message}</p>
            </div>
          </div>
        </div>
      </div>
    );

    const workerInfo = (
      <div className="column is-2">
        <p className="is-size-1 has-text-grey-light">
          {getThreadText(this.props.entry.w as Worker)}
        </p>
      </div>
    );

    const timestamp = (
      <div className="column is-2 has-text-grey">{this.props.entry.t}</div>
    );

    const extra = (
      <div className="column is-2 has-text-grey-light is-size-7">
        <p> {this.props.entry.l} </p>
      </div>
    );

    return (
      <>
        <div className="columns is-vcentered">
          {this.props.entry.w === 0
            ? [card, workerInfo, extra, timestamp]
            : this.props.entry.w === 1
            ? [workerInfo, card, extra, timestamp]
            : this.props.entry.w === 2
            ? [timestamp, workerInfo, card, extra]
            : [timestamp, extra, workerInfo, card]}
        </div>
        <div className="columns is-vcentered">
          <div className="column" />
        </div>
      </>
    );
  }
}

export default App;
