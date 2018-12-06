import React from 'react';
import { Link } from 'react-router-dom';

import FeatherIcon from '../common/icon';
import '../sass/dashboard.scss';

class EndpointList extends React.Component {
  constructor(props) {
    super(props);

    this._endpointListPoll = null;

    this.state = {
      endpoints: [],
    };
  }

  componentDidMount() {
    if (!this._endpointListPoll) {
      // Start polling every 30 seconds to get new data intermittently
      // (If more endpoints get added in another window)
      this._endpointListPoll = setInterval(() => {
        // Fetch Interval, then set state
        this.fetchEndpoints();
      }, 30000);
    }

    this.fetchEndpoints();
  }

  componentWillUnmount() {
    if (this._endpointListPoll) {
      clearInterval(this._endpointListPoll);
      this._endpointListPoll = null;
    }
  }

  fetchEndpoints() {
    fetch('/__api/endpoints', {
      method: 'GET',
    })
      .then(res => res.json())
      .then(json => {
        console.log(`Received Success response: ${JSON.stringify(json)}`);
        this.setState({
          endpoints: json.endpoints,
        });
      })
      .catch(json => {
        console.log(`Received error response: ${json}`);
      });
  }

  generateDeleteHandler(id) {
    return () => {
      const prompt = `Do you really want to delete ${id ? 'this endpoint' : 'all endpoints'}?`;
      const url = `/__api/endpoints${id ? `/${id}` : ''}`;
      if (window.confirm(prompt)) {
        fetch(url, {
          method: 'DELETE',
        })
          .then(res => res.json())
          .then(json => {
            console.log(`Received Success response: ${JSON.stringify(json)}`);
            this.fetchEndpoints();
          })
          .catch(err => console.log(err));
      }
    };
  }

  renderEndpointTableRow(endpoint) {
    return (
      <tr key={endpoint.id}>
        <th scope="row">
          <Link to={`/__dashboard/endpoints/${endpoint.id}`}>{endpoint.id}</Link>
        </th>
        <td>{endpoint.method}</td>
        <td>{endpoint.route}</td>
        <td>{endpoint.status}</td>
        <td>{endpoint.body}</td>
        <td>{endpoint.redirect || 'N/A'}</td>
        <td className="text-center">
          <button
            type="button"
            className="btn btn-sm btn-block btn-danger"
            onClick={this.generateDeleteHandler(endpoint.id)}
          >
            <FeatherIcon icon="trash" />
          </button>
        </td>
      </tr>
    );
  }

  renderEndpointTable(endpoints) {
    return (
      <div className="col">
        <div className="row no-gutters">
          <table className="endpoints__table table table-bordered table-hover text-center">
            <thead className="thead-light">
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Method</th>
                <th scope="col">Route</th>
                <th scope="col">Status</th>
                <th scope="col">Body</th>
                <th scope="col">Redirect Route</th>
                <th scope="col">Delete</th>
              </tr>
            </thead>
            <tbody>{endpoints.map(this.renderEndpointTableRow, this)}</tbody>
          </table>
        </div>
        <div className="row no-gutters">
          <button type="button" className="btn btn-danger" onClick={this.generateDeleteHandler()}>
            Delete All
          </button>
        </div>
      </div>
    );
  }

  static renderEmptyEndpoints() {
    return (
      <div className="col">
        <h3>No Endpoints Found!</h3>
        Select the &quot;New&quot; button to create mock endpoints.
      </div>
    );
  }

  render() {
    const { endpoints } = this.state;
    if (endpoints.length === 0) {
      return EndpointList.renderEmptyEndpoints();
    }
    return this.renderEndpointTable(endpoints);
  }
}

export default EndpointList;
