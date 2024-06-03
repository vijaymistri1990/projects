import React, { useEffect } from "react";
import Decoreleft from "../../assets/img/decore-left.png";
import Decoreright from "../../assets/img/decore-right.png";
import { useHistory } from "react-router-dom";
import { getCookies } from '../../helper/commonFunctions';
import Skeleton from "../../components/Skeleton";

const Dashboard = () => {
  let history = useHistory();

  useEffect(() => {
    let data = getCookies('userData');
    if (data == null) {
      history.push("/login");
    } else {
      let user = JSON.parse(data)?.user
      if (user == "0") {
        history.push("/topic-list");
      }
    }
  }, [])

  return (
    <React.Fragment>
      {/* <Skeleton /> */}
      <div className="dashboard-widgets row">
        <div className="col-lg-12">
          <div className="card-widget widget-user mb-2">
            <div className="widget-user-decore">
              <div className="widget-decore-left">
                <img src={Decoreleft} alt={Decoreleft} />
              </div>
              <div className="widget-decore-right">
                <img src={Decoreright} alt={Decoreright} />
              </div>
            </div>
            <div className="card-widget-header">
              <div className="widget-icon">
                <i className="bx bx-award"></i>
              </div>
            </div>
            <div className="card-widget-body">
              <div className="widget-user-details">
                <h1 className="widget-user-title">
                  Welcome back, Administrator
                </h1>
                <p className="widget-user-description">
                  Here Your Command
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* <div className="col-lg-6">
          <div className="row">
            <div className="col-lg-6">
              <div className="card-widget mb-2">
                <div className="widget-flex">
                  <div className="widget-icon">
                    <i className="bx bx-package"></i>
                  </div>
                  <div className="card-widget-body">
                    <h1 className="widget-count">10</h1>
                    <p className="widget-name">Users</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card-widget mb-2">
                <div className="widget-flex">
                  <div className="widget-icon">
                    <i className="bx bx-file"></i>
                  </div>
                  <div className="card-widget-body">
                    <h1 className="widget-count">10</h1>
                    <p className="widget-name">Simultor</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </React.Fragment>
  );
};

export default Dashboard;
