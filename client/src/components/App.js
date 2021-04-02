import React, { Suspense } from 'react';
import { Route, Switch } from "react-router-dom";
import Auth from "../hoc/auth";
// pages for this product
import MainPage from "./views/MainPage/MainPage.js";
import LoginPage from "./views/LoginPage/LoginPage.js";
import RegisterPage from "./views/RegisterPage/RegisterPage.js";



//null   Anyone Can go inside
//true   only logged in user can go inside
//false  logged in user can't go inside

function App() {
  return (
    <Suspense fallback={(<div>Loading...</div>)}>
      {/*style={{ paddingTop: '69px', minHeight: 'calc(100vh - 80px)' }} */}
      <div >
        <Switch>
          <Route exact path="/main" component={Auth(MainPage, true)} />
          <Route exact path="/" component={Auth(LoginPage, null)} />
          <Route exact path="/register" component={Auth(RegisterPage, false)} />
        </Switch>
      </div>
      
    </Suspense>
  );
}

export default App;
