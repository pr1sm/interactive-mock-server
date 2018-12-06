import React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import * as feather from 'feather-icons';

import './sass/dashboard.scss';
import Navbar from './common/navbar';
import Sidebar from './common/sidebar';
import Home from './home';
import Logs from './logs';
import Endpoints from './endpoints';

export class App extends React.Component {
  componentDidMount() {
    feather.replace();
  }

  render() {
    return (
      <Router>
        <div>
          <Navbar />
          <div className="container-fluid">
            <div className="row">
              <Sidebar />
              <main role="main" className="col col-md-9 ml-sm-auto col-lg-10 px-4">
                <Switch>
                  <Route exact path="/__dashboard" component={Home} />
                  <Route path="/__dashboard/endpoints" component={Endpoints} />
                  <Route path="/__dashboard/logs" component={Logs} />
                  <Redirect exact from="/" to="/__dashboard" />
                </Switch>
              </main>
            </div>
          </div>
        </div>
      </Router>
    );
  }
}

const createApp = () => <App />;

export default createApp;
