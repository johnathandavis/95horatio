import React from 'react';
import {
  Switch,
  Route
} from "react-router-dom";
import * as pages from './pages';

export default function ContentRouter() {
  return (
      <div style={{width: '100%', height: '100%'}}>
        <Switch>
          <Route path="/chat">
            <pages.ChatPage />
          </Route>
          <Route path="/kudos">
            <pages.KudosPage />
          </Route>
          <Route path="/live">
            <pages.LivePage />
          </Route>
          <Route path="/tasks">
            <pages.TasksPage />
          </Route>
          <Route path="/">
            <pages.HomePage />
          </Route>
        </Switch>
      </div>
  );
}