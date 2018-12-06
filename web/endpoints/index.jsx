import React from 'react';
import PropTypes from 'prop-types';
import { Link, Route, Switch } from 'react-router-dom';
import * as feather from 'feather-icons';

import NewEndpoint from './new';
import EndpointList from './list';
import EndpointDetail from './detail';

class Endpoints extends React.Component {
  static get propTypes() {
    return {
      match: PropTypes.objectOf(PropTypes.any).isRequired,
    };
  }

  componentDidMount() {
    feather.replace();
  }

  render() {
    const { match } = this.props;
    return (
      <div>
        <div className="row d-flex justify-content-between flex-wrap flex-md-wrap align-items-center pt-3 pb-2 mb-3 border-bottom">
          <div className="col">
            <h1 className="h2">Endpoints</h1>
          </div>
          <div className="col-4 col-md-3 col-lg-2 text-right">
            <Link to="/__dashboard/endpoints/new">
              <button type="button" className="btn btn-primary">
                <span data-feather="plus-circle" />
                &nbsp;&nbsp;New
              </button>
            </Link>
          </div>
        </div>
        <div className="row d-flex flex-wrap flex-md-wrap align-items-center">
          <Switch>
            <Route exact path={`${match.url}/new`} component={NewEndpoint} />
            <Route exact path={`${match.url}/:id`} component={EndpointDetail} />
            <Route component={EndpointList} />
          </Switch>
        </div>
      </div>
    );
  }
}

export default Endpoints;
