import React from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import { adminRoutes, authRoutes } from "./routes/routes";
import Authlayout from "./layout/Authlayout";
import Adminlayout from "./layout/Adminlayout";
import 'bootstrap/dist/css/bootstrap.min.css';
// Multi-layout function
const AppRoute = ({ component: Component, layout: Layout, exact, ...rest }) => (
  <Route
    {...rest}
    render={(props) => (
      <Layout>
        <Component {...props}></Component>
      </Layout>
    )}
    exact
  ></Route>
);

function App() {
  return (
    <Router>
      <Switch>
        {authRoutes.map((route, idx) => (
          <AppRoute
            key={idx}
            path={route.path}
            component={route.component}
            layout={Authlayout}
            exact={true}
          />
        ))}
        {adminRoutes.map((route, idx) => (
          <AppRoute
            key={idx}
            path={route.path}
            component={route.component}
            layout={Adminlayout}
            exact={true}
          />
        ))}
        <Redirect strict from="/" to="/login" />
      </Switch>
    </Router>
  );
}

export default App;
