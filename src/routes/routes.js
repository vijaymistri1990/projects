import Signin from "../pages/auth/Signin";
import Dashboard from "../pages/admin/Dashboard";
import Products from "../pages/admin/User";
import AddProduct from "../pages/admin/AddProduct";
import Createuser from "../pages/admin/Createuser";
import UpdatePassword from "../pages/admin/UpdatePassword";
import Simulater from "../pages/admin/simulator";
import Addsimulator from "../pages/admin/simulator/Addsimulator";
import Simulator from "../pages/auth/Simulator";
import TopicList from "../pages/auth/TopicList";
import PerformanceList from "../pages/auth/PerformanceList";
import WorkHourList from "../pages/auth/WorkHourList";
import TopiclistAdmin from "../pages/admin/simulator/Topiclist";
import AddsimulatorTopic from "../pages/admin/simulator/AddsimulatorTopic";
import { useEffect, React } from "react";
// import React from 'react'
import { useHistory } from "react-router-dom";


const authRoutes = [
  { path: "/simulator/:simulator_id", component: Simulator },
  { path: "/topic-list", component: TopicList },
  { path: "/performance-list", component: PerformanceList },
  { path: "/work-hour-list", component: WorkHourList },
  { path: "/login", component: Signin }
];

const adminRoutes = [
  { path: "/admin/dashboard", component: Dashboard },
  { path: "/admin/user", component: Products },
  { path: "/admin/user/create", component: Createuser },
  { path: "/admin/user/edit", component: Createuser },
  { path: "/admin/user/password", component: UpdatePassword },
  { path: "/admin/simulator", component: Simulater },
  { path: "/admin/add-simulator", component: Addsimulator },
  { path: "/admin/simulator/topic", component: TopiclistAdmin },
  { path: "/admin/simulator/add-topic", component: AddsimulatorTopic }
];

export { authRoutes, adminRoutes };
